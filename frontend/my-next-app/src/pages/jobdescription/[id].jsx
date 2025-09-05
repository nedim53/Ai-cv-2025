"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/lib/supabaseClient"
import { Box, Typography, Paper, Button, CircularProgress } from "@mui/material"
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
      <Navbar />
      <Box
        sx={{
          px: { xs: 2, md: 6 },
          py: 4,
          bgcolor: "#141414",
          color: "#fff",
          minHeight: "100vh",
          backgroundImage: "linear-gradient(to bottom, #141414, #000)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            color: "#e50914",
            fontWeight: "bold",
            fontFamily: "Helvetica Neue, sans-serif",
          }}
        >
          {job.title}
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #2a2a2a",
            borderRadius: 4,
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography sx={{ mb: 1 }}>
            <strong>Kompanija:</strong> {job.company}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Grad:</strong> {job.city}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Opis:</strong> {job.description}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Zadaci:</strong> {job.task}
          </Typography>
          <Typography>
            <strong>O nama:</strong> {job.info}
          </Typography>
        </Paper>

        {/* Upload section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "#1f1f1f",
            borderRadius: 4,
            border: "1px solid #e50914",
            backdropFilter: "blur(6px)",
            maxWidth: 800,
            mx: "auto",
            mb: 6,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#ff4d4d" }}>
            📎 Pošalji svoj CV za AI analizu
          </Typography>

          <Button
            variant="contained"
            onClick={handleAnalyze}
            sx={{
              bgcolor: "#e50914",
              ":hover": { bgcolor: "#b0060f" },
              fontWeight: "bold",
              mb: 4,
              px: 4,
              py: 1,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            🚀 Pošalji i analiziraj
          </Button>

          {aiResult && (
            <>
              <Typography variant="h6" sx={{ mb: 1, color: "#ff4d4d" }}>
                🤖 AI analiza u kontekstu opisa posla:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#2a2a2a",
                  borderRadius: 2,
                  whiteSpace: "pre-wrap",
                  color: "#ddd",
                }}
              >
                <MarkdownViewer markdown={aiResult} />
              </Paper>
            </>
          )}
        </Paper>
      </Box>
    </>
  )
}
