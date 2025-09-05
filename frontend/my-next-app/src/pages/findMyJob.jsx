"use client"

import { useState } from "react"
import useUser from "@/lib/useUser"
import Navbar from "@/components/navbar"
import { Box, Typography, CircularProgress, Card, CardContent, Button, Grid } from "@mui/material"

export default function FindMyJob() {
  const { user, loading } = useUser()
  const [jobs, setJobs] = useState([])
  const [keywords, setKeywords] = useState([])
  const [fetching, setFetching] = useState(false)
  const [category, setCategory] = useState("")
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE

  const fetchRecommendedJobs = async () => {
    if (!user?.id) return

    setFetching(true)

    try {
      const res = await fetch(`${API_BASE}/find-my-jobs/${user.id}`)
      const data = await res.json()

      setJobs(data.results || [])
      setKeywords(data.keywords || [])
      setCategory(data.category || "")
    } catch (err) {
      console.error("Greška:", err)
    } finally {
      setFetching(false)
    }
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
      <Navbar user={user} loading={loading} />

      <Box sx={{ p: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
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
            🔎 AI Preporučeni Poslovi
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
            Naša AI analizira vaš CV i pronalazi najbolje prilike za zapošljavanje
          </Typography>

          {!user?.cv_url && (
            <Box sx={{ 
              p: 3, 
              background: "rgba(220, 38, 38, 0.1)", 
              borderRadius: 3, 
              border: "1px solid rgba(220, 38, 38, 0.3)",
              mb: 4,
              maxWidth: "500px",
              mx: "auto"
            }}>
              <Typography sx={{ color: "#ff4d4d", fontWeight: "600", mb: 1 }}>
                ⚠️ Potreban je CV
              </Typography>
              <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                Uploadujte svoj CV u profilu da biste koristili AI preporuke
              </Typography>
            </Box>
          )}

          <Button
            onClick={fetchRecommendedJobs}
            disabled={!user?.cv_url || fetching}
            variant="contained"
            sx={{
              background: user?.cv_url && !fetching 
                ? "linear-gradient(135deg, #e50914, #b0060f)" 
                : "rgba(100, 100, 100, 0.3)",
              color: "#fff",
              fontWeight: "bold",
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              borderRadius: 3,
              textTransform: "none",
              boxShadow: user?.cv_url && !fetching 
                ? "0 8px 25px rgba(229, 9, 20, 0.4)" 
                : "none",
              "&:hover": user?.cv_url && !fetching ? {
                background: "linear-gradient(135deg, #b0060f, #8b0000)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 35px rgba(229, 9, 20, 0.6)",
              } : {},
            }}
          >
            {fetching ? (
              <>
                <CircularProgress size={20} sx={{ color: "#fff", mr: 2 }} />
                Analiziram CV...
              </>
            ) : (
              "🧠 Pronađi mi posao"
            )}
          </Button>
        </Box>

        {category && (
          <Box sx={{ 
            textAlign: "center", 
            mb: 4,
            p: 3,
            background: "rgba(0, 230, 184, 0.1)",
            borderRadius: 3,
            border: "1px solid rgba(0, 230, 184, 0.3)",
            maxWidth: "600px",
            mx: "auto"
          }}>
            <Typography variant="h5" sx={{ color: "#00e6b8", fontWeight: "600", mb: 1 }}>
              🎯 Detektovana kategorija: {category}
            </Typography>
            {keywords.length > 0 && (
              <Typography sx={{ color: "#aaa" }}>
                Ključne riječi: {keywords.join(", ")}
              </Typography>
            )}
          </Box>
        )}

        {jobs.length > 0 && (
          <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4, 
                color: "#fff",
                fontWeight: 700,
                textAlign: "center"
              }}
            >
              Preporučeni poslovi ({jobs.length})
            </Typography>

            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
                  <Card
                    sx={{
                      background: "rgba(31, 31, 31, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(229, 9, 20, 0.3)",
                      borderRadius: 3,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(229, 9, 20, 0.4)",
                        borderColor: "rgba(229, 9, 20, 0.6)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: "#e50914", 
                          mb: 2,
                          fontWeight: 600,
                          fontSize: "1.3rem"
                        }}
                      >
                        {job.title}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ color: "#ddd", mb: 0.5 }}>
                          <strong style={{ color: "#fff" }}>Kompanija:</strong> {job.company}
                        </Typography>
                        <Typography sx={{ color: "#ddd", mb: 0.5 }}>
                          <strong style={{ color: "#fff" }}>Grad:</strong> {job.city}
                        </Typography>
                        <Typography sx={{ color: "#ddd", mb: 2 }}>
                          <strong style={{ color: "#fff" }}>Ističe:</strong> {new Date(job.date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Typography 
                        sx={{ 
                          color: "#bbb", 
                          mb: 3,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.4
                        }}
                      >
                        {job.description}
                      </Typography>

                      <Button
                        component="a"
                        href={`/jobdescription/${job.id}`}
                        variant="contained"
                        fullWidth
                        sx={{
                          background: "linear-gradient(135deg, #e50914, #b0060f)",
                          color: "#fff",
                          fontWeight: "bold",
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "1rem",
                          "&:hover": {
                            background: "linear-gradient(135deg, #b0060f, #8b0000)",
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        📄 Pogledaj oglas
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {!fetching && jobs.length === 0 && user?.cv_url && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: "#999", fontSize: "1.2rem" }}>
              Nema preporučenih poslova. Pokušajte ponovo ili provjerite da li je vaš CV valjan.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}