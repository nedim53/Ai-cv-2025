import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import useUser from "@/lib/useUser";

export default function CreateJobForm() {
  const { user, loading } = useUser();
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Korisnik nije prijavljen.");
      return;
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
    };

    const { error: insertError } = await supabase.from("jobs").insert(konkurs);

    if (insertError) {
      setError("Greška prilikom kreiranja konkursa: " + insertError.message);
    } else {
      setSuccess(true);
      setError("");
      setFormData({});
    }
  };

  if (loading) {
    return <Typography sx={{ textAlign: "center", mt: 4 }}>Učitavanje...</Typography>;
  }

  if (!user) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error || "Morate biti prijavljeni da biste kreirali konkurs."}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2, minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, maxWidth: 1000, mx: "auto" }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "gray" }}>
          Kreiraj konkurs
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Konkurs uspješno kreiran!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
                required={
                  name !== "note" &&
                  name !== "email" &&
                  name !== "telephone"
                }
                value={formData[name] || ""}
                onChange={handleChange}
                InputLabelProps={type === "date" ? { shrink: true } : undefined}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={2} sx={{ mt: 3 }}>
  <Grid item xs={12} sm={6}>
    <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
      Kategorija posla:
    </Typography>
    <TextField
      select
      name="job_type"
      value={formData.job_type || ""}
      onChange={handleChange}
      fullWidth
      SelectProps={{ native: true }}
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
          color="error"
          sx={{
            mt: 4,
            px: 5,
            py: 1.5,
            fontWeight: "bold",
          }}
        >
          Kreiraj konkurs
        </Button>
      </Paper>
    </Box>
  );
}
