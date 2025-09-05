"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/lib/supabaseClient"
import { Box, Typography, Paper, Button, CircularProgress, Grid } from "@mui/material"
import Navbar from "@/components/navbar"
import useUser from "@/lib/useUser"
import MarkdownViewer from "@/components/MarkdownViewer"

export default function JobDescription() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: userLoading } = useUser()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiResult, setAiResult] = useState("")
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

    const res = await fetch(`${API_BASE}/analyze-cv/${user.id}/${job.id}`, { method: "POST" })

    const data = await res.json()
    const analysisId = data.analysis_id

    const interval = setInterval(async () => {
      const check = await fetch(`${API_BASE}/get-analysis/${analysisId}`)
      const result = await check.json()

      if (result.analysis) {
        setAiResult(result.analysis)
        clearInterval(interval)
      }
    }, 10000)
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

            <Button
              variant="contained"
              onClick={handleAnalyze}
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
              }}
            >
              🚀 Analiziraj moj CV
            </Button>

            {aiResult && (
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
                  ✅ Rezultat AI analize
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
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  )
}
