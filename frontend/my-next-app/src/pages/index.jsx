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

export default function HomePage() {
  const { user, loading } = useUser(); 
  const [jobs, setJobs] = useState([]);

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
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id} sx={{ display: "flex" }}>
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
                    <Link href={`/jobdescription/${job.id}`} passHref legacyBehavior>
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
