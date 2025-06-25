import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Statistic() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
  });

  const handleEditClick = (job) => {
    setEditJob({ ...job });
    setEditDialogOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setEditJob((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    const {
      id,
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
    } = editJob;

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
      .eq("user_id", user.id);

    if (error) {
      console.error("UPDATE ERROR:", error);
      setSnackbar({
        open: true,
        message: "Greška pri uređivanju.",
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Uspješno uređeno!",
        severity: "success",
      });
      setEditDialogOpen(false);
      location.reload();
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = confirm("Da li si siguran da želiš obrisati oglas?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("user_id", user.id);

    if (error) {
      setSnackbar({
        open: true,
        message: "Greška pri brisanju.",
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Oglas obrisan.",
        severity: "success",
      });
      location.reload();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const { data: userData } = await supabase
        .from("user")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      const fullUser = { ...authUser, ...userData };
      setUser(fullUser);

      if (fullUser.role === "hr") {
        const { data: jobs } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", fullUser.id);

        const stats = await Promise.all(
          (jobs || []).map(async (job) => {
            const { data: applications } = await supabase
              .from("application_analysis")
              .select("id, analysis, user_id, score, created_at")
              .eq("job_id", job.id);

            const enriched = await Promise.all(
              (applications || []).map(async (app) => {
                const { data: u } = await supabase
                  .from("user")
                  .select("name, surname")
                  .eq("id", app.user_id)
                  .maybeSingle();

                return {
                  ...app,
                  user: u || { name: "Nepoznat", surname: "" },
                };
              })
            );

            return {
              ...job,
              applications: enriched,
            };
          })
        );

        setJobStats(stats);
      } else if (fullUser.role === "user") {
        const { data: applications } = await supabase
          .from("application_analysis")
          .select("id, job_id, score, analysis, created_at")
          .eq("user_id", fullUser.id);

        const enriched = await Promise.all(
          (applications || []).map(async (app) => {
            const { data: job } = await supabase
              .from("jobs")
              .select("title, company, date")
              .eq("id", app.job_id)
              .maybeSingle();

            return {
              ...app,
              job: job || { title: "Nepoznat posao" },
            };
          })
        );

        setJobStats(enriched);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Navbar user={user} loading={loading} />

      <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", color: "#ff1a1a" }}
        >
          📊 Statistika prijava
        </Typography>

        {loading ? (
          <CircularProgress sx={{ color: "#ff1a1a" }} />
        ) : !user ? (
          <Typography sx={{ color: "#ccc" }}>Niste prijavljeni.</Typography>
        ) : user.role === "hr" ? (
          jobStats.length === 0 ? (
            <Typography sx={{ color: "#ccc" }}>
              Nemaš objavljenih konkursa.
            </Typography>
          ) : (
            jobStats.map((job, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  bgcolor: "#1e1e1e",
                  color: "#fff",
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  border: "1px solid #ff1a1a",
                }}
              >
                <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 1 }}>
                  📌 {job.title}
                </Typography>
                <Typography sx={{ mb: 2, color: "#aaa" }}>
                  Ukupan broj prijava:{" "}
                  <strong>{job.applications.length}</strong>
                </Typography>

                {job.applications.map((app, i) => (
                  <Box
                    key={i}
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: "#2a2a2a",
                      borderLeft: "5px solid #ff1a1a",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle1" sx={{ color: "#ffcccc" }}>
                        👤 {app.user.name} {app.user.surname}
                      </Typography>
                      <Chip
                        label={`Ocjena: ${app.score}`}
                        size="small"
                        sx={{ bgcolor: "#ff1a1a", color: "#fff" }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: "#ccc" }}>
                      {app.analysis}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#888", mt: 1, display: "block" }}
                    >
                      🕒 Prijavljeno:{" "}
                      {new Date(app.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleEditClick(job)}
                  >
                    Uredi konkurs
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    Izbriši konkurs
                  </Button>
                  <Link href={`/statistic/${job.id}`}>
                    <Button variant="outlined" color="error">
                      Više o konkursu
                    </Button>
                  </Link>
                </Box>
              </Paper>
            ))
          )
        ) : jobStats.length === 0 ? (
          <Typography sx={{ color: "#ccc" }}>Nemaš prijava.</Typography>
        ) : (
          jobStats.map((app, idx) => (
            <Paper
              key={idx}
              elevation={2}
              sx={{
                bgcolor: "#1e1e1e",
                color: "#fff",
                p: 3,
                mb: 3,
                borderRadius: 3,
                borderLeft: "5px solid #ff4d4d",
              }}
            >
              <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 1 }}>
                📌 {app.job.title}
              </Typography>
              <Typography sx={{ color: "#ccc", mb: 1 }}>
                Kompanija: {app.job.company}
              </Typography>
              <Typography sx={{ color: "#ccc", mb: 1 }}>
                Ističe: {new Date(app.job.date).toLocaleDateString()}
              </Typography>
              <Chip
                label={`Ocjena: ${app.score}`}
                sx={{ bgcolor: "#ff1a1a", color: "#fff", mb: 2 }}
              />
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                {app.analysis}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#888", mt: 1, display: "block" }}
              >
                🕒 Prijavljeno: {new Date(app.created_at).toLocaleString()}
              </Typography>
            </Paper>
          ))
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Uredi konkurs</DialogTitle>
        <DialogContent>
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
            <TextField
              key={field.name}
              label={field.label}
              fullWidth
              margin="dense"
              value={editJob[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          ))}

          <TextField
            label="Datum isteka"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={editJob.date?.split("T")[0] || ""}
            onChange={(e) => handleFieldChange("date", e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editJob.cv}
                  onChange={(e) => handleFieldChange("cv", e.target.checked)}
                />
              }
              label="CV obavezan"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editJob.experience}
                  onChange={(e) =>
                    handleFieldChange("experience", e.target.checked)
                  }
                />
              }
              label="Iskustvo obavezno"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Otkaži</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Spremi
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
