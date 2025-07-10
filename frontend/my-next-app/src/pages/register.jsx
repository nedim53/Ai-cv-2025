import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  InputLabel,
} from "@mui/material";
import { FormControl, Select, MenuItem } from "@mui/material";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();

 const handleRegister = async (e) => {
  e.preventDefault();
  const form = e.target;

  const email = form.email.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const role = form.role.value;

  if (password !== confirmPassword) {
    alert("Lozinke se ne podudaraju.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      
    },
  });

  if (error) {
    alert("Greška " + error.message);
    return;
  }

  
  if (data && data.user) {
const userData = {
  auth_id: data.user.id,
  name: form.ime.value,
  surname: form.prezime.value,
  email,
  role,
  telephone: form.telefon.value,
};

  const { error: insertError } = await supabase.from("users").insert([userData]);

  if (insertError) {
    alert("Greška prilikom unosa u bazu: " + insertError.message);
    return;
  }

  alert("Uspješna registracija! Provjerite email i nakon potvrde se ulogujte.");
  router.push("/login");
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
          maxWidth: 500,
        }}
      >
        <form onSubmit={handleRegister}>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            sx={{ color: "#ff1a1a", mb: 4 }}
          >
            Napravi račun na Poslovi.ba
          </Typography>

          <TextField
            label="Ime"
            variant="filled"
            name="ime"
            fullWidth
            required
            sx={{
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          <TextField
            label="Prezime"
            variant="filled"
            name="prezime"
            fullWidth
            required
            sx={{
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          <TextField
            label="Email"
            name="email"
            variant="filled"
            fullWidth
            type="email"
            required
            sx={{
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          <TextField
            label="Telefon"
            variant="filled"
            name="telefon"
            fullWidth
            type="tel"
            required
            sx={{
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
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
              mb: 3,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          <TextField
            label="Potvrdi lozinku"
            variant="filled"
            fullWidth
            type="password"
            name="confirmPassword"
            required
            sx={{
              mb: 4,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              bgcolor: "#2a2a2a",
              borderRadius: 1,
            }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="role-label">Uloga</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              defaultValue="user"
              label="Uloga"
              sx={{ bgcolor: "#2a2a2a", color: "#fff" }}
            >
              <MenuItem value="user">Tražim posao</MenuItem>
              <MenuItem value="hr">Objavljujem poslove</MenuItem>
            </Select>
          </FormControl>

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
            Registracija
          </Button>
        </form>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 3, color: "#ccc" }}
        >
          Već imate račun?{" "}
          <Link href="/login" passHref legacyBehavior>
            <MuiLink sx={{ color: "#ff4d4d", ":hover": { color: "#ff1a1a" } }}>
              Login ovdje
            </MuiLink>
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
