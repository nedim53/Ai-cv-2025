import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";
import useUser from "@/lib/useUser";
import SearchBar from "@/components/search";

export default function HomePage() {
  const { user, loading } = useUser();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [jobType, setJobType] = useState("");
  const [recommendedJobs, setRecommendedJobs] = useState([]);
const [detectedCategory, setDetectedCategory] = useState("");
const [keywords, setKeywords] = useState([]);
const [loadingRecommended, setLoadingRecommended] = useState(false);



const fetchRecommended = async () => {
  if (!user?.id) return;
  setLoadingRecommended(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/user-job-analysis/${user.id}`);
    const data = await res.json();

    console.log("Preporučeni poslovi:", data.results);
    console.log("Kategorija:", data.category);
    console.log("Ključne riječi:", data.keywords);
    setRecommendedJobs(data.results || []);
setDetectedCategory(data.category || "");
setKeywords(data.keywords || []);
    setLoadingRecommended(false);

  } catch (err) {
    console.error("Greška pri dohvaćanju preporuka:", err);
    setLoadingRecommended(false);
  }
};


  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setJobs(data);
    };
    fetchJobs();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "#141414",
        color: "#ffffff",
        minHeight: "100vh",
        px: { xs: 2, sm: 4 },
        backgroundImage: "linear-gradient(to bottom, #141414, #000000)",
      }}
    >
      <Navbar user={user} loading={loading} />

      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#e50914",
            fontWeight: 700,
            mb: 1,
            fontFamily: "Helvetica Neue, sans-serif",
          }}
        >
          Dobrodošli
        </Typography>
        <Typography variant="h6" sx={{ color: "#999999" }}>
          Pregledaj otvorene pozicije i pronađi svoju priliku.
        </Typography>
        <Button
  onClick={fetchRecommended}
  variant="contained"
  sx={{
    bgcolor: "#e50914",
    color: "#fff",
    fontWeight: "bold",
    mt: 2,
    mb: 4
  }}
>
  🧠 Nađi mi posao
</Button>
{loadingRecommended && <CircularProgress sx={{ color: "#00e6b8", mt: 2 }} />}

{recommendedJobs.length > 0 && (
  <Box sx={{ mb: 6 }}>
    <Typography variant="h5" sx={{ color: "#00e6b8", mb: 2 }}>
      🔎 Preporučeni poslovi ({detectedCategory})
    </Typography>
    <Typography variant="body1" sx={{ color: "#aaa", mb: 2 }}>
      Ključne riječi: {keywords.join(", ")}
    </Typography>

    <Grid container spacing={3}>
      {recommendedJobs.map((job) => (
        <Grid item xs={12} sm={6} md={4} key={job.id}>
          <Card sx={{ backgroundColor: "#1f1f1f", border: "1px solid #00e6b8", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#00e6b8" }}>
                {job.title}
              </Typography>
              <Typography variant="body2">Kompanija: {job.company}</Typography>
              <Typography variant="body2">Grad: {job.city}</Typography>
              <Typography variant="body2">
                Ističe: {new Date(job.date).toLocaleDateString()}
              </Typography>
              <Link href={`/jobdescription/${job.id}`} passHref>
                <Button sx={{ mt: 2, color: "#00e6b8" }}>Pogledaj oglas</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)}

      </Box>

      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          jobType={jobType}
          setJobType={setJobType}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: "#ffffff",
            fontWeight: "bold",
            borderBottom: "2px solid #e50914",
            display: "inline-block",
            pb: 0.5,
          }}
        >
          Najnoviji konkursi
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress sx={{ color: "#e50914" }} />
        </Box>
      ) : jobs.length === 0 ? (
        <Typography sx={{ color: "#999999" }}>
          Trenutno nema dostupnih konkursa.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {jobs
            .filter((job) => {
              const query = searchTerm.toLowerCase().trim();
              const matchesSearch =
                (job.title || "").toLowerCase().includes(query) ||
                (job.company || "").toLowerCase().includes(query) ||
                (job.city || "").toLowerCase().includes(query);

              const matchesCity =
                selectedCity === "" ||
                job.city.toLowerCase() === selectedCity.toLowerCase();

              const matchesType =
                jobType === "" ||
                (job.type || "").toLowerCase() === jobType.toLowerCase();

              return matchesSearch && matchesCity && matchesType;
            })

            .map((job) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={job.id}
                sx={{ display: "flex" }}
              >
                <Card
                  sx={{
                    flex: 1,
                    backgroundColor: "#1f1f1f",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                    transition: "all 0.3s ease-in-out",
                    border: "1px solid #2a2a2a",
                    "&:hover": {
                      transform: "scale(1.01)",
                      boxShadow: "0 0 3px rgba(229, 9, 20, 0.6)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#e50914",
                          mb: 1,
                          fontSize: "1.1rem",
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Kompanija:</strong> {job.company}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Grad:</strong> {job.city}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Ističe:</strong>{" "}
                        {new Date(job.date).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#bbbbbb",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                          minHeight: "60px",
                          maxHeight: "60px",
                        }}
                      >
                        {job.description}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Link
                        href={`/jobdescription/${job.id}`}
                        passHref
                        legacyBehavior
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            bgcolor: "#e50914",
                            color: "#fff",
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: "8px",
                            "&:hover": {
                              bgcolor: "#b0060f",
                            },
                          }}
                        >
                          Saznaj više
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
}
