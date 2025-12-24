import React from "react";
import { Box } from "@mui/material";

export default function NeuralLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          position: "relative",
          animation: "spin 1.4s linear infinite",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "4px solid rgba(0,229,255,0.6)",
            borderTopColor: "transparent",
            borderRightColor: "transparent",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            border: "4px solid rgba(138,43,226,0.5)",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
            animation: "spinReverse 1.8s linear infinite",
          },
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          "@keyframes spinReverse": {
            "0%": { transform: "rotate(360deg)" },
            "100%": { transform: "rotate(0deg)" },
          },
        }}
      />
    </Box>
  );
}
