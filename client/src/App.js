import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import {
  Container, Grid, Button, TextField, Typography, List, ListItem, ListItemText, Box, IconButton,
  ThemeProvider, createTheme, Menu, MenuItem, Paper
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PsychologyIcon from "@mui/icons-material/Psychology";
import useNotes from "./hooks/useNotes";
import LandingPage from "./components/LandingPage";
import Logo from "./assets/logo.png";
import Auth from "./components/Auth";
import NeuralLoader from "./components/NeuralLoader";
import RouteLoader from "./components/RouteLoader";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { updateProfile } from "firebase/auth";
import { deleteUser } from "firebase/auth";
import AnalysisOverlay from "./components/AnalysisOverlay";


import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f3efe7" },
    primary: { main: "#2A4E8A" },
    secondary: { main: "#f7d88b" }
  },
  typography: {
    fontFamily: '"Montserrat", "Patrick Hand", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
  }
});

const paperCard = {
  borderRadius: 16,
  background: "linear-gradient(180deg,#fffdf6,#fff7ea)",
  boxShadow: "0 18px 50px rgba(10,10,10,0.15)",
  border: "1px solid rgba(10,10,10,0.04)"
};

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (current) => {
    setUser(current);
    setLoadingUser(false);
  });
  return unsubscribe;
}, []);

useEffect(() => {
  if (!loadingUser && user) {
    navigate("/app");
  }
}, [user, loadingUser, navigate]);


if (loadingUser) return null; // or a loader

  return (
    <>
      {routeLoading && <RouteLoader />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth setRouteLoading={setRouteLoading} />} />
        <Route path="/app" element={<MainApp user={user} setRouteLoading={setRouteLoading} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      
      <Router>
        <AppWrapper />
      </Router>
    </ThemeProvider>
  );
}

