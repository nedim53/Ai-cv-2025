"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Typography, CircularProgress, Paper, Chip, Button, Divider, Card, CardContent, CardActions, Grid, Avatar, LinearProgress, IconButton, Tooltip, Badge, Fade, Zoom } from "@mui/material"
import { 
  Download, 
  Person, 
  Email, 
  Phone, 
  CalendarToday, 
  Work, 
  LocationOn, 
  Star,
  TrendingUp,
  Assessment,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule
} from "@mui/icons-material"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import MarkdownViewer from "@/components/MarkdownViewer"
import useUser from "@/lib/useUser"
import { useNotification } from "@/components/NotificationProvider"

export default function JobDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: userLoading } = useUser()
  const { showError } = useNotification()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [sortBy, setSortBy] = useState("latest")

  useEffect(() => {
    if (!router.isReady || !id) return

    const fetchData = async () => {
      setLoading(true)

      const { data: jobData, error: jobError } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle()

      if (jobError || !jobData) {
        setJob(null)
        setLoading(false)
        return
      }

      setJob(jobData)

      const { data: appData } = await supabase.from("application_analysis").select("*").eq("job_id", id)

      const enrichedApps = await Promise.all(
        (appData || []).map(async (app) => {
          const { data: userData } = await supabase
            .from("users")
            .select("name, surname, email, telephone, cv_url")
            .eq("id", app.user_id)
            .maybeSingle()

          return {
            ...app,
            user: userData || { name: "Nepoznat", surname: "" },
          }
        }),
      )

      setApplications(enrichedApps)
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  const handleCVDownload = async (cvPath) => {
    const { data, error } = await supabase.storage.from("user-uploads").download(cvPath)

    if (error || !data) {
      console.error("Greška pri downloadu:", error)
      showError("Greška pri preuzimanju CV-a.")
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = cvPath.split("/").pop()
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
          color: "#f5f5f1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
        }}
      >
        <Fade in={loading} timeout={500}>
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: "#e50914",
                mb: 2,
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                }
              }} 
            />
            <Typography variant="h6" sx={{ color: "#f5f5f1" }}>
              Učitavam podatke...
            </Typography>
          </Box>
        </Fade>
      </Box>
    )
  }

  if (!job) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
          color: "#f5f5f1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
        }}
      >
        <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Cancel sx={{ fontSize: "4rem", color: "#e50914", mb: 2 }} />
          <Typography variant="h4" sx={{ color: "#f5f5f1", mb: 1 }}>
            Oglas nije pronađen
          </Typography>
          <Typography variant="body1" sx={{ color: "#aaaaaa" }}>
            Molimo proverite da li je URL ispravan
        </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        color: "#f5f5f1",
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
      }}
    >
      <Navbar user={user} loading={userLoading} />

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto", position: "relative", zIndex: 1 }}>
        <Zoom in={true} timeout={800}>
          <Typography 
            variant="h3" 
          sx={{
              color: "#f5f5f1", 
              fontWeight: 700, 
              mb: 4,
              textAlign: "center",
              background: "linear-gradient(45deg, #e50914, #ff6b6b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            📄 Detalji konkursa
          </Typography>
        </Zoom>

        <Zoom in={true} timeout={1000}>
          <Card
            elevation={24}
            sx={{
              mb: 4,
              background: "rgba(30, 30, 30, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 4,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  {job.company?.charAt(0)?.toUpperCase() || "J"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: "#f5f5f1", 
                      fontWeight: 700,
                      mb: 1,
                      background: "linear-gradient(45deg, #e50914, #ff6b6b)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {job.title}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: "#aaaaaa", 
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Work sx={{ fontSize: "1.5rem" }} />
                    {job.company}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                    <Chip 
                      icon={<LocationOn />}
                      label={job.city} 
                      sx={{ 
                        background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                        color: "#fff",
                        fontWeight: 600,
                      }} 
                    />
                    <Chip 
                      icon={<CalendarToday />}
                      label={job.date} 
                      sx={{ 
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "#fff",
                        fontWeight: 600,
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#f5f5f1", 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Opis posla
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: "#cccccc", 
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {job.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#f5f5f1", 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Zadatak
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: "#cccccc", 
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {job.task}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#f5f5f1", 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    O nama
                  </Typography>
                  <Box sx={{ 
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: 2,
                    p: 3,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}>
                    <MarkdownViewer content={job.info} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#f5f5f1", 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Kontakt informacije
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#cccccc",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Email sx={{ fontSize: "1rem", color: "#e50914" }} />
                      {job.email}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#cccccc",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Phone sx={{ fontSize: "1rem", color: "#e50914" }} />
                      {job.telephone}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: "#f5f5f1", 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Potrebno
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip 
                      icon={job.cv ? <CheckCircle /> : <Cancel />}
                      label={`CV: ${job.cv ? "Da" : "Ne"}`}
                      sx={{ 
                        background: job.cv 
                          ? "linear-gradient(135deg, #22c55e, #16a34a)"
                          : "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "#fff",
                        fontWeight: 600,
                      }} 
                    />
                    <Chip 
                      icon={job.experience ? <CheckCircle /> : <Cancel />}
                      label={`Iskustvo: ${job.experience ? "Da" : "Ne"}`}
                      sx={{ 
                        background: job.experience 
                          ? "linear-gradient(135deg, #22c55e, #16a34a)"
                          : "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "#fff",
                        fontWeight: 600,
                      }} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Zoom>

        <Zoom in={true} timeout={1200}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Badge 
                badgeContent={applications.length} 
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                    fontWeight: "bold",
                  }
                }}
              >
                <Assessment sx={{ fontSize: "2rem", color: "#e50914" }} />
              </Badge>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: "#f5f5f1",
                  fontWeight: 700,
                }}
              >
                Prijave
              </Typography>
        </Box>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={sortBy === "latest" ? "contained" : "outlined"}
                onClick={() => setSortBy("latest")}
                startIcon={<TrendingUp />}
                sx={{
                  background: sortBy === "latest" 
                    ? "linear-gradient(135deg, #e50914, #ff6b6b)" 
                    : "transparent",
                  borderColor: "#e50914",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                  }
                }}
              >
                Najnovije
              </Button>
              <Button
                variant={sortBy === "oldest" ? "contained" : "outlined"}
                onClick={() => setSortBy("oldest")}
                startIcon={<Schedule />}
                sx={{
                  background: sortBy === "oldest" 
                    ? "linear-gradient(135deg, #e50914, #ff6b6b)" 
                    : "transparent",
                  borderColor: "#e50914",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                  }
                }}
              >
                Najstarije
              </Button>
            </Box>
          </Box>
        </Zoom>

        <Typography variant="h5" sx={{ mb: 2, color: "#ff1a1a" }}>
          📝 Prijave kandidata
        </Typography>

        {applications.length === 0 ? (
          <Typography sx={{ color: "#aaa" }}>Nema prijava za ovaj konkurs.</Typography>
        ) : (
          [...applications]
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
              <Paper
                key={idx}
                elevation={2}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#1e1e1e",
                  borderLeft: "5px solid #ff4d4d",
                }}
              >
                <Typography variant="subtitle1" sx={{ color: "#ffcccc", mb: 1 }}>
                  👤 {app.user.name} {app.user.surname}
                </Typography>
                <Typography sx={{ color: "#bbb" }}>Email: {app.user.email}</Typography>
                <Typography sx={{ color: "#bbb" }}>Telefon: {app.user.telephone}</Typography>
                {app.user.cv_url && (
                  <Typography sx={{ color: "#bbb", mt: 1 }}>
                    <Button
                      onClick={() => handleCVDownload(app.user.cv_url)}
                      underline="hover"
                      sx={{ color: "#ff4d4d" }}
                    >
                      {" "}
                      Preuzmi CV
                    </Button>
                  </Typography>
                )}

                <Chip label={`Ocjena: ${app.score}`} sx={{ bgcolor: "#ff1a1a", color: "#fff", mt: 2 }} />

                <Divider sx={{ my: 2, borderColor: "#333" }} />

                <MarkdownViewer markdown={app.analysis} />

                <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                  🕒 Prijavljeno: {new Date(app.created_at).toLocaleString()}
                </Typography>
              </Paper>
            ))
        )}
      </Box>
    </Box>
  )
}

const GridField = ({ label, value }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
      {label}:
    </Typography>
    <Typography sx={{ color: "#fff" }}>{value}</Typography>
  </Box>
)
