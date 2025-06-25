import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter} from "next/router";

export default function Login() {
  const router = useRouter();
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Greška: " + error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        overflowX: "hidden",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          bgcolor: "#1e1e1e",
          color: "#fff",
          p: 4,
          borderRadius: 4,
          border: "1px solid #ff1a1a",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <form onSubmit={handleLogin}>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            sx={{ color: "#ff1a1a", mb: 4 }}
          >
            Dobrodošli na Poslovi.ba
          </Typography>

          {/* Email */}
          <TextField
            label="Email"
            variant="filled"
            fullWidth
            name="email"
            type="email"
            required
            sx={{
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              backgroundColor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          {/* Password */}
          <TextField
            label="Lozinka"
            variant="filled"
            name="password"
            fullWidth
            type="password"
            required
            sx={{
              mb: 4,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              backgroundColor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#ff1a1a",
              fontWeight: "bold",
              ":hover": { bgcolor: "#cc0000" },
            }}
          >
            Login
          </Button>
        </form>
        {/* Register link */}
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 3, color: "#ccc" }}
        >
          Nemate račun?{" "}
          <Link href="/register" passHref legacyBehavior>
            <MuiLink sx={{ color: "#ff4d4d", ":hover": { color: "#ff1a1a" } }}>
              Registrujte se ovdje
            </MuiLink>
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
