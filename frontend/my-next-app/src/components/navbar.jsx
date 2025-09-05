"use client"
import { useState } from "react"
import { Box, TextField, Typography, Button, Grid, Divider, Alert, Paper } from "@mui/material"
import { supabase } from "@/lib/supabaseClient"
import useUser from "@/lib/useUser"

export default function CreateJobForm() {
  const { user, loading } = useUser()
  const [formData, setFormData] = useState({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("Korisnik nije prijavljen.")
      return
    }

    const konkurs = {
      title: formData.title,
      company: formData.company,
      date: formData.date,
      description: formData.description,
      info: formData.info,
      task: formData.task,
      city: formData.city,
      note: formData.note,
      email: formData.email,
      telephone: formData.telephone,
      job_type: formData.job_type,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase.from("jobs").insert(konkurs)

    if (insertError) {
      setError("Greška prilikom kreiranja konkursa: " + insertError.message)
    } else {
      setSuccess(true)
      setError("")
      setFormData({})
    }
  }

  if (loading) {
    return <Typography sx={{ textAlign: "center", mt: 4 }}>Učitavanje...</Typography>
  }

  if (!user) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error || "Morate biti prijavljeni da biste kreirali konkurs."}
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, rgba(220, 38, 38, 0.1) 0%, rgba(15, 15, 15, 0.9) 50%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          maxWidth: 1000,
          mx: "auto",
          background: "rgba(30, 30, 30, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            textShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
          }}
        >
          Kreiraj konkurs
        </Typography>

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#22c55e",
              borderRadius: "12px",
            }}
          >
            Konkurs uspješno kreiran!
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              color: "#dc2626",
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {[
            { label: "Naziv kompanije", name: "company" },
            { label: "Naziv konkursa", name: "title" },
            { label: "Datum isteka", name: "date", type: "date" },
            { label: "Opis konkursa", name: "description" },
            { label: "O nama", name: "info" },
            { label: "Zadaci i odgovornosti", name: "task" },
            { label: "Grad", name: "city" },
            { label: "Napomena", name: "note" },
            { label: "Kontakt Email", name: "email" },
            { label: "Kontakt Telefon", name: "telephone" },
          ].map(({ label, name, type = "text" }) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                label={label}
                name={name}
                type={type}
                fullWidth
                required={name !== "note" && name !== "email" && name !== "telephone"}
                value={formData[name] || ""}
                onChange={handleChange}
                InputLabelProps={type === "date" ? { shrink: true } : undefined}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(220, 38, 38, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#dc2626",
                      boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#aaa",
                    "&.Mui-focused": {
                      color: "#dc2626",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mb: 2, color: "#aaa", fontWeight: "600" }}>
              Kategorija posla:
            </Typography>
            <TextField
              select
              name="job_type"
              value={formData.job_type || ""}
              onChange={handleChange}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(220, 38, 38, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#dc2626",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                },
              }}
            >
              <option value="">-- Odaberi kategoriju --</option>
              <option value="it">IT</option>
              <option value="administracija">Administracija</option>
              <option value="ugostiteljstvo">Ugostiteljstvo</option>
              <option value="proizvodnja">Proizvodnja</option>
              <option value="obrazovanje">Obrazovanje</option>
              <option value="zdravstvo">Zdravstvo</option>
            </TextField>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            px: 5,
            py: 1.5,
            fontWeight: "bold",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #b91c1c, #dc2626)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(220, 38, 38, 0.5)",
            },
          }}
        >
          Kreiraj konkurs
        </Button>
      </Paper>
    </Box>
  )
}
