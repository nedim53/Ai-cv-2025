import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Typography,
  Paper,
  Input,
  Button,
  CircularProgress,
} from "@mui/material";
import Navbar from "@/components/navbar";

export default function JobDescription() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [parsedText, setParsedText] = useState("");
  const [aiResult, setAiResult] = useState("");

useEffect(() => {
  if (!id) return;

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setJob(data);
    setLoading(false);
  };

  fetchJob();
}, [id]);

useEffect(() => {
  const checkExistingAnalysis = async () => {
    if (!id) return;

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { data, error } = await supabase
      .from("application_analysis")
      .select("analysis")
      .eq("user_id", userId)
      .eq("job_id", id)
      .maybeSingle();

    if (data?.analysis) {
      setAiResult(data.analysis);
    }
  };

  checkExistingAnalysis();
}, [id]);


  const handleUpload = async () => {
    if (!file || !job) return;

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const fileName = `${userId}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, file);

    if (error) {
      alert("Greška prilikom uploada: " + error.message);
      return;
    }

    const res = await fetch(
      `http://localhost:8000/analyze-cv/${userId}/${job.id}`,
      {
        method: "POST",
      }
    );

    const data = await res.json();
    const analysisId = data.analysis_id;

    const interval = setInterval(async () => {
      const check = await fetch(
        `http://localhost:8000/get-analysis/${analysisId}`
      );
      const result = await check.json();

      if (result.analysis) {
        setAiResult(result.analysis);
        setParsedText(result.parsed_text || "");
        clearInterval(interval);
      }
    }, 10000);
  };

  if (loading || !job) {
    return (
      <Box sx={{ p: 4, bgcolor: "#000", minHeight: "100vh", color: "#fff" }}>
        <CircularProgress sx={{ color: "#e50914" }} />
      </Box>
    );
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

        {/* Upload sekcija */}
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
          <Input
            type="file"
            fullWidth
            inputProps={{ accept: ".pdf,.docx" }}
            onChange={(e) => setFile(e.target.files[0])}
            disableUnderline
            sx={{
              mb: 3,
              bgcolor: "#2a2a2a",
              p: 1.5,
              borderRadius: 1,
              color: "#fff",
            }}
          />
          <Button
            variant="contained"
            onClick={handleUpload}
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

          {parsedText && (
            <>
              <Typography variant="h6" sx={{ mb: 1, color: "#ff4d4d" }}>
                ✅ Parsiran tekst:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  mb: 4,
                  bgcolor: "#2a2a2a",
                  borderRadius: 2,
                  whiteSpace: "pre-wrap",
                  color: "#ddd",
                }}
              >
                {parsedText}
              </Paper>
            </>
          )}

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
                {aiResult}
              </Paper>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
