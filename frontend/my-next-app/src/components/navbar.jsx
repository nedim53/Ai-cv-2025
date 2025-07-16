import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";
import useUser from "@/lib/useUser";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <Box
      sx={{
        width: "100%",
        px: 4,
        py: 2,
        borderBottom: "1px solid #ff1a1a",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backdropFilter: "blur(10px)",
        bgcolor: "rgba(15,15,15,0.9)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          background: "linear-gradient(to right, #ff1a1a, #cc0000)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <Link href="/" passHref>
          Poslovi.ba
        </Link>
      </Typography>

      <Stack direction="row" spacing={3}>
        <Link href="/" passHref>
          <Button
            sx={{
              color: "#fff",
              borderBottom: "2px solid transparent",
              "&:hover": {
                borderColor: "#ff1a1a",
                color: "#ff1a1a",
              },
            }}
          >
            Home
          </Button>
        </Link>
        <Link href="/profil" passHref>
          <Button
            sx={{
              color: "#fff",
              borderBottom: "2px solid transparent",
              "&:hover": {
                borderColor: "#ff1a1a",
                color: "#ff1a1a",
              },
            }}
          >
            Profil
          </Button>
        </Link>
        {user?.role ==="hr" && (
           <Link href="/dashboard" passHref>
          <Button
            sx={{
              color: "#fff",
              borderBottom: "2px solid transparent",
              "&:hover": {
                borderColor: "#ff1a1a",
                color: "#ff1a1a",
              },
            }}
          >
            DASHBOARD
          </Button>
        </Link>
        )}
       
        <Link href="/statistic/statistic" passHref>
          <Button
            sx={{
              color: "#fff",
              borderBottom: "2px solid transparent",
              "&:hover": {
                borderColor: "#ff1a1a",
                color: "#ff1a1a",
              },
            }}
          >
            StATISTIKA
          </Button>
        </Link>

{user?.role ==="user" && (
        <Link href="/findMyJob" passHref>
          <Button
            sx={{
              color: "#fff",
              borderBottom: "2px solid transparent",
              "&:hover": {
                borderColor: "#ff1a1a",
                color: "#ff1a1a",
              },
            }}
          >
            Pronađi posao
          </Button>
        </Link>
)}
      </Stack>
      {loading ? (
        <Typography variant="body1" sx={{ color: "#ff4d4d" }}>
          Provjera...
        </Typography>
      ) : user ? (
        <Typography
          variant="body1"
          sx={{ color: "#ff4d4d", fontWeight: "bold" }}
        >
          {user.name} {user.surname}
        </Typography>
      ) : (
        <Stack direction="row" spacing={2}>
          <Link href="/login" passHref>
            <Button
              sx={{
                color: "#ff4d4d",
                fontWeight: "bold",
                "&:hover": { color: "#fff" },
              }}
            >
              Login
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button
              sx={{
                color: "#ff4d4d",
                fontWeight: "bold",
                "&:hover": { color: "#fff" },
              }}
            >
              Register
            </Button>
          </Link>
        </Stack>
      )}
    </Box>
  );
}
