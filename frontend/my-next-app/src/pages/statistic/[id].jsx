import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (jobError || !jobData) {
        setJob(null);
        setLoading(false);
        return;
      }

      setJob(jobData);

      const { data: appData } = await supabase
        .from("application_analysis")
        .select("*")
        .eq("job_id", id);

      const enrichedApps = await Promise.all(
        (appData || []).map(async (app) => {
          const { data: userData } = await supabase
            .from("user")
            .select("name, surname, email, telephone, cv_url")
            .eq("id", app.user_id)
            .maybeSingle();

          return {
            ...app,
            user: userData || { name: "Nepoznat", surname: "" },
          };
        })
      );

      setApplications(enrichedApps);
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <Box sx={{ p: 4, color: "#fff", minHeight: "100vh", bgcolor: "#121212" }}>
        <CircularProgress sx={{ color: "#ff1a1a" }} />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 4, color: "#fff", minHeight: "100vh", bgcolor: "#121212" }}>
        <Typography variant="h5" sx={{ color: "#ff1a1a" }}>
          ❌ Konkurs nije pronađen.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

      <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
        <Typography variant="h4" sx={{ color: "#ff1a1a", fontWeight: "bold", mb: 3 }}>
          📄 Detalji konkursa
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "#1e1e1e",
            border: "1px solid #ff1a1a",
            mb: 5,
          }}
        >
          <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 2 }}>
            {job.title}
          </Typography>
          <GridField label="Kompanija" value={job.company} />
          <GridField label="Datum isteka" value={job.date} />
          <GridField label="Grad" value={job.city} />
          <GridField label="Zadatak" value={job.task} />
          <GridField label="Opis" value={job.description} />
          <GridField label="O nama" value={job.info} />
          <GridField label="Kontakt Email" value={job.email} />
          <GridField label="Kontakt Telefon" value={job.telephone} />
          <GridField
            label="Potrebno"
            value={`CV: ${job.cv ? "Da" : "Ne"}, Iskustvo: ${job.experience ? "Da" : "Ne"}`}
          />
        </Paper>

        <Typography variant="h5" sx={{ mb: 2, color: "#ff1a1a" }}>
          📝 Prijave kandidata
        </Typography>

        {applications.length === 0 ? (
          <Typography sx={{ color: "#aaa" }}>Nema prijava za ovaj konkurs.</Typography>
        ) : (
          applications.map((app, idx) => (
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
                  CV:{" "}
                  <MuiLink
                    href={app.user.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#ff4d4d" }}
                  >
                    Otvori
                  </MuiLink>
                </Typography>
              )}

              <Chip
                label={`Ocjena: ${app.score}`}
                sx={{ bgcolor: "#ff1a1a", color: "#fff", mt: 2 }}
              />

              <Divider sx={{ my: 2, borderColor: "#333" }} />

              <Typography variant="body2" sx={{ color: "#ccc" }}>
                {app.analysis}
              </Typography>

              <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                🕒 Prijavljeno: {new Date(app.created_at).toLocaleString()}
              </Typography>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
}

const GridField = ({ label, value }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
      {label}:
    </Typography>
    <Typography sx={{ color: "#fff" }}>{value}</Typography>
  </Box>
);
