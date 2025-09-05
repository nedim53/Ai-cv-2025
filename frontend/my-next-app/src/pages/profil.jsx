"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
import { Box, Typography, CircularProgress, Avatar, Divider, Button, TextField, Paper, Input } from "@mui/material"
import useUser from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { AccountCircle } from "@mui/icons-material"
import { useNotification } from "@/components/NotificationProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function Profil() {
  const { user, loading } = useUser()
  const { showSuccess, showError } = useNotification()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [cvFile, setCvFile] = useState(null)
  const [uploadedPath, setUploadedPath] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  React.useEffect(() => {
    if (user) {
      setFormData(user)
      setUploadedPath(user.cv_url || "")
    }
  }, [user])

  const handleCvUpload = async () => {
    if (!cvFile || !user) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append("user_id", user.id)
    formData.append("file", cvFile)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-cv`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        showError("Greška: " + (data.detail || "Neuspješan upload."))
        return
      }

      setUploadedPath(data.cv_url)
      showSuccess("✅ CV uspješno uploadovan i analiziran!")
    } catch (err) {
      console.error("❌ Upload greška:", err)
      showError("Greška pri slanju fajla.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCvDownload = async () => {
    if (!uploadedPath) {
      showError("CV nije dostupan.")
      return
    }

    const { data, error } = await supabase.storage.from("user-uploads").download(uploadedPath)

    if (error) {
      console.error("Greška pri downloadu:", error.message)
      showError("Greška pri preuzimanju CV-a: " + error.message)
      return
    }

    const blobUrl = URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = uploadedPath.split("/").pop() // name of the file
    document.body.appendChild(a) // this is for firefoxs
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl) // this is just for cleaning up
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    const { name, surname, telephone } = formData

    const { error } = await supabase.from("users").update({ name, surname, telephone }).eq("id", user.id)

    if (!error) {
      showSuccess("Podaci ažurirani.")
      setEditMode(false)
    } else {
      showError("Greška pri ažuriranju: " + error.message)
    }
  }

  return (
    <Box
      sx={{
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
          background:
            "linear-gradient(45deg, rgba(220, 38, 38, 0.05) 0%, transparent 50%, rgba(220, 38, 38, 0.02) 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Navbar user={user} loading={loading} />
      <LoadingSpinner loading={isAnalyzing} message="Analiziram CV..." />
      <Box sx={{ px: 3, py: 6, display: "flex", justifyContent: "center" }}>
        {loading ? (
          <CircularProgress sx={{ color: "#ff1a1a", mt: 8 }} />
        ) : !user ? (
          <Typography sx={{ mt: 4, color: "#ff4d4d" }}>Niste prijavljeni.</Typography>
        ) : (
          <Paper
            elevation={24}
            sx={{
              width: "100%",
              maxWidth: 650,
              background: "rgba(30, 30, 30, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 6,
              px: { xs: 3, md: 5 },
              py: 6,
              border: "2px solid rgba(220, 38, 38, 0.3)",
              boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.25)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 6,
                padding: "2px",
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.4), transparent, rgba(220, 38, 38, 0.2))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                pointerEvents: "none",
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                sx={{
                  background: "linear-gradient(135deg, #ff1a1a, #cc0000)",
                  width: 120,
                  height: 120,
                  mb: 3,
                  boxShadow: "0 10px 30px rgba(220, 38, 38, 0.4)",
                }}
              >
                <AccountCircle sx={{ fontSize: 80 }} />
              </Avatar>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #ff1a1a, #ff4d4d)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 4,
                  textShadow: "0 0 30px rgba(220, 38, 38, 0.5)",
                }}
              >
                Moj profil
              </Typography>
            </Box>

            <Divider sx={{ mb: 5, bgcolor: "rgba(220, 38, 38, 0.3)", height: 2 }} />

            {["name", "surname", "telephone"].map((field) => (
              <Box sx={{ mb: 4 }} key={field}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#ff4d4d",
                    mb: 1,
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  {field === "name" ? "Ime" : field === "surname" ? "Prezime" : "Telefon"}
                </Typography>
                {editMode ? (
                  <TextField
                    variant="filled"
                    fullWidth
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    sx={{
                      "& .MuiFilledInput-root": {
                        background: "rgba(42, 42, 42, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&:hover": {
                          borderColor: "rgba(220, 38, 38, 0.5)",
                        },
                        "&.Mui-focused": {
                          borderColor: "#ff1a1a",
                          boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
                        },
                      },
                      "& .MuiFilledInput-input": { color: "#fff", fontSize: "1.1rem" },
                    }}
                  />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#eee",
                      fontWeight: "500",
                      p: 2,
                      background: "rgba(42, 42, 42, 0.5)",
                      borderRadius: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {user[field]}
                  </Typography>
                )}
              </Box>
            ))}

            <ProfileItem label="Email" value={user.email} />
            <ProfileItem label="Uloga" value={user.role} />
            <ProfileItem label="Korisnički ID" value={user.id} />

            {user.role === "user" && (
              <Paper
                elevation={12}
                sx={{
                  mt: 6,
                  p: 4,
                  borderRadius: 4,
                  background: uploadedPath 
                    ? "rgba(42, 42, 42, 0.8)" 
                    : "rgba(30, 30, 30, 0.6)",
                  backdropFilter: "blur(15px)",
                  border: uploadedPath 
                    ? "2px solid rgba(0, 230, 184, 0.4)" 
                    : "2px dashed rgba(220, 38, 38, 0.4)",
                  boxShadow: uploadedPath 
                    ? "0 15px 35px rgba(0, 230, 184, 0.15)" 
                    : "0 15px 35px rgba(220, 38, 38, 0.15)",
                }}
              >
                {uploadedPath ? (
                  /* CV je uploadovan - prikaži opcije za mijenjanje */
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "#00e6b8",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        ✅ CV je uploadovan
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      p: 3, 
                      background: "rgba(0, 230, 184, 0.1)", 
                      borderRadius: 3, 
                      border: "1px solid rgba(0, 230, 184, 0.3)",
                      mb: 3
                    }}>
                      <Typography sx={{ color: "#00e6b8", fontWeight: "600", mb: 1 }}>
                        📄 Trenutni CV: {uploadedPath.split('/').pop()}
                      </Typography>
                      <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                        Vaš CV je uspješno uploadovan i analiziran. Možete ga pregledati ili uploadovati novi.
                      </Typography>
                    </Box>

                    <Input
                      type="file"
                      inputProps={{ accept: ".pdf,.docx" }}
                      onChange={(e) => setCvFile(e.target.files[0])}
                      sx={{
                        mb: 3,
                        background: "rgba(30, 30, 30, 0.8)",
                        p: 2,
                        borderRadius: 2,
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        width: "100%",
                      }}
                    />
                    
                    {cvFile && (
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#ff4d4d",
                          mb: 3,
                          fontWeight: "600",
                        }}
                      >
                        📎 Novi fajl: {cvFile.name}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        onClick={handleCvUpload}
                        disabled={!cvFile}
                        sx={{
                          background: cvFile 
                            ? "linear-gradient(135deg, #ff1a1a, #cc0000)" 
                            : "rgba(100, 100, 100, 0.3)",
                          color: cvFile ? "#fff" : "#666",
                          fontWeight: "bold",
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "1.1rem",
                          boxShadow: cvFile ? "0 8px 25px rgba(220, 38, 38, 0.4)" : "none",
                          "&:hover": cvFile ? {
                            background: "linear-gradient(135deg, #cc0000, #990000)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 35px rgba(220, 38, 38, 0.6)",
                          } : {},
                        }}
                      >
                        {cvFile ? "🔄 Zamijeni CV" : "Odaberite novi CV"}
                      </Button>

                      <Button
                        onClick={handleCvDownload}
                        sx={{
                          color: "#00e6b8",
                          textTransform: "none",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          px: 3,
                          py: 1.5,
                          borderRadius: 3,
                          border: "2px solid #00e6b8",
                          "&:hover": {
                            background: "rgba(0, 230, 184, 0.1)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        📄 Pregledaj CV
                      </Button>
                    </Box>
                  </>
                ) : (
                  /* CV nije uploadovan - prikaži ljepši prikaz */
                  <>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: "#ff4d4d",
                          mb: 2,
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        📄 Uploadujte svoj CV
                      </Typography>
                      
                      <Typography sx={{ 
                        color: "#aaa", 
                        fontSize: "1.1rem", 
                        lineHeight: 1.6,
                        maxWidth: "400px",
                        mx: "auto"
                      }}>
                        Uploadujte svoj CV da biste koristili AI analizu i pronašli najbolje poslove za vas.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 4, 
                      background: "rgba(220, 38, 38, 0.05)", 
                      borderRadius: 3, 
                      border: "2px dashed rgba(220, 38, 38, 0.3)",
                      mb: 3,
                      textAlign: "center"
                    }}>
                      <Typography sx={{ color: "#ff4d4d", fontWeight: "600", mb: 2 }}>
                        📎 Podržani formati: PDF, DOCX
                      </Typography>
                      <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                        Maksimalna veličina: 10MB
                      </Typography>
                    </Box>

                    <Input
                      type="file"
                      inputProps={{ accept: ".pdf,.docx" }}
                      onChange={(e) => setCvFile(e.target.files[0])}
                      sx={{
                        mb: 3,
                        background: "rgba(30, 30, 30, 0.8)",
                        p: 2,
                        borderRadius: 2,
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        width: "100%",
                      }}
                    />
                    
                    {cvFile && (
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#00e6b8",
                          mb: 3,
                          fontWeight: "600",
                          textAlign: "center"
                        }}
                      >
                        ✅ Odabrani fajl: {cvFile.name}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        onClick={handleCvUpload}
                        disabled={!cvFile}
                        sx={{
                          background: cvFile 
                            ? "linear-gradient(135deg, #ff1a1a, #cc0000)" 
                            : "rgba(100, 100, 100, 0.3)",
                          color: cvFile ? "#fff" : "#666",
                          fontWeight: "bold",
                          px: 6,
                          py: 2,
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "1.2rem",
                          boxShadow: cvFile ? "0 8px 25px rgba(220, 38, 38, 0.4)" : "none",
                          "&:hover": cvFile ? {
                            background: "linear-gradient(135deg, #cc0000, #990000)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 35px rgba(220, 38, 38, 0.6)",
                          } : {},
                        }}
                      >
                        {cvFile ? "🚀 Uploaduj CV" : "Odaberite CV fajl"}
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            )}

            <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      fontWeight: "bold",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    ✅ Spasi promjene
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                    sx={{
                      color: "#fff",
                      borderColor: "#666",
                      fontWeight: "bold",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      "&:hover": {
                        borderColor: "#999",
                        background: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    ✖ Otkaži
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setEditMode(true)}
                  sx={{
                    background: "linear-gradient(135deg, #ff1a1a, #cc0000)",
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    "&:hover": {
                      background: "linear-gradient(135deg, #cc0000, #990000)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  ✏️ Ažuriraj podatke
                </Button>
              )}

              <Button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = "/login"
                }}
                variant="outlined"
                sx={{
                  color: "#f59e0b",
                  borderColor: "#f59e0b",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  "&:hover": {
                    borderColor: "#d97706",
                    background: "rgba(245, 158, 11, 0.1)",
                  },
                }}
              >
                🚪 Odjavi se
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

function ProfileItem({ label, value }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          color: "#ff4d4d",
          mb: 1,
          fontWeight: "600",
          fontSize: "1.1rem",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: "#eee",
          fontWeight: "500",
          p: 2,
          background: "rgba(42, 42, 42, 0.5)",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}
