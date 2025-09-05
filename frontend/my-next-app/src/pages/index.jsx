"use client"

import { useEffect, useState } from "react"
import { Box, Typography, Button, Card, CardContent, Grid, CircularProgress } from "@mui/material"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import useUser from "@/lib/useUser"
import SearchBar from "@/components/search"

export default function HomePage() {
  const { user, loading } = useUser()
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [jobType, setJobType] = useState("")
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [detectedCategory, setDetectedCategory] = useState("")
  const [keywords, setKeywords] = useState([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)

  const fetchRecommended = async () => {
    if (!user?.id) return
    setLoadingRecommended(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/user-job-analysis/${user.id}`)
      const data = await res.json()

      setRecommendedJobs(data.results || [])
      setDetectedCategory(data.category || "")
      setKeywords(data.keywords || [])
      setLoadingRecommended(false)
    } catch (err) {
      console.error("Greška pri dohvaćanju preporuka:", err)
      setLoadingRecommended(false)
    }
  }

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

      if (!error) setJobs(data)
    }
    fetchJobs()
  }, [])

  return (
    <>
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a0000 50%, #000000 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(229, 9, 20, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(0, 230, 184, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .glass-card {
          background: rgba(31, 31, 31, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .glow-red {
          box-shadow: 0 0 20px rgba(229, 9, 20, 0.3);
          transition: all 0.3s ease;
        }
        
        .glow-red:hover {
          box-shadow: 0 0 30px rgba(229, 9, 20, 0.5);
          transform: translateY(-2px);
        }
        
        .glow-cyan {
          box-shadow: 0 0 20px rgba(0, 230, 184, 0.3);
          border: 1px solid rgba(0, 230, 184, 0.4);
        }
        
        .glow-cyan:hover {
          box-shadow: 0 0 30px rgba(0, 230, 184, 0.5);
          transform: translateY(-2px);
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .search-container {
          background: rgba(15, 15, 15, 0.9);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(229, 9, 20, 0.2);
          border-radius: 16px;
          padding: 20px;
          margin: 0 auto;
          max-width: 500px;
        }
      `}</style>

      <Box className="hero-gradient" sx={{ minHeight: "100vh", color: "#ffffff", position: "relative" }}>
        <Navbar user={user} loading={loading} />

        <Box sx={{ textAlign: "center", py: 8, px: { xs: 2, sm: 4 }, position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            className="text-shadow"
            sx={{
              color: "#e50914",
              fontWeight: 800,
              mb: 2,
              fontFamily: "Helvetica Neue, sans-serif",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Dobrodošli
          </Typography>

          {user?.role === "user" && (
            <>
              <Typography
                variant="h5"
                sx={{
                  color: "#cccccc",
                  mb: 4,
                  fontWeight: 300,
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Pregledaj otvorene pozicije i pronađi svoju priliku.
              </Typography>

              <Button
                onClick={fetchRecommended}
                variant="contained"
                className="glow-red pulse-animation"
                sx={{
                  bgcolor: "#e50914",
                  color: "#fff",
                  fontWeight: "bold",
                  mt: 2,
                  mb: 6,
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#b0060f",
                  },
                }}
              >
                🧠 Nađi mi posao
              </Button>

              {loadingRecommended && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                  <CircularProgress sx={{ color: "#00e6b8" }} size={40} />
                </Box>
              )}

              {recommendedJobs.length > 0 && (
                <Box sx={{ mb: 8, px: { xs: 2, sm: 4 } }}>
                  <Typography
                    variant="h4"
                    className="text-shadow"
                    sx={{
                      color: "#00e6b8",
                      mb: 2,
                      fontWeight: 700,
                      fontSize: { xs: "1.8rem", md: "2.2rem" },
                    }}
                  >
                    🔎 Preporučeni poslovi ({detectedCategory})
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#aaa",
                      mb: 4,
                      fontSize: "1.1rem",
                      fontStyle: "italic",
                    }}
                  >
                    Ključne riječi: {keywords.join(", ")}
                  </Typography>

                  <Grid container spacing={3} sx={{ maxWidth: "1200px", mx: "auto" }}>
                    {recommendedJobs.map((job) => (
                      <Grid item xs={12} sm={6} md={4} key={job.id}>
                        <Card className="glass-card glow-cyan" sx={{ borderRadius: 3, height: "100%" }}>
                          <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#00e6b8",
                                fontWeight: 600,
                                mb: 2,
                                fontSize: "1.2rem",
                              }}
                            >
                              {job.title}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: "#ddd" }}>
                              <strong>Kompanija:</strong> {job.company}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: "#ddd" }}>
                              <strong>Grad:</strong> {job.city}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: "#ddd" }}>
                              <strong>Ističe:</strong> {new Date(job.date).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ mt: "auto" }}>
                              <Link href={`/jobdescription/${job.id}`} passHref>
                                <Button
                                  fullWidth
                                  sx={{
                                    color: "#00e6b8",
                                    borderColor: "#00e6b8",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    "&:hover": {
                                      bgcolor: "rgba(0, 230, 184, 0.1)",
                                      borderColor: "#00e6b8",
                                    },
                                  }}
                                  variant="outlined"
                                >
                                  Pogledaj oglas
                                </Button>
                              </Link>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, mb: 6, position: "relative", zIndex: 1 }}>
          <Box className="search-container">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              jobType={jobType}
              setJobType={setJobType}
            />
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, mb: 4, position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            className="text-shadow"
            sx={{
              mb: 4,
              color: "#ffffff",
              backgroundColor: "rgba(15, 15, 15, 0.8)",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: 700,
              borderBottom: "3px solid #e50914",
              display: "inline-block",
              pb: 1,
              fontSize: { xs: "1.8rem", md: "2.2rem" },
            }}
          >
            Najnoviji konkursi
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, pb: 6, position: "relative", zIndex: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#e50914" }} size={50} />
            </Box>
          ) : jobs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography sx={{ color: "#999999", fontSize: "1.2rem" }}>Trenutno nema dostupnih konkursa.</Typography>
            </Box>
          ) : (
            <Grid container spacing={4} sx={{ maxWidth: "1200px", mx: "auto" }}>
              {jobs
                .filter((job) => {
                  const query = searchTerm.toLowerCase().trim()
                  const matchesSearch =
                    (job.title || "").toLowerCase().includes(query) ||
                    (job.company || "").toLowerCase().includes(query) ||
                    (job.city || "").toLowerCase().includes(query)

                  const matchesCity = selectedCity === "" || job.city.toLowerCase() === selectedCity.toLowerCase()

                  const matchesType = jobType === "" || (job.type || "").toLowerCase() === jobType.toLowerCase()

                  return matchesSearch && matchesCity && matchesType
                })
                .map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id} sx={{ display: "flex" }}>
                    <Card
                      className="glass-card glow-red"
                      sx={{
                        flex: 1,
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          flexGrow: 1,
                          p: 3,
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#e50914",
                              mb: 2,
                              fontSize: "1.3rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {job.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, color: "#ddd", fontWeight: 500 }}>
                            <strong style={{ color: "#fff" }}>Kompanija:</strong> {job.company}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, color: "#ddd", fontWeight: 500 }}>
                            <strong style={{ color: "#fff" }}>Grad:</strong> {job.city}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2, color: "#ddd", fontWeight: 500 }}>
                            <strong style={{ color: "#fff" }}>Ističe:</strong> {new Date(job.date).toLocaleDateString()}
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
                              lineHeight: 1.4,
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
                                borderRadius: "10px",
                                py: 1.2,
                                fontSize: "1rem",
                                "&:hover": {
                                  bgcolor: "#b0060f",
                                  transform: "scale(1.02)",
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
      </Box>
    </>
  )
}
