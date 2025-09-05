import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";
import useUser from "@/lib/useUser";
import JobForm from "@/components/JobForm";
import { Box, Typography, Paper, Grid, Card, CardContent, Button, CircularProgress } from "@mui/material";
import { Work, People, TrendingUp, Add } from "@mui/icons-material";
import Link from "next/link";

export default function Dashboard() {
  const { user, loading } = useUser();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    recentJobs: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user?.id && user?.role === "hr") {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch user's jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
      }

      // Fetch applications for user's jobs
      const { data: applications, error: appsError } = await supabase
        .from("application_analysis")
        .select("*, jobs!inner(*)")
        .eq("jobs.user_id", user.id);

      if (appsError) {
        console.error("Error fetching applications:", appsError);
        return;
      }

      setStats({
        totalJobs: jobs?.length || 0,
        totalApplications: applications?.length || 0,
        recentJobs: jobs?.slice(0, 3) || []
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <CircularProgress sx={{ color: "#e50914" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <Typography sx={{ color: "#ff4d4d", fontSize: "1.2rem" }}>
          Morate biti prijavljeni da pristupite dashboard-u.
        </Typography>
      </Box>
    );
  }

  if (user.role !== "hr") {
    return (
      <Box sx={{ 
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <Typography sx={{ color: "#ff4d4d", fontSize: "1.2rem" }}>
          Samo HR korisnici mogu pristupiti dashboard-u.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
      minHeight: "100vh", 
      color: "#fff",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(45deg, rgba(220, 38, 38, 0.05) 0%, transparent 50%, rgba(220, 38, 38, 0.02) 100%)",
        pointerEvents: "none",
      },
    }}>
      <Navbar user={user} loading={loading} />
      
      <Box sx={{ p: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 2, 
              color: "#e50914",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 0 20px rgba(229, 9, 20, 0.3)"
            }}
          >
            🏢 HR Dashboard
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#aaa", 
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            Upravljajte svojim poslovima i pratiite aplikacije kandidata
          </Typography>
        </Box>

        {/* Stats Cards */}
        {loadingStats ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
            <CircularProgress sx={{ color: "#e50914" }} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{
                background: "rgba(31, 31, 31, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(229, 9, 20, 0.3)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Work sx={{ fontSize: 40, color: "#e50914", mb: 2 }} />
                  <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    {stats.totalJobs}
                  </Typography>
                  <Typography sx={{ color: "#aaa" }}>
                    Ukupno poslova
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{
                background: "rgba(31, 31, 31, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 230, 184, 0.3)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <People sx={{ fontSize: 40, color: "#00e6b8", mb: 2 }} />
                  <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    {stats.totalApplications}
                  </Typography>
                  <Typography sx={{ color: "#aaa" }}>
                    Ukupno aplikacija
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{
                background: "rgba(31, 31, 31, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <TrendingUp sx={{ fontSize: 40, color: "#f59e0b", mb: 2 }} />
                  <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    {stats.recentJobs.length}
                  </Typography>
                  <Typography sx={{ color: "#aaa" }}>
                    Nedavni poslovi
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Recent Jobs */}
        {stats.recentJobs.length > 0 && (
          <Paper sx={{
            background: "rgba(31, 31, 31, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
            p: 4,
            mb: 6,
          }}>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: "600", mb: 3 }}>
              📋 Nedavno objavljeni poslovi
            </Typography>
            <Grid container spacing={2}>
              {stats.recentJobs.map((job) => (
                <Grid item xs={12} md={4} key={job.id}>
                  <Card sx={{
                    background: "rgba(42, 42, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ color: "#e50914", mb: 1, fontSize: "1.1rem" }}>
                        {job.title}
                      </Typography>
                      <Typography sx={{ color: "#aaa", fontSize: "0.9rem", mb: 1 }}>
                        {job.company}
                      </Typography>
                      <Typography sx={{ color: "#aaa", fontSize: "0.8rem" }}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Create Job Form */}
        <Paper sx={{
          background: "rgba(31, 31, 31, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 3,
          p: 4,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Add sx={{ fontSize: 30, color: "#e50914", mr: 2 }} />
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: "600" }}>
              Kreiraj novi konkurs
            </Typography>
          </Box>
          <JobForm />
        </Paper>
      </Box>
    </Box>
  );
}
