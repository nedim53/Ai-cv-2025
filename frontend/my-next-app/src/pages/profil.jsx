import React, { useState } from "react";
import Navbar from "@/components/navbar";
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Divider,
  Button,
  TextField,
  Paper,
  Input,
} from "@mui/material";
import useUser from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { AccountCircle } from "@mui/icons-material";

export default function Profil() {
  const { user, loading } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [uploadedPath, setUploadedPath] = useState(""); 

  React.useEffect(() => {
    if (user) {
      setFormData(user);
      setUploadedPath(user.cv_url || ""); 
    }
  }, [user]);

const handleCvUpload = async () => {
  if (!cvFile || !user) return;

  const formData = new FormData();
  formData.append("user_id", user.id); 
  formData.append("file", cvFile);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-cv`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Greška: " + (data.detail || "Neuspješan upload."));
      return;
    }

    setUploadedPath(data.cv_url);
    alert("✅ CV uspješno uploadovan i analiziran!");
  } catch (err) {
    console.error("❌ Upload greška:", err);
    alert("Greška pri slanju fajla.");
  }
};


const handleCvDownload = async () => {
  if (!uploadedPath) {
    alert("CV nije dostupan.");
    return;
  }

  const { data, error } = await supabase.storage
    .from("user-uploads")
    .download(uploadedPath);

  if (error) {
    console.error("Greška pri downloadu:", error.message);
    alert("Greška pri preuzimanju CV-a: " + error.message);
    return;
  }

  const blobUrl = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = uploadedPath.split("/").pop(); // name of the file
  document.body.appendChild(a); // this is for firefoxs
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl); // this is just for cleaning up
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const { name, surname, telephone } = formData;

    const { error } = await supabase
      .from("users")
      .update({ name, surname, telephone })
      .eq("id", user.id);

    if (!error) {
      alert("Podaci ažurirani.");
      setEditMode(false);
    } else {
      alert("Greška pri ažuriranju: " + error.message);
    }
  };

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Navbar user={user} loading={loading} />
      <Box sx={{ px: 3, py: 6, display: "flex", justifyContent: "center" }}>
        {loading ? (
          <CircularProgress sx={{ color: "#ff1a1a", mt: 8 }} />
        ) : !user ? (
          <Typography sx={{ mt: 4, color: "#ff4d4d" }}>
            Niste prijavljeni.
          </Typography>
        ) : (
          <Paper
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: 600,
              bgcolor: "#1e1e1e",
              borderRadius: 4,
              px: 4,
              py: 5,
              border: "1px solid #ff1a1a",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "#ff1a1a", width: 90, height: 90, mb: 2 }}>
                <AccountCircle sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ff1a1a", mb: 3 }}>
                Moj profil
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, bgcolor: "#ff1a1a" }} />

            {["name", "surname", "telephone"].map((field) => (
              <Box sx={{ mb: 3 }} key={field}>
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 0.5 }}>
                  {field === "name" ? "Ime" : field === "surname" ? "Prezime" : "Telefon"}
                </Typography>
                {editMode ? (
                  <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    sx={{
                      bgcolor: "#2a2a2a",
                      input: { color: "#fff" },
                    }}
                  />
                ) : (
                  <Typography variant="h6" sx={{ color: "#eee" }}>
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
                elevation={2}
                sx={{
                  mt: 5,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#2a2a2a",
                  border: "1px dashed #ff4d4d",
                }}
              >
                <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 2 }}>
                  📎 CV datoteka
                </Typography>

                <Input
                  type="file"
                  inputProps={{ accept: ".pdf,.docx" }}
                  onChange={(e) => setCvFile(e.target.files[0])}
                  sx={{
                    mb: 2,
                    bgcolor: "#1e1e1e",
                    p: 1.5,
                    borderRadius: 1,
                    color: "#fff",
                  }}
                />
                {cvFile && (
                  <Typography variant="body2" sx={{ color: "#00e6b8", mb: 2 }}>
                    📎 Odabrani fajl: {cvFile.name}
                  </Typography>
                )}

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    onClick={handleCvUpload}
                    sx={{
                      bgcolor: "#ff1a1a",
                      ":hover": { bgcolor: "#cc0000" },
                      fontWeight: "bold",
                    }}
                  >
                    Upload CV
                  </Button>

                  {uploadedPath && (
                    <Button
                      onClick={handleCvDownload}
                      sx={{
                        color: "#00e6b8",
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                    >
                      📄 Pregledaj CV
                    </Button>
                  )}
                </Box>
              </Paper>
            )}

            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              {editMode ? (
                <>
                  <Button variant="contained" color="success" onClick={handleSave}>
                    ✅ Spasi promjene
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={() => setEditMode(false)}>
                    ✖ Otkaži
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="error" onClick={() => setEditMode(true)}>
                  ✏️ Ažuriraj podatke
                </Button>
              )}
            </Box>

              <Button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }}
  variant="outlined"
  color="warning"
>
  🚪 Odjavi se
</Button>


          </Paper>
        )}
      </Box>
    </Box>
  );
}

function ProfileItem({ label, value }) {
  return (
    <Box sx={{ mb: 2, color: "white" }}>
      <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Box>
  );
}
