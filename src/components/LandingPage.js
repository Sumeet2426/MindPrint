import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // keep yours
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";



export default function LandingPage() {
  const [showSample, setShowSample] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#a3ffadff",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 4,
        fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Montserrat:wght@300;600;800&display=swap');
        .hand { font-family: 'Patrick Hand', 'Segoe Script', cursive; }
      `}</style>

      <Box
        sx={{
          position: "fixed",
          left: 32,
          right: 32,
          top: 18,
          zIndex: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none", // binding is decorative; buttons below will be clickable
        }}
      >
        <Paper
          elevation={4}
          sx={{
            pointerEvents: "auto",
            px: 3,
            py: 1,
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#f7f4ee",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <Typography sx={{ fontWeight: 800, color: "#1f2a44", fontFamily: "Montserrat" }}>
            MindPrint
          </Typography>

          <Box sx={{ ml: 3, display: { xs: "none", md: "flex" }, gap: 3 }}>
            <NavLink label="Home" onClick={() => window.scrollTo(0, 0)} />
            <NavLink label="About" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} />
            <NavLink label="How to Journal" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} />
          </Box>
        </Paper>

        <Button
          onClick={() => setShowLogin(true)}
          sx={{
            pointerEvents: "auto",
            px: 3,
            py: 1,
            borderRadius: 3,
            background: "#f7d88b",
            color: "#1f2a44",
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(31,42,68,0.15)",
            textTransform: "none",
          }}
        >
          Start Journaling
        </Button>
      </Box>
      <Box
        sx={{
          maxWidth: 1100,
          margin: "86px auto 60px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            background: "linear-gradient(180deg,#fffdf6,#fff7ea)",
            borderRadius: 3,
            boxShadow: "0 18px 50px rgba(10,10,10,0.25)",
            p: { xs: 4, md: 6 },
            transform: "rotate(-0.6deg)",
            position: "relative",
            overflow: "visible",
          }}
        >
          <Box sx={{ position: "absolute", right: -36, top: 24, transform: "rotate(12deg)" }}>
            <PenSVG />
          </Box>
          <Doodles />
          <Container disableGutters maxWidth="lg" sx={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Box sx={{ flex: 1 }}>
              <Typography className="hand" sx={{ fontSize: { xs: 36, md: 54 }, color: "#1f2a44", fontWeight: 800, lineHeight: 1.02 }}>
                Decode your mind.<br />Build yourself.
              </Typography>

              <Typography sx={{ mt: 2, color: "#5a5a5a", fontSize: 18, maxWidth: 640 }}>
                MindPrint turns your daily notes into gentle insights — emotional patterns, recurring behaviours, strengths and subtle nudges for the next step.
                Treat this like your private diary: no noise, only clarity.
              </Typography>

              <Button
  onClick={() => setShowSample(true)}
  sx={{
    mt: 4,
    px: 4,
    py: 1.2,
    borderRadius: "12px",
    background: "#ffeaa7",
    color: "#1f2a44",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    textTransform: "none",
  }}
>
  <span className="hand" style={{ fontWeight: 700 }}>Read a Sample Entry</span>
</Button>

              <Box sx={{ mt: 4, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 120,
                  p: 1.2,
                  background: "#fff1c9",
                  borderRadius: 1.2,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
                }}>
                  <Typography className="hand" sx={{ fontSize: 14, color: "#1f2a44" }}>Daily prompt</Typography>
                  <Typography sx={{ fontSize: 12, color: "#5a5a5a" }}>What made you feel alive today?</Typography>
                </Box>
                <Typography sx={{ color: "#8b8b8b", fontSize: 13 }}>— try writing 5 lines</Typography>
              </Box>
            </Box>
            <Box sx={{ width: { xs: 140, sm: 220, md: 300 }, flexShrink: 0 }}>
              <SketchIllustration />
            </Box>
          </Container>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
        <Paper elevation={0} sx={{
          background: "linear-gradient(180deg,#fffef8,#fff8ea)",
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          transform: "rotate(0deg)",
          boxShadow: "0 10px 30px rgba(10,10,10,0.12)"
        }} id="about">
          <Typography className="hand" sx={{ fontSize: 28, color: "#1f2a44", mb: 2 }}>What is MindPrint?</Typography>
          <Typography sx={{ color: "#5a5a5a", mb: 3 }}>
            A private journaling companion that reads the small patterns in your notes and turns them into tiny, doable next steps.
            Think of it as a quiet friend who notices things you miss.
          </Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <FeatureCard title="Private by Default" desc="Encrypted entries. Your data, your rules." />
            <FeatureCard title="Gentle Insights" desc="Not judgement, just clarity. Actionable, small steps." />
            <FeatureCard title="Daily Prompts" desc="Short prompts that unlock consistent reflection." />
          </Box>
        </Paper>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }} id="how">
        <Paper sx={{ background: "linear-gradient(180deg,#fffef8,#fff8ea)", p: { xs: 4, md: 6 }, borderRadius: 2, boxShadow: "0 10px 30px rgba(10,10,10,0.12)" }}>
          <Typography className="hand" sx={{ fontSize: 26, color: "#1f2a44", mb: 2 }}>How to journal (tiny guide)</Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <TipCard title="Be Honest" text="Write what you actually felt today — don’t edit for others." />
            <TipCard title="Short & Sweet" text="5–10 minutes. A few lines beats no lines." />
            <TipCard title="Ask" text="What did I learn? What can I do tomorrow?" />
          </Box>
        </Paper>
      </Box>
{showSample && (
  <Box sx={{
    position: "fixed",
    inset: 0,
    zIndex: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(12,12,12,0.45)"
  }}>
    <Paper sx={{
      width: { xs: 320, sm: 520 },
      maxWidth: "90%",
      p: 4,
      borderRadius: 2,
      transform: "rotate(-3deg)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      background: "linear-gradient(180deg,#fffdf6,#fff7ea)"
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography className="hand" sx={{ fontSize: 18, fontWeight: 700, color: "#1f2a44" }}>
          Date: Today
        </Typography>
        <Button onClick={() => setShowSample(false)} sx={{ textTransform: "none" }}>Back to page</Button>
      </Box>

      <Box sx={{ whiteSpace: "pre-wrap", color: "#333", fontSize: 16, lineHeight: 1.6 }}>
{`I don’t know how to describe what I’m feeling, but it’s sitting somewhere in my chest…
not sadness, not stress, something in between.

I think I’ve been carrying small things for too long.
The conversations I didn’t finish, the thoughts I didn't voice,
the expectations I keep pretending don’t affect me.

Nothing is “wrong” today,
but nothing feels right either.

Maybe I just need to breathe.
Or write.
Or pause for a minute and be honest with myself.

If I’m being real…
I don’t even want answers right now.
I just want to understand myself a little better.

Maybe this is a good place to start.`}
      </Box>

      <Typography sx={{ mt: 3, color: "#5a5a5a", fontStyle: "italic" }}>
        You can start with: “Today I felt…”
      </Typography>
    </Paper>
  </Box>
)}

       {showLogin && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(12,12,12,0.4)",
          }}
        >
          <Paper sx={{ width: 360, p: 3.5, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700 }}>
                {isLogin ? "Login" : "Create account"}
              </Typography>
              <IconButton onClick={() => setShowLogin(false)}>
                <ArrowBackIcon />
              </IconButton>
            </Box>

            <Box sx={{ mt: 2 }}>
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                onClick={async () => {
                  try {
                    if (isLogin) {
                      await signInWithEmailAndPassword(auth, email, password);
                    } else {
                      const userCred = await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                      );

                      await updateProfile(auth.currentUser, {
                        displayName: username,
                      });

                      await setDoc(doc(db, "users", userCred.user.uid), {
                        username,
                        email,
                        createdAt: new Date(),
                      });
                    }

                    setShowLogin(false);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                sx={{
                  background: "#f7d88b",
                  color: "#1f2a44",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>

              <Button
                fullWidth
                sx={{ mt: 1, textTransform: "none" }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account?" : "Already have one?"}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
} 


function NavLink({ label, onClick }){
  return(
    <Typography onClick={onClick} sx={{ cursor: "pointer", color: "#1f2a44", fontWeight: 600, fontSize: 14 }} >
      {label}
    </Typography>
  );
}

function PenSVG() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.95">
        <rect x="8" y="28" width="96" height="8" rx="4" fill="#2f2a2a" />
        <path d="M16 30c18-14 70-14 92 0" stroke="#d7d7d2" strokeWidth="3" strokeLinecap="round" />
        <rect x="88" y="18" width="16" height="24" rx="3" fill="#ffd88a" transform="rotate(-12 88 18)"/>
      </g>
    </svg>
  );
}

function Doodles() {
  return (
    <svg style={{ position: "absolute", left: 18, top: 12, opacity: 0.55 }} width="140" height="80" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="3.5" fill="#ffd88a"/>
      <path d="M36 12c8 6 24 10 42 4" stroke="#cfcfb8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 56c12-8 30-10 46-4" stroke="#e6d5a8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SketchIllustration() {
  return (
    <svg viewBox="0 0 220 240" width="100%" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(8,8)">
        <ellipse cx="100" cy="110" rx="82" ry="86" fill="#fff6e6" stroke="#f0e4d2" strokeWidth="2" />
        <path d="M40 100c20-24 70-26 102-6" stroke="#c9c2b4" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 140c28-12 60-12 88 0" stroke="#8a7f70" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="150" cy="60" r="14" fill="#ffd88a" opacity="0.9"/>
        <path d="M26 70c12-8 26-12 40-8" stroke="#5a6b8a" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <Box sx={{ width: 300, p: 2.5, borderRadius: 2, background: "#fffdf7", boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}>
      <Typography sx={{ fontWeight: 700, color: "#1f2a44", mb: 1 }} className="hand">{title}</Typography>
      <Typography sx={{ color: "#5a5a5a" }}>{desc}</Typography>
    </Box>
  );
}

function TipCard({ title, text }) {
  return (
    <Box sx={{ width: 300, p: 2.5, borderRadius: 2, background: "#fffdf7", boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}>
      <Typography sx={{ fontWeight: 700, color: "#1f2a44" }} className="hand">{title}</Typography>
      <Typography sx={{ color: "#5a5a5a", mt: 1 }}>{text}</Typography>
    </Box>
  );
}
