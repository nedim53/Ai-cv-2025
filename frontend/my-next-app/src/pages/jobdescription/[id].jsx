"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/lib/supabaseClient"
import { Box, Typography, Paper, Button, CircularProgress, Grid, Fade, Zoom, LinearProgress, Chip } from "@mui/material"
import { 
  Psychology, 
  CheckCircle, 
  Schedule,
  AutoAwesome
} from "@mui/icons-material"
import Navbar from "@/components/navbar"
import useUser from "@/lib/useUser"
import MarkdownViewer from "@/components/MarkdownViewer"

export default function JobDescription() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: userLoading } = useUser()
  // Simple notification functions
  const showError = (message) => {
    console.error(message)
  }
  const showSuccess = (message) => {
    console.log(message)
  }
  const showInfo = (message) => {
    console.log(message)
  }
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiResult, setAiResult] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  useEffect(() => {
    if (!id) return

    const fetchJob = async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()

      if (!error) setJob(data)
      setLoading(false)
    }

    fetchJob()
  }, [id])

  useEffect(() => {
    if (!userLoading && user?.id && id) {
      const fetchExistingAnalysis = async () => {
        const res = await fetch(`${API_BASE}/get-existing-analysis/${user.id}/${id}`)
        const result = await res.json()
        if (result?.analysis) {
          setAiResult(result.analysis)
        } else {
          setAiResult("")
        }
      }

      fetchExistingAnalysis()
    }
  }, [userLoading, user?.id, id])

  const handleAnalyze = async () => {
    if (!user || !job) return

    setAiLoading(true)
    setAnalysisProgress(0)
    showInfo("🚀 Pokretanje AI analize... Molimo sačekajte.")

    try {
      const res = await fetch(`${API_BASE}/analyze-cv/${user.id}/${job.id}`, { method: "POST" })
      
      if (!res.ok) {
        throw new Error('Greška pri pokretanju analize')
      }

      const data = await res.json()
      const analysisId = data.analysis_id

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 2000)

      const checkInterval = setInterval(async () => {
        try {
          const check = await fetch(`${API_BASE}/get-analysis/${analysisId}`)
          const result = await check.json()

          if (result.analysis) {
            setAiResult(result.analysis)
            setAnalysisProgress(100)
            clearInterval(checkInterval)
            clearInterval(progressInterval)
            setAiLoading(false)
            showSuccess("✅ AI analiza je završena!")
          }
        } catch (error) {
          console.error('Error checking analysis:', error)
        }
      }, 10000)

      // Timeout after 5 minutes
      setTimeout(() => {
        if (aiLoading) {
          clearInterval(checkInterval)
          clearInterval(progressInterval)
          setAiLoading(false)
          showError("⏰ Analiza je predugo trajala. Molimo pokušajte ponovo.")
        }
      }, 300000)

    } catch (error) {
      console.error('Error starting analysis:', error)
      setAiLoading(false)
      showError("❌ Greška pri pokretanju AI analize. Molimo pokušajte ponovo.")
    }
  }

  if (loading || !job) {
    return (
      <Box sx={{ p: 4, bgcolor: "#000", minHeight: "100vh", color: "#fff" }}>
        <CircularProgress sx={{ color: "#e50914" }} />
      </Box>
    )
  }

  return (
    <>
      <Navbar user={user} loading={userLoading} />
      <Box
        sx={{
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
        }}
      >
        <Box sx={{ px: { xs: 3, md: 6 }, py: 6, position: "relative", zIndex: 1 }}>
          {/* Header Section */}
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
              {job.title}
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                color: "#aaa",
                mb: 3,
                fontWeight: 300
              }}
            >
              {job.company} • {job.city}
            </Typography>

            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 2, 
              flexWrap: "wrap",
              mb: 4
            }}>
              <Box sx={{
                p: 2,
                background: "rgba(229, 9, 20, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(229, 9, 20, 0.3)"
              }}>
                <Typography sx={{ color: "#e50914", fontWeight: "600" }}>
                  📅 Ističe: {new Date(job.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Job Details */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  background: "rgba(31, 31, 31, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#e50914",
                    mb: 3,
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  📋 Opis posla
                </Typography>
                <Typography
                  sx={{
                    color: "#ddd",
                    lineHeight: 1.6,
                    fontSize: "1.1rem",
                    mb: 4
                  }}
                >
                  {job.description}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: "#e50914",
                    mb: 3,
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  🎯 Zadaci i odgovornosti
                </Typography>
                <Typography
                  sx={{
                    color: "#ddd",
                    lineHeight: 1.6,
                    fontSize: "1.1rem",
                    mb: 4
                  }}
                >
                  {job.task}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: "#e50914",
                    mb: 3,
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  🏢 O kompaniji
                </Typography>
                <Typography
                  sx={{
                    color: "#ddd",
                    lineHeight: 1.6,
                    fontSize: "1.1rem"
                  }}
                >
                  {job.info}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  background: "rgba(31, 31, 31, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 230, 184, 0.3)",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  height: "fit-content"
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#00e6b8",
                    mb: 3,
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  📍 Detalji posla
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: "#aaa", fontSize: "0.9rem", mb: 0.5 }}>
                    Kompanija
                  </Typography>
                  <Typography sx={{ color: "#fff", fontWeight: "500" }}>
                    {job.company}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: "#aaa", fontSize: "0.9rem", mb: 0.5 }}>
                    Lokacija
                  </Typography>
                  <Typography sx={{ color: "#fff", fontWeight: "500" }}>
                    {job.city}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: "#aaa", fontSize: "0.9rem", mb: 0.5 }}>
                    Datum isteka
                  </Typography>
                  <Typography sx={{ color: "#fff", fontWeight: "500" }}>
                    {new Date(job.date).toLocaleDateString()}
                  </Typography>
                </Box>

                {job.note && (
                  <Box sx={{ 
                    p: 2, 
                    background: "rgba(245, 158, 11, 0.1)", 
                    borderRadius: 2, 
                    border: "1px solid rgba(245, 158, 11, 0.3)" 
                  }}>
                    <Typography sx={{ color: "#f59e0b", fontWeight: "600", mb: 1 }}>
                      📝 Napomena
                    </Typography>
                    <Typography sx={{ color: "#ddd", fontSize: "0.9rem" }}>
                      {job.note}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* AI Analysis Section */}
          <Paper
            elevation={12}
            sx={{
              p: 4,
              background: "rgba(31, 31, 31, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(229, 9, 20, 0.3)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                color: "#e50914",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              🤖 AI Analiza CV-a
            </Typography>
            
            <Typography 
              sx={{ 
                color: "#aaa", 
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Uploadujte svoj CV da biste dobili AI analizu kompatibilnosti sa ovim poslom
            </Typography>

            {!aiLoading && !aiResult && (
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!user}
                sx={{
                  background: "linear-gradient(135deg, #e50914, #b0060f)",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 6,
                  py: 2,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: "0 8px 25px rgba(229, 9, 20, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #b0060f, #8b0000)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 35px rgba(229, 9, 20, 0.6)",
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.3)",
                  }
                }}
              >
                🚀 Analiziraj moj CV
              </Button>
            )}

            {aiLoading && (
              <Fade in={aiLoading} timeout={500}>
                <Box sx={{ 
                  p: 4, 
                  textAlign: "center",
                  background: "rgba(229, 9, 20, 0.05)",
                  borderRadius: 3,
                  border: "1px solid rgba(229, 9, 20, 0.2)"
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                    <CircularProgress 
                      size={40} 
                      sx={{ 
                        color: "#e50914", 
                        mr: 2,
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                        }
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: "#e50914",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Psychology sx={{ fontSize: "1.5rem" }} />
                      AI analizira vaš CV...
                    </Typography>
                  </Box>
                  
                  <Typography 
                    sx={{ 
                      color: "#aaa", 
                      mb: 3,
                      fontSize: "0.95rem"
                    }}
                  >
                    Molimo sačekajte dok AI analizira vaš CV i upoređuje ga sa zahtevima posla.
                    Ovo može potrajati nekoliko minuta.
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={analysisProgress} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          background: "linear-gradient(135deg, #e50914, #ff6b6b)",
                          borderRadius: 4,
                        }
                      }}
                    />
                    <Typography 
                      sx={{ 
                        color: "#e50914", 
                        mt: 1, 
                        fontSize: "0.9rem",
                        fontWeight: "600"
                      }}
                    >
                      {Math.round(analysisProgress)}% završeno
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                    <Chip 
                      icon={<AutoAwesome />}
                      label="Analizira se CV" 
                      sx={{ 
                        background: "rgba(229, 9, 20, 0.2)",
                        color: "#e50914",
                        border: "1px solid rgba(229, 9, 20, 0.3)"
                      }} 
                    />
                    <Chip 
                      icon={<Schedule />}
                      label="Upoređuje se sa poslom" 
                      sx={{ 
                        background: "rgba(0, 230, 184, 0.2)",
                        color: "#00e6b8",
                        border: "1px solid rgba(0, 230, 184, 0.3)"
                      }} 
                    />
                  </Box>

                  <Typography 
                    sx={{ 
                      color: "#666", 
                      mt: 2,
                      fontSize: "0.85rem",
                      fontStyle: "italic"
                    }}
                  >
                    Možete nastaviti da koristite aplikaciju dok se analiza izvršava
                  </Typography>
                </Box>
              </Fade>
            )}

            {aiResult && (
              <Fade in={!!aiResult} timeout={800}>
                <Box sx={{ mt: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      color: "#00e6b8",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <CheckCircle sx={{ fontSize: "1.5rem" }} />
                    Rezultat AI analize
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      background: "rgba(0, 230, 184, 0.05)",
                      border: "1px solid rgba(0, 230, 184, 0.2)",
                      borderRadius: 3,
                      color: "#ddd",
                    }}
                  >
                    <MarkdownViewer markdown={aiResult} />
                  </Paper>
                  
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setAiResult("")
                        setAnalysisProgress(0)
                      }}
                      sx={{
                        borderColor: "#e50914",
                        color: "#e50914",
                        "&:hover": {
                          borderColor: "#ff6b6b",
                          color: "#ff6b6b",
                          background: "rgba(229, 9, 20, 0.1)"
                        }
                      }}
                    >
                      🔄 Nova analiza
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  )
}