function MainApp({ user, setRouteLoading }) {
  const [journal, setJournal] = useState("");
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useNotes();
  const navigate = useNavigate();


useEffect(() => {
  localStorage.setItem("notes", JSON.stringify(notes));
}, [notes]);


  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    try {
      const res = await fetch(`https://mindprint.onrender.com/user/${user.uid}`);
      const json = await res.json();
      setHistory(json.analyses || []);
    } catch (e) {
      console.error("history fetch", e);
    }
  }


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleDeleteAccount = async () => {
  try {
    if (!user) return;

    await deleteUser(user); 

    navigate("/");        
    alert("Your account has been deleted.");
  } catch (error) {
    console.error("Delete error:", error);

    if (error.code === "auth/requires-recent-login") {
      alert("You must log in again to delete your account.");
    }
  }
};


  const analyzeJournal = async () => {
    if (!journal.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("https://mindprint.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: journal, uid: user.uid })
      });

      const data = await res.json();

      if (data.success === false) {
        alert(data.error || "Short entry or backend error");
        setLoading(false);
        return;
      }

      setResults(data);
      await fetchHistory();
      setJournal("");
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Analysis failed — check backend log");
    } finally {
      setLoading(false);
    }
  };

  const derivedTraits = useMemo(() => {
    if (results?.traits) return results.traits;
    const text = history.map(h => (h.analysis || "")).join(" ").toLowerCase();
    const map = [
      ["Creativity", /creative|imagin|idea|design|art/],
      ["Problem Solving", /solve|problem|fix|debug|analy/],
      ["Communication", /say|speak|talk|express|communicat/],
      ["Emotional Stability", /calm|panic|anx|stress|overwhelm/],
      ["Persistence", /keep trying|persist|continue|again/]
    ];
    return map.map(([name, re]) => {
      const matches = re.test(text) ? "High" : "Medium";
      return { name, level: matches };
    });
  }, [results, history]);

  const derivedStrengths = useMemo(() => {
    if (results?.strengths) return results.strengths;
    const text = history.map(h => (h.analysis || "")).join(" ").toLowerCase();
    const strengths = [];
    if (/persist|consist/i.test(text)) strengths.push("Persistence");
    if (/curious|curiosity|learn/i.test(text)) strengths.push("Curiosity");
    if (/empath|feel|understand/i.test(text)) strengths.push("Emotional awareness");
    if (/structure|plan|organ/i.test(text)) strengths.push("Structured thinking");
    if (strengths.length === 0) strengths.push("Openness to change");
    return strengths;
  }, [results, history]);

  const derivedCareers = useMemo(() => {
    if (results?.careers) return results.careers;
    const traits = derivedTraits.map(t => t.name.toLowerCase()).join(" ");
    const out = [];
    if (traits.includes("creativity")) out.push("Creative Strategist / UX");
    if (traits.includes("problem solving")) out.push("Analyst / Researcher");
    if (traits.includes("communication")) out.push("Content / Community");
    if (out.length === 0) out.push("Generalist roles (explore more entries)");
    return out;
  }, [results, derivedTraits]);

  const weeklyPatterns = useMemo(() => {
    const recent = history.slice(-7).reverse();
    const patterns = [];
    if (recent.length === 0) return patterns;
    let avoidCount = 0, curiousCount = 0, creativeCount = 0, motivationDrops = 0;
    recent.forEach(entry => {
      const t = (entry.analysis || "").toLowerCase();
      if (t.includes("avoid") || t.includes("avoided")) avoidCount++;
      if (t.includes("curious") || t.includes("learn")) curiousCount++;
      if (t.includes("creative") || t.includes("idea")) creativeCount++;
      if (t.includes("tired") || t.includes("low motivation") || t.includes("drain")) motivationDrops++;
    });
    if (avoidCount) patterns.push(`You avoided decisions on ${avoidCount} day(s).`);
    if (curiousCount) patterns.push(`Curiosity showed up in ${curiousCount} entry(ies).`);
    if (creativeCount) patterns.push(`Creativity surfaced in ${creativeCount} entry(ies).`);
    if (motivationDrops) patterns.push(`Motivation dipped ${motivationDrops} time(s).`);
    if (patterns.length === 0) patterns.push("Patterns are calm this week — keep writing to reveal more.");
    return patterns;
  }, [history]);

  const chartData = results ? {
    labels: ["Emotion score (synthetic)"],
    datasets: [{
      label: "Sentiment",
      data: [ results.sentiment === "positive" ? 1 : results.sentiment === "negative" ? -1 : 0 ],
      backgroundColor: ["#2A9D8F"]
    }]
  } : null;

  const handleMenu = (e) => { setAnchorEl(e.currentTarget); setMenuOpen(true); };
  const handleClose = () => { setAnchorEl(null); setMenuOpen(false); };

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const addNote = (n) => setNotes(prev => [n, ...prev]);

  return (
    <ThemeProvider theme={theme}>
      <AnalysisOverlay open={loading} />
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "auto",
          pb: 8,
          backgroundSize: "cover",
          backgroundPosition: "center",
          pt: 6
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "#c1ffd3ff" }} />


 <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Montserrat:wght@300;600;800&display=swap');
          .hand { font-family: 'Patrick Hand', 'Segoe Script', cursive; }
          .paper-grain { background-image: radial-gradient(rgba(0,0,0,0.01) 1px, transparent 1px); background-size: 8px 8px; }
        `}</style>

<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 4,
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <img
      src={Logo}
      alt="MindPrint Logo"
      style={{
        width: 60,
        height: 60,
        objectFit: "contain",
      }}
    />

    <Box>
      <Typography
        className="hand"
        sx={{ fontSize: 34, fontWeight: 800, color: "#1f2a44" }}
      >
        MINDPRINT
      </Typography>
      <Typography sx={{ color: "#465b6c" }}>
        Journal to discover traits within.
      </Typography>
    </Box>
  </Box>

  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
      Hi, {user?.displayName || "User"}
    </Typography>

    <IconButton onClick={handleMenu}>
      <MenuIcon />
    </IconButton>

    <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
      <MenuItem disabled>
        <Typography sx={{ fontWeight: 700 }}>
          {user?.displayName || "User"}
        </Typography>
      </MenuItem>

      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} /> Logout
      </MenuItem>

      <MenuItem onClick={handleDeleteAccount} sx={{ color: "red" }}>
        <LogoutIcon sx={{ mr: 1 }} /> Delete Account
      </MenuItem>
    </Menu>
  </Box>
</Box>

          <Grid spacing={6} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  ...paperCard,
                  p: { xs: 3, md: 5 },
                  transform: "rotate(-0.8deg)",
                  position: "relative",
                  overflow: "visible"
                }}
                className="paper-grain"
              >
                <Box sx={{ position: "absolute", right: -40, top: 16, transform: "rotate(12deg)" }}>
                  <MiniPen />
                </Box>

                <Typography className="hand" sx={{ fontSize: 20, fontWeight: 800, color: "#1f2a44", mb: 2 }}>
                  Journal Entry
                </Typography>
                <Box sx={{
                  borderRadius: 2,
                  background: "#fffaf0",
                  p: 2,
                  minHeight: 240,
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.03)",
                }}>
                  <TextField
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    placeholder="Write what you're feeling, thinking, or struggling with..."
                    multiline
                    rows={10}
                    fullWidth
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        fontFamily: "'Patrick Hand', 'Segoe Script', cursive",
                        fontSize: 18,
                        color: "#2b2b2b",
                        background: "transparent",
                        padding: 8,
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                  <Box sx={{
                    background: "#fff4c9",
                    px: 2,
                    py: 1,
                    borderRadius: 1.2,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1
                  }}>
                    <Typography className="hand" sx={{ fontSize: 14, color: "#1f2a44" }}>Words</Typography>
                    <Typography sx={{ fontSize: 14, color: "#1f2a44", fontWeight: 700 }}>{wordCount(journal)}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {loading && <NeuralLoader />}
                    <Button
                      onClick={analyzeJournal}
                      startIcon={<TrendingUpIcon />}
                      sx={{
                        background: "#ffd88a",
                        color: "#1f2a44",
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: "none",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.12)"
                      }}
                      disabled={loading}
                    >
                      {loading ? "Analyzing..." : "Analyze & Save"}
                    </Button>
                  </Box>
                </Box>
                <MoodSticker onSelect={setMood} />

                <Box sx={{ mt: 3 }}>
                  <NotesToSelf notes={notes} addNote={addNote} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ ...paperCard, p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
                <Typography className="hand" sx={{ fontSize: 18, fontWeight: 800, color: "#1f2a44", mb: 1 }}>Recent Analyses</Typography>
                <Box sx={{ maxHeight: 260, overflow: "auto" }}>
                  {history.length === 0 ? (
                    <Typography sx={{ color: "#6b7a83" }}>No entries yet. Your saved analyses appear here.</Typography>
                  ) : (
                    <List>
                      {history.slice().reverse().map(it => (
                        <ListItem key={it._id} sx={{ mb: 1, p: 2.2, borderRadius: 2, background: "#fffaf2", boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }}>
                          <ListItemText
                            primary={<Typography sx={{ fontWeight: 700, color: "#1f2a44" }}>{new Date(it.date).toLocaleString()}</Typography>}
                            secondary={<Typography sx={{ color: "#465b6c" }}>{it.analysis.slice(0, 140)}{it.analysis.length > 140 ? "…" : ""}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>

              <Box sx={{ height: 18 }} />

              <CareerImpression careers={derivedCareers} />
              <TraitAnalysis traits={derivedTraits} />
              <StrengthProfile strengths={derivedStrengths} />
              <WeeklyPatternPage patterns={weeklyPatterns} />
            </Grid>

            {results && (
              <Grid item xs={12}>
                <Box sx={{ ...paperCard, p: 4 }}>
                  <Typography className="hand" sx={{ fontSize: 18, fontWeight: 800, color: "#1f2a44", mb: 2 }}>Visualization</Typography>
                  <Bar data={chartData} />
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}


function MiniPen() {
  return (
    <svg width="110" height="44" viewBox="0 0 110 44" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.95">
        <rect x="6" y="18" width="92" height="8" rx="4" fill="#2f2a2a" />
        <path d="M14 20c18-14 70-14 88 0" stroke="#d7d7d2" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="84" y="10" width="12" height="20" rx="3" fill="#ffd88a" transform="rotate(-12 84 10)"/>
      </g>
    </svg>
  );
}


function TraitAnalysis({ traits = [] }) {
  return (
    <Box sx={{ ...paperCard, p: 3, mt: 3, borderRadius: 3 }}>
      <Typography className="hand" sx={{ fontSize: 20, fontWeight: 800, color: "#1f2a44", mb: 1 }}>Your Trait Patterns</Typography>
      {traits.map((t, i) => (
        <Typography key={i} sx={{ fontSize: 16, color: "#2b2b2b", mb: 0.8, fontFamily: "'Patrick Hand', cursive" }}>
          • {t.name}: <span style={{ fontWeight: 700 }}>{t.level}</span>
        </Typography>
      ))}
    </Box>
  );
}

function CareerImpression({ careers = [] }) {
  return (
    <Box sx={{ ...paperCard, p: 3, mt: 3, borderRadius: 3 }}>
      <Typography className="hand" sx={{ fontSize: 20, fontWeight: 800, color: "#1f2a44", mb: 1 }}>Career Impressions</Typography>
      {careers.length === 0 ? (
        <Typography sx={{ color: "#6b7a83" }}>Write a few entries to discover matching roles.</Typography>
      ) : careers.map((c, i) => (
        <Typography key={i} sx={{ fontSize: 17, mb: 0.8, fontFamily: "'Patrick Hand', cursive", color: "#2b2b2b" }}>• {c}</Typography>
      ))}
    </Box>
  );
}

function WeeklyPatternPage({ patterns = [] }) {
  return (
    <Box sx={{ ...paperCard, p: 3.5, mt: 3, borderRadius: 3, transform: "rotate(-0.4deg)" }}>
      <Typography className="hand" sx={{ fontSize: 20, color: "#1f2a44", mb: 1 }}>This Week in Your Diary</Typography>
      {patterns.map((p, i) => (
        <Typography key={i} sx={{ fontSize: 16, mb: 0.8, fontFamily: "'Patrick Hand', cursive", color: "#2b2b2b" }}>→ {p}</Typography>
      ))}
    </Box>
  );
}

function MoodSticker({ onSelect = () => {} }) {
  const moods = ["🙂","😕","😤","😴","🤩","🧠","✨"];
  return (
    <Box sx={{
      background: "#fff6d6",
      p: 2,
      mt: 4,
      borderRadius: 3,
      display: "flex",
      gap: 2,
      boxShadow: "0 8px 22px rgba(0,0,0,0.1)",
      justifyContent: "space-evenly",
      alignItems: "center"
    }}>
      {moods.map((m, i) => (
        <Typography
          key={i}
          sx={{
            fontSize: 28,
            cursor: "pointer",
            transition: "0.15s",
            "&:hover": { transform: "scale(1.18)" }
          }}
          onClick={() => onSelect(m)}
        >
          {m}
        </Typography>
      ))}
    </Box>
  );
}

function StrengthProfile({ strengths = [] }) {
  return (
    <Box sx={{ ...paperCard, p: 3, mt: 3, borderRadius: 3 }}>
      <Typography className="hand" sx={{ fontSize: 20, fontWeight: 800, color: "#1f2a44", mb: 1 }}>Strengths Emerging</Typography>
      {strengths.map((s, i) => (
        <Typography key={i} sx={{ fontSize: 16, mb: 0.8, fontFamily: "'Patrick Hand', cursive", color: "#2b2b2b" }}>
          ✓ {s}
        </Typography>
      ))}
    </Box>
  );
}

function NotesToSelf({ notes = [], addNote = () => {} }) {
  const [value, setValue] = useState("");
  return (
    <Box sx={{ mt: 1 }}>
      <Typography className="hand" sx={{ fontSize: 18, color: "#1f2a44", mb: 1 }}>Notes to Self</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          placeholder="Write a small note..."
          value={value}
          onChange={(e)=>setValue(e.target.value)}
          sx={{
            background: "#fff",
            borderRadius: 2,
            flex: 1,
            "& .MuiOutlinedInput-root": { borderRadius: 2 }
          }}
          InputProps={{
  style: {
    color: "#1f2a44",
    caretColor: "#1f2a44",  // the REAL fix
    fontFamily: "'Patrick Hand', cursive"
  }
}}

        />
        <Button
          sx={{
            background: "#ffd88a",
            color: "#1f2a44",
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            px: 3
          }}
          onClick={() => {
            if (!value.trim()) return;
            addNote(value.trim());
            setValue("");
          }}
        >
          Add
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {notes.map((n, i) => (
          <Paper key={i} sx={{
            background: "#fff4c9",
            p: 2,
            width: 160,
            minHeight: 80,
            borderRadius: 2,
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
            fontFamily: "'Patrick Hand', cursive",
            fontSize: 16
          }}>{n}</Paper>
        ))}
      </Box>
    </Box>
  );
}
