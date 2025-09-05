"use client"
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"

export default function SearchBar({ value, onChange, selectedCity, setSelectedCity }) {
  return (
    <Box
      sx={{
        p: 3,
        background: "rgba(30, 30, 30, 0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <TextField
        fullWidth
        label="Pretrazi poslove"
        variant="outlined"
        value={value}
        onChange={(el) => onChange(el.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(220, 38, 38, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#dc2626",
              boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#aaa",
            "&.Mui-focused": {
              color: "#dc2626",
            },
          },
          "& .MuiInputBase-input": {
            color: "#fff",
          },
        }}
        InputLabelProps={{ shrink: true }}
      />

      <FormControl
        fullWidth
        sx={{
          mt: 2,
          "& .MuiOutlinedInput-root": {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(220, 38, 38, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#dc2626",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#aaa",
            "&.Mui-focused": {
              color: "#dc2626",
            },
          },
        }}
      >
        <InputLabel id="city-label">Grad</InputLabel>
        <Select
          labelId="city-label"
          value={selectedCity}
          label="Grad"
          onChange={(e) => setSelectedCity(e.target.value)}
          sx={{
            color: "#fff",
            "& .MuiSvgIcon-root": {
              color: "#aaa",
            },
          }}
        >
          <MenuItem value="">Svi gradovi</MenuItem>
          <MenuItem value="Sarajevo">Sarajevo</MenuItem>
          <MenuItem value="Mostar">Mostar</MenuItem>
          <MenuItem value="Banja Luka">Banja Luka</MenuItem>
          <MenuItem value="Zenica">Zenica</MenuItem>
        </Select>
      </FormControl>

    </Box>
  )
}
