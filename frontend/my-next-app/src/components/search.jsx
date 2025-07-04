import {Radio, FormControlLabel , TextField, Box, FormControl, InputLabel, Select, MenuItem,FormLabel, RadioGroup } from "@mui/material";
import { useState } from "react";

export default function SearchBar({value, onChange, selectedCity,setSelectedCity,jobType,setJobType}){

    
    return(
        <Box>
        <TextField
        fullWidth
        label ="Pretrazi poslove"
        variant="outlined"
        value={value}
        onChange={(el) => onChange(el.target.value)}
         sx={{
        input: { color: "#fff" },
        label: { color: "#999" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#444" },
          "&:hover fieldset": { borderColor: "#e50914" },
          "&.Mui-focused fieldset": { borderColor: "#e50914" },
        },
      }}
      InputLabelProps={{ shrink: true }}
    />

    <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel id="city-label">Grad</InputLabel>
  <Select
    labelId="city-label"
    value={selectedCity}
    label="Grad"
    onChange={(e) => setSelectedCity(e.target.value)}
    sx={{ color: "#fff", bgcolor: "#1e1e1e" }}
  >
    <MenuItem value="">Svi gradovi</MenuItem>
    <MenuItem value="Sarajevo">Sarajevo</MenuItem>
    <MenuItem value="Mostar">Mostar</MenuItem>
    <MenuItem value="Banja Luka">Banja Luka</MenuItem>
        <MenuItem value="Banja Luka">Zenica</MenuItem>

  </Select>
</FormControl>

<FormControl component="fieldset" sx={{ mt: 2 }}>
  <FormLabel component="legend" sx={{ color: "#aaa" }}>Tip posla</FormLabel>
  <RadioGroup
    row
    value={jobType}
    onChange={(e) => setJobType(e.target.value)}
  >
    <FormControlLabel value="remote" control={<Radio />} label="Remote" />
    <FormControlLabel value="onsite" control={<Radio />} label="Na lokaciji" />
    <FormControlLabel value="" control={<Radio />} label="Svi" />
  </RadioGroup>
</FormControl>



</Box>
    
  );
}