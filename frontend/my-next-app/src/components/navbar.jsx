"use client"
import { useState } from "react"
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from "@mui/material"
import { 
  AccountCircle, 
  Dashboard, 
  Work, 
  Person, 
  Logout,
  Login,
  PersonAdd,
  TrendingUp
} from "@mui/icons-material"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import useUser from "@/lib/useUser"

export default function Navbar({ user, loading }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    handleClose()
  }

  if (loading) {
    return (
      <AppBar position="static" sx={{ bgcolor: "#1a1a1a", borderBottom: "1px solid #333" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ color: "#e50914", fontWeight: "bold" }}>
            AI CV Analyzer
      </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar 
      position="static" 
      sx={{
        bgcolor: "rgba(26, 26, 26, 0.95)", 
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(229, 9, 20, 0.2)",
        boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
        <Typography
            variant="h6" 
          sx={{
              color: "#e50914", 
            fontWeight: "bold",
              fontSize: "1.5rem",
              "&:hover": {
                color: "#ff1a1a"
              }
            }}
          >
            AI CV Analyzer
        </Typography>
        </Link>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button 
              sx={{ 
                color: "#fff", 
                fontWeight: 500,
                "&:hover": { color: "#e50914" }
              }}
            >
              Početna
            </Button>
          </Link>
          
          {user && (
            <>
              {user.role === "hr" && (
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <Button 
            sx={{
                      color: "#fff", 
                      fontWeight: 500,
                      "&:hover": { color: "#e50914" }
                    }}
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <Link href="/findMyJob" style={{ textDecoration: "none" }}>
                <Button 
                  sx={{ 
                    color: "#fff", 
                    fontWeight: 500,
                    "&:hover": { color: "#e50914" }
                  }}
                >
                  Nađi posao
                </Button>
              </Link>
              
              <Link href="/statistic" style={{ textDecoration: "none" }}>
                <Button 
                  sx={{ 
                    color: "#fff", 
                    fontWeight: 500,
                    "&:hover": { color: "#e50914" }
                  }}
                >
                  Statistike
                </Button>
              </Link>
            </>
          )}
        </Box>

        {/* User Menu / Auth Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              {/* User Avatar and Menu */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  "&:hover": { 
                    bgcolor: "rgba(229, 9, 20, 0.1)" 
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: "#e50914",
                    width: 32,
                    height: 32,
                    fontSize: "0.9rem"
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
                sx={{
                  "& .MuiPaper-root": {
                    bgcolor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: 2,
                    mt: 1
                  }
                }}
              >
                <MenuItem 
                  onClick={handleClose}
                  sx={{ 
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(229, 9, 20, 0.1)" }
                  }}
                >
                  <Person sx={{ mr: 1, fontSize: "1.2rem" }} />
                  <Link href="/profil" style={{ textDecoration: "none", color: "inherit" }}>
                    Profil
                  </Link>
                </MenuItem>
                
                {user.role === "hr" && (
                  <MenuItem 
                    onClick={handleClose}
                    sx={{ 
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(229, 9, 20, 0.1)" }
                    }}
                  >
                    <Dashboard sx={{ mr: 1, fontSize: "1.2rem" }} />
                    <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
                      Dashboard
                    </Link>
                  </MenuItem>
                )}
                
                <MenuItem 
                  onClick={handleClose}
                  sx={{ 
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(229, 9, 20, 0.1)" }
                  }}
                >
                  <TrendingUp sx={{ mr: 1, fontSize: "1.2rem" }} />
                  <Link href="/statistic" style={{ textDecoration: "none", color: "inherit" }}>
                    Statistike
                  </Link>
                </MenuItem>
                
                <Divider sx={{ bgcolor: "#333", my: 1 }} />
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    color: "#ff4444",
                    "&:hover": { bgcolor: "rgba(255, 68, 68, 0.1)" }
                  }}
                >
                  <Logout sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Odjavi se
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Login/Register Buttons for non-authenticated users */
            <Box sx={{ display: "flex", gap: 1 }}>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
              sx={{
                    color: "#e50914",
                    borderColor: "#e50914",
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "#ff1a1a",
                      bgcolor: "rgba(229, 9, 20, 0.1)"
                    }
                  }}
                >
                  Prijavi se
                </Button>
              </Link>
              
              <Link href="/register" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
                  startIcon={<PersonAdd />}
          sx={{
                    bgcolor: "#e50914",
                    color: "#fff",
                    fontWeight: 500,
            "&:hover": {
                      bgcolor: "#b0060f"
                    }
                  }}
                >
                  Registruj se
        </Button>
              </Link>
            </Box>
          )}
    </Box>
      </Toolbar>
    </AppBar>
  )
}