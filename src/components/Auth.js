import React, { useState } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Auth({ setRouteLoading }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");


  // HANDLER FIXED COMPLETELY
  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // Trigger route loader
      if (setRouteLoading) setRouteLoading(true);

      setTimeout(() => navigate("/app"), 800);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #F3F7FF 0%, #ECF2FE 100%)",
        position: "relative",
        overflow: "hidden",
        px: 2
      }}
    >
      {/* Floating pastel circles */}
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(108, 99, 255, 0.18)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "float1 9s infinite ease-in-out",
          top: "10%",
          left: "15%"
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: "260px",
          height: "260px",
          background: "rgba(255, 158, 122, 0.25)",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float2 11s infinite ease-in-out",
          bottom: "12%",
          right: "20%"
        }}
      />

      <style>
        {`
          @keyframes float1 {
            0% { transform: translateY(0px) }
            50% { transform: translateY(-25px) }
            100% { transform: translateY(0px) }
          }
          @keyframes float2 {
            0% { transform: translateY(0px) }
            50% { transform: translateY(30px) }
            100% { transform: translateY(0px) }
          }
        `}
      </style>

      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 380,
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.9)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: "#2D3748",
            mb: 2
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </Typography>

        <Typography
          sx={{
            color: "#6B7280",
            textAlign: "center",
            mb: 3,
            fontSize: "0.85rem"
          }}
        >
          {isLogin
            ? "Log in to continue your journaling journey."
            : "Start discovering traits with MindPrint."}
        </Typography>


<TextField
  label="Username"
  fullWidth
  sx={{ mb: 2 }}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
        {/* EMAIL */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* PASSWORD */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* LOGIN / SIGNUP BUTTON */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            py: 1.2,
            fontWeight: 600,
            borderRadius: "30px",
            background: "linear-gradient(90deg, #6C63FF, #8A7CFF)",
            "&:hover": {
              background: "linear-gradient(90deg, #574FE3, #7A6DFF)",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 14px rgba(108,99,255,0.4)"
            },
            transition: "0.3s"
          }}
          onClick={handleSubmit}
        >
          {isLogin ? "Login" : "Sign Up"}
        </Button>

        {/* TOGGLE LOGIN / SIGNUP */}
        <Button
          fullWidth
          sx={{
            mt: 1,
            textTransform: "none",
            color: "#6C63FF",
            fontWeight: 600
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need to create an account?" : "Already have an account?"}
        </Button>
      </Paper>
    </Box>
  );
}

export default Auth;
