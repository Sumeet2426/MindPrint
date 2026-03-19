import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const QUOTES = [
  "Processing your thoughts...",
  "Analyzing emotional patterns...",
  "Decoding your behavioral traits...",
  "Finding clarity in the chaos...",
  "Your mind is speaking. We're listening...",
  "Revealing the hidden layers within you..."
];

export default function AnalysisOverlay({ open = false }) {
  const [quote, setQuote] = useState(QUOTES[0]);

  // rotate quotes every 2.4 seconds
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setQuote(q => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 2400);

    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(255, 251, 244, 0.88)",
        backdropFilter: "blur(4px)",
        zIndex: 500,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        p: 3
      }}
    >
      <CircularProgress
        sx={{ color: "#d9a858", mb: 3 }}
        size={70}
        thickness={3}
      />

      <Typography
        sx={{
          fontSize: 22,
          fontFamily: "'Patrick Hand', cursive",
          color: "#333",
          maxWidth: 500
        }}
      >
        {quote}
      </Typography>
    </Box>
  );
}
