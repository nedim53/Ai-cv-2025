"use client"
import { Box, TextField, Button, Typography, Paper, Link as MuiLink } from "@mui/material"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/router"
import { useNotification } from "@/components/NotificationProvider"

export default function Login() {
  const router = useRouter()
  const { showError } = useNotification()

  const handleLogin = async (e) => {
    e.preventDefault()
    const form = e.target
    const email = form.email.value
    const password = form.password.value

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      showError("Greška: " + error.message)
      return
    }

    router.push("/")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0f0f0f 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        overflowX: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(220, 38, 38, 0.1) 0%, transparent 50%, rgba(220, 38, 38, 0.05) 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Paper
        elevation={24}
        sx={{
          background: "rgba(30, 30, 30, 0.95)",
          backdropFilter: "blur(20px)",
          color: "#fff",
          p: { xs: 3, md: 5 },
          borderRadius: 6,
          border: "2px solid rgba(220, 38, 38, 0.3)",
          width: "100%",
          maxWidth: 450,
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.25)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 6,
            padding: "2px",
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.6), transparent, rgba(220, 38, 38, 0.3))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            pointerEvents: "none",
          },
        }}
      >
        <form onSubmit={handleLogin}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="800"
            sx={{
              background: "linear-gradient(135deg, #ff1a1a, #ff4d4d)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 5,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 0 30px rgba(220, 38, 38, 0.5)",
            }}
          >
            Dobrodošli na Poslovi.ba
          </Typography>

          <TextField
            label="Email"
            variant="filled"
            fullWidth
            name="email"
            type="email"
            required
            sx={{
              mb: 3,
              "& .MuiFilledInput-root": {
                background: "rgba(42, 42, 42, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(42, 42, 42, 0.9)",
                  borderColor: "rgba(220, 38, 38, 0.5)",
                },
                "&.Mui-focused": {
                  background: "rgba(42, 42, 42, 1)",
                  borderColor: "#ff1a1a",
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
                },
              },
              "& .MuiFilledInput-input": {
                color: "#fff",
                fontSize: "1.1rem",
              },
              "& .MuiInputLabel-root": {
                color: "#bbb",
                fontSize: "1rem",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ff4d4d",
              },
            }}
          />

          <TextField
            label="Lozinka"
            variant="filled"
            name="password"
            fullWidth
            type="password"
            required
            sx={{
              mb: 4,
              "& .MuiFilledInput-root": {
                background: "rgba(42, 42, 42, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(42, 42, 42, 0.9)",
                  borderColor: "rgba(220, 38, 38, 0.5)",
                },
                "&.Mui-focused": {
                  background: "rgba(42, 42, 42, 1)",
                  borderColor: "#ff1a1a",
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
                },
              },
              "& .MuiFilledInput-input": {
                color: "#fff",
                fontSize: "1.1rem",
              },
              "& .MuiInputLabel-root": {
                color: "#bbb",
                fontSize: "1rem",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ff4d4d",
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #ff1a1a, #cc0000)",
              fontWeight: "bold",
              fontSize: "1.2rem",
              py: 2,
              borderRadius: 3,
              textTransform: "none",
              boxShadow: "0 10px 30px rgba(220, 38, 38, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #cc0000, #990000)",
                transform: "translateY(-2px)",
                boxShadow: "0 15px 40px rgba(220, 38, 38, 0.6)",
              },
            }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body1" textAlign="center" sx={{ mt: 4, color: "#ccc", fontSize: "1.1rem" }}>
          Nemate račun?{" "}
          <Link href="/register" passHref legacyBehavior>
            <MuiLink
              sx={{
                color: "#ff4d4d",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#ff1a1a",
                  textShadow: "0 0 10px rgba(220, 38, 38, 0.5)",
                },
              }}
            >
              Registrujte se ovdje
            </MuiLink>
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
