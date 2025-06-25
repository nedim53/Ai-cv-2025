import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Input,
  Paper,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";

export default function Parse() {
  const [file, setFile] = useState(null);
  const [parsedText, setParsedText] = useState("");
  const [aiResult, setAiResult] = useState("");

  const handleUpload = async () => {
  if (!file) return;

      const user = await supabase.auth.getUser();
    const userId= user.data.user?.id;
        const fileName = `${userId}/${Date.now()}_${file.name}`;


  const { data, error } = await supabase.storage
    .from("user-uploads") 
    .upload(fileName, file);

  

  if (error) {
    alert("Greška prilikom uploada: " + error.message);
    return;
  }

   const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  setParsedText(result.parsed_text || "");
  setAiResult(result.analysis || result.error || "Greška prilikom obrade.");

};

  return (
    <>
        <Navbar></Navbar>

    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        color: "#fff",
        px: 4,
        py: 6,
        overflowX: "hidden",
      }}
    >
         

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, color: "#ff1a1a", textAlign: "center" }}
      >
        Parsiraj tvoj PDF ili DOCX
      </Typography>

      <Paper
        elevation={6}
        sx={{
          p: 4,
          bgcolor: "#1e1e1e",
          border: "1px solid #ff1a1a",
          borderRadius: 3,
          maxWidth: 700,
          mx: "auto",
        }}
      >
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
            bgcolor: "#ff1a1a",
            ":hover": { bgcolor: "#cc0000" },
            fontWeight: "bold",
            mb: 4,
          }}
        >
          Pošalji i Analiziraj
        </Button>

        {parsedText && (
          <>
            <Typography variant="h6" sx={{ mb: 1, color: "#ff4d4d" }}>
              Parsiran tekst:
            </Typography>
            <Paper
              sx={{
                p: 2,
                mb: 4,
                bgcolor: "#2a2a2a",
                borderRadius: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {parsedText}
            </Paper>
          </>
        )}

        {aiResult && (
          <>
            <Typography variant="h6" sx={{ mb: 1, color: "#ff4d4d" }}>
              AI analiza:
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: "#2a2a2a",
                borderRadius: 2,
                whiteSpace: "pre-wrap",
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
