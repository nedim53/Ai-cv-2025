import React, { useEffect, useState } from "react";
import useUser from "@/lib/useUser";
import Navbar from "@/components/navbar";
import { Box, Typography, CircularProgress, Card, CardContent, Button } from "@mui/material";

export default function FindMyJob() {
  const { user, loading } = useUser();
  const [jobs, setJobs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [category, setCategory] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const fetchRecommendedJobs = async () => {
    if (!user?.id) return;

    setFetching(true);

    try {
      const res = await fetch(`${API_BASE}/find-my-jobs/${user.id}`);
      const data = await res.json();

      setJobs(data.results || []);
      setKeywords(data.keywords || []);

      setCategory(data.category || "");

    } catch (err) {
      console.error("Greška:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
  if (!loading && user?.id) {
    fetchRecommendedJobs();
  }
}, [loading, user?.id]);


  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Navbar user={user} loading={loading} />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, color: "#ff1a1a" }}>
          🔎 Preporučeni poslovi za tebe
        </Typography>

         <Typography variant="h4" sx={{ mb: 3, color: "#ff1a1a" }}>
          Detektovana kategorija: {category}
        </Typography>

        {fetching ? (
          <CircularProgress sx={{ color: "#ff1a1a" }} />
        ) : jobs.length === 0 ? (
          <Typography sx={{ color: "#ccc" }}>
            Nema preporučenih poslova. Uvjeri se da si uploadovao validan CV.
          </Typography>
        ) : (
          <>
            <Typography sx={{ mb: 2, color: "#999" }}>
               Ključne riječi iz tvog CV-a: {keywords.join(", ")}
            </Typography>

            {jobs.map((job) => (
              <Card
                key={job.id}
                sx={{
                  mb: 3,
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #ff1a1a",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 1 }}>
                    {job.title}
                  </Typography>
                  <Typography>Kompanija: {job.company}</Typography>
                  <Typography>Grad: {job.city}</Typography>
                  <Typography>
                    Ističe: {new Date(job.date).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ mt: 1, color: "#ccc" }}>
                    {job.description}
                  </Typography>
                  <Button
                    href={`/jobdescription/${job.id}`}
                    sx={{ mt: 2, color: "#ff1a1a" }}
                  >
                    Pogledaj oglas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}
