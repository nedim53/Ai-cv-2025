"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
} from "@mui/material"
import { 
  TrendingUp, 
  People, 
  Work, 
  Assessment, 
  Edit, 
  Delete, 
  Visibility,
  CalendarToday,
  Business,
  LocationOn
} from "@mui/icons-material"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import Link from "next/link"
import useUser from "@/lib/useUser"
import MarkdownViewer from "@/components/MarkdownViewer"

export default function Statistic() {
  const { user, loading: userLoading } = useUser()
  const [realUserId, setRealUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [jobStats, setJobStats] = useState([])
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [sortBy, setSortBy] = useState("latest")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editJob, setEditJob] = useState({
    id: null,
    title: "",
    company: "",
    description: "",
    info: "",
    task: "",
    city: "",
    note: "",
    email: "",
    telephone: "",
    date: "",
    cv: false,
    experience: false,
  })

  const handleEditClick = (job) => {
    setEditJob({ ...job })
    setEditDialogOpen(true)
  }

  const handleFieldChange = (field, value) => {
    setEditJob((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async () => {
    const { id, title, company, description, info, task, city, note, email, telephone, date, cv, experience } = editJob

    const { error } = await supabase
      .from("jobs")
      .update({
        title,
        company,
        description,
        info,
        task,
        city,
        note,
        email,
        telephone,
        date,
        cv,
        experience,
      })
      .eq("id", id)
      .eq("user_id", realUserId || user.id)

    if (error) {
      console.error("UPDATE ERROR:", error)
      setSnackbar({ open: true, message: "Greška pri uređivanju.", severity: "error" })
    } else {
      setSnackbar({ open: true, message: "Uspješno uređeno!", severity: "success" })
      setEditDialogOpen(false)
      location.reload()
    }
  }

  const handleDeleteJob = async (jobId) => {
    const confirmed = confirm("Da li si siguran da želiš obrisati oglas?")
    if (!confirmed) return

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("user_id", realUserId || user.id)

    if (error) {
      setSnackbar({ open: true, message: "Greška pri brisanju.", severity: "error" })
    } else {
      setSnackbar({ open: true, message: "Oglas obrisan.", severity: "success" })
      location.reload()
    }
  }

  useEffect(() => {
    const fetchRealUserId = async () => {
      if (!user?.email) return

      const { data, error } = await supabase.from("users").select("id").eq("email", user.email).maybeSingle()

      if (data?.id) {
        setRealUserId(data.id)
      } else {
        console.error("Nema usera sa tim emailom:", error)
      }
    }

    fetchRealUserId()
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !realUserId) return

      if (user.role === "hr") {
        const { data: jobs } = await supabase.from("jobs").select("*").eq("user_id", realUserId)

        const stats = await Promise.all(
          (jobs || []).map(async (job) => {
            const { data: applications } = await supabase
              .from("application_analysis")
              .select("id, analysis, user_id, score, created_at")
              .eq("job_id", job.id)

            const enriched = await Promise.all(
              (applications || []).map(async (app) => {
                const { data: u } = await supabase
                  .from("users")
                  .select("name, surname, cv_url")
                  .eq("id", app.user_id)
                  .maybeSingle()

                return {
                  ...app,
                  user: {
                    name: u?.name || "Nepoznat",
                    surname: u?.surname || "",
                    cv_url: u?.cv_url || null,
                  },
                }
              }),
            )

            return {
              ...job,
              applications: enriched,
            }
          }),
        )

        setJobStats(stats)
      } else if (user.role === "user") {
        const { data: applications, error } = await supabase
          .from("application_analysis")
          .select("id, job_id, score, analysis, created_at")
          .eq("user_id", realUserId)

        const enriched = await Promise.all(
          (applications || []).map(async (app) => {
            const { data: job } = await supabase
              .from("jobs")
              .select("title, company, date")
              .eq("id", app.job_id)
              .maybeSingle()

            return {
              ...app,
              job: job || { title: "Nepoznat posao", company: "", date: new Date() },
            }
          }),
        )

        setJobStats(enriched)
      }

      setLoading(false)
    }

    if (!userLoading && realUserId) {
      fetchData()
    }
  }, [realUserId, user, userLoading])

  if (loading || userLoading) {
    return (
      <Box sx={{ 
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <CircularProgress sx={{ color: "#e50914" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <Typography sx={{ color: "#ff4d4d", fontSize: "1.2rem" }}>
          Morate biti prijavljeni da pristupite statistikama.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
      minHeight: "100vh", 
      color: "#fff",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(45deg, rgba(220, 38, 38, 0.05) 0%, transparent 50%, rgba(220, 38, 38, 0.02) 100%)",
        pointerEvents: "none",
      },
    }}>
      <Navbar user={user} loading={userLoading} />

      <Box sx={{ p: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2, 
              color: "#e50914",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 0 20px rgba(229, 9, 20, 0.3)"
            }}
          >
            📊 Statistike
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#aaa", 
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            {user.role === "hr" 
              ? "Pratite performanse svojih poslova i aplikacije kandidata" 
              : "Pogledajte svoje prijave i AI analize kompatibilnosti"
            }
          </Typography>

          {/* Sort Controls */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Paper sx={{
              p: 2,
              background: "rgba(31, 31, 31, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
            }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(229, 9, 20, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                }}
              >
                {user?.role === "hr" ? (
                  <>
                    <option value="latest">🕒 Najnovije</option>
                    <option value="oldest">🕒 Najstarije</option>
                  </>
                ) : (
                  <>
                    <option value="latest">🕒 Najnovije</option>
                    <option value="oldest">🕒 Najstarije</option>
                    <option value="score_desc">🔼 Ocjena: Najviša</option>
                    <option value="score_asc">🔽 Ocjena: Najniža</option>
                  </>
                )}
              </select>
            </Paper>
          </Box>
        </Box>

        {/* Content */}
        {user.role === "hr" ? (
          jobStats.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Work sx={{ fontSize: 80, color: "#666", mb: 2 }} />
              <Typography sx={{ color: "#999", fontSize: "1.2rem" }}>
                Nemaš objavljenih konkursa.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {[...jobStats]
                .sort((a, b) => {
                  switch (sortBy) {
                    case "oldest":
                      return new Date(a.created_at) - new Date(b.created_at)
                    case "latest":
                    default:
                      return new Date(b.created_at) - new Date(a.created_at)
                  }
                })
                .map((job, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{
                      background: "rgba(31, 31, 31, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(229, 9, 20, 0.3)",
                      borderRadius: 3,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                      transition: "all 0.3s ease",
                      height: "500px",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(229, 9, 20, 0.4)",
                      },
                    }}>
                      <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                          <Box>
                            <Typography variant="h5" sx={{ color: "#e50914", fontWeight: "600", mb: 1 }}>
                              📌 {job.title}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                              <Chip 
                                icon={<Business />} 
                                label={job.company} 
                                sx={{ 
                                  bgcolor: "rgba(0, 230, 184, 0.1)", 
                                  color: "#00e6b8",
                                  border: "1px solid rgba(0, 230, 184, 0.3)"
                                }} 
                              />
                              <Chip 
                                icon={<LocationOn />} 
                                label={job.city} 
                                sx={{ 
                                  bgcolor: "rgba(245, 158, 11, 0.1)", 
                                  color: "#f59e0b",
                                  border: "1px solid rgba(245, 158, 11, 0.3)"
                                }} 
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton 
                              onClick={() => handleEditClick(job)}
                              sx={{ color: "#00e6b8" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteJob(job.id)}
                              sx={{ color: "#ff4444" }}
                            >
                              <Delete />
                            </IconButton>
                            <Link href={`/statistic/${job.id}`}>
                              <IconButton sx={{ color: "#e50914" }}>
                                <Visibility />
                              </IconButton>
                            </Link>
                          </Box>
                        </Box>

                        <Box sx={{ 
                          p: 3, 
                          background: "rgba(0, 230, 184, 0.05)", 
                          borderRadius: 2, 
                          border: "1px solid rgba(0, 230, 184, 0.2)",
                          mb: 3
                        }}>
                          <Typography sx={{ color: "#00e6b8", fontWeight: "600", mb: 1 }}>
                            📊 Ukupan broj prijava: {job.applications.length}
                          </Typography>
                          <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                            Poslednja prijava: {job.applications.length > 0 
                              ? new Date(Math.max(...job.applications.map(app => new Date(app.created_at)))).toLocaleDateString()
                              : "Nema prijava"
                            }
                          </Typography>
                        </Box>

                        {job.applications.length > 0 && (
                          <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: "600" }}>
                              👥 Aplikacije ({job.applications.length})
                            </Typography>
                            <Box sx={{ flexGrow: 1, overflow: "auto", maxHeight: "200px" }}>
                              <Grid container spacing={2}>
                                {job.applications.map((app, i) => (
                                  <Grid item xs={12} key={i}>
                                  <Paper sx={{
                                    p: 2,
                                    background: "rgba(42, 42, 42, 0.6)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: 2,
                                  }}>
                                    <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: "500", mb: 1 }}>
                                      👤 {app.user.name} {app.user.surname}
                                    </Typography>
                                    <Chip 
                                      label={`Ocjena: ${app.score}`} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: app.score >= 7 ? "rgba(34, 197, 94, 0.2)" : app.score >= 5 ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                        color: app.score >= 7 ? "#22c55e" : app.score >= 5 ? "#f59e0b" : "#ef4444",
                                        border: `1px solid ${app.score >= 7 ? "rgba(34, 197, 94, 0.3)" : app.score >= 5 ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                        mb: 1
                                      }} 
                                    />
                                    <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
                                      🕒 {new Date(app.created_at).toLocaleString()}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                              </Grid>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )
        ) : jobStats.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Assessment sx={{ fontSize: 80, color: "#666", mb: 2 }} />
            <Typography sx={{ color: "#999", fontSize: "1.2rem" }}>
              Nemaš prijava.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {[...jobStats]
              .sort((a, b) => {
                switch (sortBy) {
                  case "score_desc":
                    return b.score - a.score
                  case "score_asc":
                    return a.score - b.score
                  case "oldest":
                    return new Date(a.created_at) - new Date(b.created_at)
                  case "latest":
                  default:
                    return new Date(b.created_at) - new Date(a.created_at)
                }
              })
              .map((app, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card sx={{
                    background: "rgba(31, 31, 31, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 230, 184, 0.3)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(0, 230, 184, 0.4)",
                    },
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ color: "#00e6b8", fontWeight: "600", mb: 2 }}>
                        📌 {app.job.title}
                      </Typography>
                      
                      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <Chip 
                          icon={<Business />} 
                          label={app.job.company} 
                          sx={{ 
                            bgcolor: "rgba(229, 9, 20, 0.1)", 
                            color: "#e50914",
                            border: "1px solid rgba(229, 9, 20, 0.3)"
                          }} 
                        />
                        <Chip 
                          icon={<CalendarToday />} 
                          label={new Date(app.job.date).toLocaleDateString()} 
                          sx={{ 
                            bgcolor: "rgba(245, 158, 11, 0.1)", 
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)"
                          }} 
                        />
                      </Box>

                      <Box sx={{ 
                        p: 2, 
                        background: "rgba(0, 230, 184, 0.05)", 
                        borderRadius: 2, 
                        border: "1px solid rgba(0, 230, 184, 0.2)",
                        mb: 3
                      }}>
                        <Typography sx={{ color: "#00e6b8", fontWeight: "600", mb: 1 }}>
                          🎯 AI Ocjena: {app.score}/10
                        </Typography>
                        <Box sx={{ 
                          width: "100%", 
                          height: 8, 
                          background: "rgba(255, 255, 255, 0.1)", 
                          borderRadius: 4,
                          overflow: "hidden"
                        }}>
                          <Box sx={{ 
                            width: `${(app.score / 10) * 100}%`, 
                            height: "100%", 
                            background: app.score >= 7 ? "linear-gradient(90deg, #22c55e, #16a34a)" : 
                                       app.score >= 5 ? "linear-gradient(90deg, #f59e0b, #d97706)" : 
                                       "linear-gradient(90deg, #ef4444, #dc2626)",
                            transition: "width 0.3s ease"
                          }} />
                        </Box>
                      </Box>

                      <Typography sx={{ color: "#00e6b8", fontWeight: "600", mb: 2 }}>
                        🤖 AI analiza:
                      </Typography>
                      <Paper
                        sx={{
                          p: 3,
                          background: "rgba(42, 42, 42, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: 2,
                          color: "#ddd",
                          mb: 2,
                          maxHeight: "200px",
                          overflow: "auto"
                        }}
                      >
                        <MarkdownViewer markdown={app.analysis} />
                      </Paper>

                      <Typography variant="caption" sx={{ color: "#888" }}>
                        🕒 Prijavljeno: {new Date(app.created_at).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(31, 31, 31, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff"
          }
        }}
      >
        <DialogTitle sx={{ color: "#e50914", fontWeight: "600" }}>
          Uredi konkurs
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[
              { name: "title", label: "Naziv konkursa" },
              { name: "company", label: "Kompanija" },
              { name: "description", label: "Opis" },
              { name: "info", label: "Info" },
              { name: "task", label: "Zadaci" },
              { name: "city", label: "Grad" },
              { name: "note", label: "Napomena" },
              { name: "email", label: "Email" },
              { name: "telephone", label: "Telefon" },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  label={field.label}
                  fullWidth
                  margin="dense"
                  value={editJob[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(229, 9, 20, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#e50914",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#aaa",
                      "&.Mui-focused": {
                        color: "#e50914",
                      },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <TextField
            label="Datum isteka"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={editJob.date?.split("T")[0] || ""}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(229, 9, 20, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#e50914",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#aaa",
                "&.Mui-focused": {
                  color: "#e50914",
                },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={editJob.cv} 
                  onChange={(e) => handleFieldChange("cv", e.target.checked)}
                  sx={{
                    color: "#e50914",
                    "&.Mui-checked": {
                      color: "#e50914",
                    },
                  }}
                />
              }
              label="CV obavezan"
              sx={{ color: "#fff" }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editJob.experience}
                  onChange={(e) => handleFieldChange("experience", e.target.checked)}
                  sx={{
                    color: "#e50914",
                    "&.Mui-checked": {
                      color: "#e50914",
                    },
                  }}
                />
              }
              label="Iskustvo obavezno"
              sx={{ color: "#fff" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "#aaa" }}
          >
            Otkaži
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #e50914, #b0060f)",
              "&:hover": {
                background: "linear-gradient(135deg, #b0060f, #8b0000)",
              },
            }}
          >
            Spremi
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  )
}