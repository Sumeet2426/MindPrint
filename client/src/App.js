import React, { useState, useEffect, useMemo, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import {
  Container, Grid, Button, TextField, Typography, List, ListItem, ListItemText, Box, IconButton,
  ThemeProvider, createTheme, Menu, MenuItem, Paper
} from "@mui/material";
import { LineElement, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
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

const generateInsight = (text, emotion) => {
text = text.toLowerCase();


let traits = {};
let explanationParts = [];
let careerSuggestions = [];
let nextStep = "";
let finalEmotion = emotion;
let conflicts = [];

const addTrait = (trait, score) => {
traits[trait] = (traits[trait] || 0) + score;
};

// 🔹 EXPLICIT TRAITS
if (/draw|design|creative|idea|imagine/.test(text)) addTrait("creative", 2);
if (/analyze|logic|problem|fix|debug/.test(text)) addTrait("analytical", 2);
if (/people|talk|help|guide|support/.test(text)) addTrait("social", 2);
if (/lead|manage|organize|plan/.test(text)) addTrait("leadership", 2);
if (/grind|discipline|routine|consistent|every day/.test(text)) addTrait("discipline", 3);

// 🔹 HIDDEN TRAITS (pattern-based)
if (/why|meaning|purpose|life|exist/.test(text)) addTrait("philosophical", 2);
if (/i can|i will|i believe|confident/.test(text)) addTrait("confidence", 2);
if (/teach|explain|make people understand/.test(text)) addTrait("teaching", 2);

// 🔹 UNCERTAINTY
if (/maybe|idk|confused|lost/.test(text)) addTrait("uncertain", 2);

// 🔥 STRONG INTENT DETECTION
if (/i have decided|i will become|i am going to/.test(text)) {
addTrait("decided", 3);
}

if (/grind|no matter what|until|won't stop/.test(text)) {
addTrait("commitment", 3);
}

if (/top|best|contender|number 1|win/.test(text)) {
addTrait("competitive", 2);
}

if (/tournament|official|competition/.test(text)) {
addTrait("real-world-focus", 2);
}

if (/if my intentions|self|improve myself/.test(text)) {
addTrait("self-awareness", 2);
}

// 🔹 SORT
const sortedTraits = Object.entries(traits)
.sort((a, b) => b[1] - a[1])
.map(([t]) => t);



// 🔥 CONFLICTS
if (traits["discipline"] && traits["uncertain"]) {
conflicts.push("you act consistently but lack direction");
}

if (traits["analytical"] && traits["philosophical"]) {
conflicts.push("you think deeply but may over-question things");
}

// 🔹 EXPLANATION
if (traits["discipline"]) {
explanationParts.push("You show signs of discipline — your thinking reflects structure and consistency.");
}

if (traits["philosophical"]) {
explanationParts.push("You naturally question deeper meaning, not just surface-level actions.");
}

if (traits["confidence"]) {
explanationParts.push("There’s a sense of self-belief in how you express yourself.");
}

if (traits["teaching"]) {
explanationParts.push("You have a tendency to guide or explain, which indicates teaching ability.");
}

if (traits["uncertain"]) {
explanationParts.push("However, you are still unclear about direction.");
}

if (conflicts.length > 0) {
explanationParts.push("There’s a contradiction: " + conflicts.join(", ") + ".");
}

let explanation = explanationParts.join(" ") || "Pattern not strong yet.";

if (emotion === "joy" && traits["competitive"]) {
explanationParts.push(
"You're in a positive and energized state while thinking about this — which can boost performance if used correctly."
);
}

if (emotion === "sadness") {
explanationParts.push(
"Your current emotional state might be affecting how clearly you're seeing your direction."
);
}

if (emotion === "anger") {
explanationParts.push(
"There’s strong energy here — if controlled, it can be turned into focused action."
);
}


// 🔹 CAREER MAPPING (BASED ON TRAIT COMBINATIONS)

// 🎯 DISCIPLINE + PHILOSOPHY + CONFIDENCE
if (traits["discipline"] && traits["philosophical"] && traits["confidence"]) {
careerSuggestions.push(
"Life Coach",
"Motivational Speaker",
"Lecturer",
"Content Creator (Self-development)"
);
}



// 🎯 ANALYTICAL + DISCIPLINE
if (traits["analytical"] && traits["discipline"]) {
careerSuggestions.push(
"Software Engineer",
"Cybersecurity Specialist",
"Data Analyst"
);
}

// 🎯 SOCIAL + TEACHING
if (traits["social"] && traits["teaching"]) {
careerSuggestions.push(
"Teacher",
"Trainer",
"Consultant"
);
}

// 🎯 CREATIVE
if (traits["creative"]) {
careerSuggestions.push(
"Designer",
"Content Creator",
"UI/UX Designer"
);
}

if (
traits["competitive"] &&
traits["commitment"] &&
traits["real-world-focus"]
) {
careerSuggestions.push(
"High-performance competitive path (e.g., Esports, Sports, Trading, Performance-based fields)"
);
}

if (traits["competitive"] && traits["commitment"]) {
explanationParts.push(
"You’re not just interested — you're aiming to perform and compete seriously."
);
}




// 🔹 REMOVE DUPLICATES
careerSuggestions = [...new Set(careerSuggestions)];

if (careerSuggestions.length === 0) {
careerSuggestions.push("More input needed to identify strong direction");
}

// 🔹 EMOTION USAGE (REAL IMPACT)
if (emotion === "joy" && traits["commitment"]) {
nextStep =
"You're in the right state — now convert this momentum into structured action (practice, tracking, competition).";
} else if (emotion === "sadness") {
nextStep =
"Don’t make big decisions right now. Stabilize your state, then reassess.";
} else if (emotion === "anger") {
nextStep =
"Channel this energy into something productive instead of reacting impulsively.";
} else {
nextStep = "Act, observe, refine.";
}


return {
traits: sortedTraits,
explanation,
careers: careerSuggestions,
nextStep,
emotion: finalEmotion
};
};

const analyzeGuidedAnswers = (answers) => {
let traits = {};
let explanationParts = [];
let careers = [];
let nextStep = "";

const addTrait = (trait, score) => {
traits[trait] = (traits[trait] || 0) + score;
};

// Q1: Desire
if (answers.q1.toLowerCase().includes("game") || answers.q1.toLowerCase().includes("esports")) {
addTrait("competitive", 2);
}

// Q2: Behavior
if (answers.q2 === "Push harder") addTrait("discipline", 2);
if (answers.q2 === "Avoid") addTrait("uncertain", 2);
if (answers.q2 === "Overthink") addTrait("analytical", 1);

// Q3: Values
if (answers.q3 === "Recognition") addTrait("competitive", 2);
if (answers.q3 === "Freedom") addTrait("passion-driven", 2);
if (answers.q3 === "Stability") addTrait("practical", 2);

// Q4: Inclination
if (answers.q4 === "Competing") addTrait("competitive", 2);
if (answers.q4 === "Creating") addTrait("creative", 2);
if (answers.q4 === "Solving problems") addTrait("analytical", 2);
if (answers.q4 === "Helping people") addTrait("social", 2);

// Q5: Conflict
if (answers.q5.trim()) {
addTrait("self-awareness", 2);
explanationParts.push("You are aware of a gap between intention and action.");
}

// Explanation
if (traits["competitive"]) {
explanationParts.push("You're not just interested — you're aiming for performance. But your current patterns will decide if that holds.");
}

if (traits["discipline"]) {
explanationParts.push("You push through difficulty instead of backing off. But needed to see if this is consistent across situations.");
}

if (traits["uncertain"]) {
explanationParts.push("You tend to hesitate when things get uncomfortable. But needed to see if this is a pattern or just a reaction to specific situations.");
}
if (
traits["competitive"] &&
(traits["uncertain"] || answers.q2 === "Avoid")
) {
explanationParts.push(
"You say you're drawn toward performance, but your behavior suggests hesitation under pressure."
);
}


// Careers
if (traits["competitive"]) {
careers.push("Competitive fields (Esports, Sports, Performance roles)");
}

if (traits["analytical"]) {
careers.push("Technical roles (Engineering, Cybersecurity, Data)");
}

if (traits["creative"]) {
careers.push("Creative roles (Design, Content)");
}

// Next Step
if (traits["competitive"] && traits["discipline"]) {
nextStep = "You need structured execution — practice, tracking, and real competition.";
} else if (traits["uncertain"]) {
nextStep = "Reduce hesitation. Start small and build consistency.";
} else {
nextStep = "Act, observe, refine.";
}

return {
traits: Object.keys(traits),
explanation: explanationParts.join(" "),
careers: [...new Set(careers)],
nextStep,
emotion: "guided"
};
};



function MainApp({ user, setRouteLoading }) {
  const [journal, setJournal] = useState("");
  const [history, setHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(true);
  const [results, setResults] = useState(null);
const [expandedId, setExpandedId] = useState(null);
const [listening, setListening] = useState(false);
const recognitionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useNotes();
  const navigate = useNavigate();
  const [mode, setMode] = useState("journal"); // "journal" or "guided"

const [guidedAnswers, setGuidedAnswers] = useState({
q1: "",
q2: "",
q3: "",
q4: "",
q5: ""
});



useEffect(() => {
  localStorage.setItem("notes", JSON.stringify(notes));
}, [notes]);

const insight = useMemo(() => {
if (!results) return null;

if (results.emotion === "guided") {
return analyzeGuidedAnswers(JSON.parse(results.text));
}

return generateInsight(results.text || "", results.emotion);
}, [results]);


  useEffect(() => {
  if (!user?.uid) return;

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
console.log("history:", history);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;
recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("🎤 Started listening");
    setListening(true);
  };

  recognition.onresult = (event) => {
    console.log("✅ RESULT EVENT:", event);

    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    console.log("📝 Transcript:", transcript);
    setJournal(transcript);
  };

  recognition.onerror = (e) => {
    console.log("❌ ERROR:", e);
    setListening(false);
  };

 recognition.onend = () => {
  setTimeout(() => {
    setListening(false);
  }, 500);
};

  recognition.start();
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


const detectedTraits = useMemo(() => {
  const text = journal.toLowerCase();

  let traits = [];

  if (/draw|design|creative|idea|imagine/.test(text)) traits.push("creative");
  if (/analyze|logic|problem|fix|debug/.test(text)) traits.push("analytical");
  if (/people|talk|help|guide|support/.test(text)) traits.push("social");
  if (/lead|manage|organize|plan/.test(text)) traits.push("leadership");

  return traits;
}, [journal]);

  const derivedCareers = useMemo(() => {
  if (!results) return [];

  const emotion = results.emotion;
  const traits = detectedTraits;

  let suggestions = [];

  if (traits.includes("creative")) {
    suggestions.push("UI/UX Designer", "Content Creator", "Graphic Designer");
  }

  if (traits.includes("analytical")) {
    suggestions.push("Data Analyst", "Software Engineer", "Researcher");
  }

  if (traits.includes("social")) {
    suggestions.push("Psychologist", "HR Manager", "Teacher");
  }

  if (traits.includes("leadership")) {
    suggestions.push("Entrepreneur", "Project Manager");
  }

  // Emotion-based adjustment
  if (emotion === "sadness" && traits.includes("creative")) {
    suggestions.push("Writing / Art Therapy Fields");
  }

  if (emotion === "anger" && traits.includes("analytical")) {
    suggestions.push("Problem-solving roles like Debugging / Systems Engineering");
  }

  if (suggestions.length === 0) {
    suggestions.push("Explore multiple fields — more entries needed");
  }

  return [...new Set(suggestions)];
}, [results, detectedTraits]);

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

  
  const handleMenu = (e) => { setAnchorEl(e.currentTarget); setMenuOpen(true); };
  const handleClose = () => { setAnchorEl(null); setMenuOpen(false); };

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const addNote = (n) => setNotes(prev => [n, ...prev]);

const timelineData = history.map(entry => ({
  date: new Date(entry.date).toLocaleDateString(),
  sentiment:
    (entry.sentiment || entry.tone) === "positive" ? 1 :
    (entry.sentiment || entry.tone) === "negative" ? -1 : 0
}));

const lineChartData = {
  labels: timelineData.map(d => d.date),
  datasets: [
    {
      label: "Mood Trend",
      data: timelineData.map(d => d.sentiment),
      borderColor: "#2A9D8F",
      tension: 0
,
stepped: true,
      pointRadius: 5,
    }
  ]
};

const options = {
  scales: {
    y: {
      min: -1,
      max: 1,
      ticks: {
        stepSize: 1,
        callback: function(value) {
          if (value === 1) return "Positive";
          if (value === 0) return "Neutral";
          if (value === -1) return "Negative";
        }
      }
    }
  }
};

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

<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
<Button
variant={mode === "journal" ? "contained" : "outlined"}
onClick={() => setMode("journal")}

>

Journaling </Button>

<Button
variant={mode === "guided" ? "contained" : "outlined"}
onClick={() => setMode("guided")}

>

Guided Mode </Button>

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
                  {mode === "journal" ? (
<TextField
value={journal}
onChange={(e) => setJournal(e.target.value)}
onKeyDown={(e) => {
if (e.key === "Enter" && !e.shiftKey) {
e.preventDefault();
analyzeJournal(); // or your analyze logic
}
}}
multiline
rows={10}
fullWidth
placeholder="Write what you're feeling..."
/>
) : (
<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
<Typography sx={{ fontWeight: 600, mb: 2 }}>
Answer honestly — this will reflect patterns you might not notice yourself. </Typography>
{/* Q1 */}
<Box>
  <Typography fontWeight={600}>
    Q1. What are you seriously considering pursuing right now?
  </Typography>
  <Typography variant="caption" color="text.secondary">
    This reflects your current direction
  </Typography>
  <TextField
    fullWidth
    sx={{ mt: 1 }}
    value={guidedAnswers.q1}
    onChange={(e) =>
      setGuidedAnswers({ ...guidedAnswers, q1: e.target.value })
    }
    onKeyDown={(e) => {
if (e.key === "Enter" && !e.shiftKey) {
e.preventDefault();

  if (!guidedAnswers.q1 || !guidedAnswers.q2 || !guidedAnswers.q3 || !guidedAnswers.q4) {
    alert("Answer all required questions first");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    setResults({
      text: JSON.stringify(guidedAnswers),
      emotion: "guided"
    });
    setLoading(false);
  }, 1000);
}

}}
  />
</Box>

{/* Q2 */}
<Box>
  <Typography fontWeight={600}>
    Q2. When things get difficult, what do you usually do?
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Behavior under pressure
  </Typography>

  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
    {["Push harder", "Avoid", "Overthink"].map((opt) => (
      <Button
        key={opt}
        variant={guidedAnswers.q2 === opt ? "contained" : "outlined"}
sx={{
backgroundColor: guidedAnswers.q2 === opt ? "#3b82f6" : "",
color: guidedAnswers.q2 === opt ? "#fff" : "",
fontWeight: 600
}}

        onClick={() =>
          setGuidedAnswers({ ...guidedAnswers, q2: opt })
        }
      >
        {opt}
      </Button>
    ))}
  </Box>
</Box>

{/* Q3 */}
<Box>
  <Typography fontWeight={600}>
    Q3. What matters more to you right now?
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Your current priority
  </Typography>

  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
    {["Stability", "Freedom", "Recognition", "Learning"].map((opt) => (
      <Button
        key={opt}
        variant={guidedAnswers.q3 === opt ? "contained" : "outlined"}
sx={{
backgroundColor: guidedAnswers.q3 === opt ? "#3b82f6" : "",
color: guidedAnswers.q3 === opt ? "#fff" : "",
fontWeight: 600
}}

        onClick={() =>
          setGuidedAnswers({ ...guidedAnswers, q3: opt })
        }
      >
        {opt}
      </Button>
    ))}
  </Box>
</Box>

{/* Q4 */}
<Box>
  <Typography fontWeight={600}>
    Q4. What kind of situation excites you more?
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Your natural inclination
  </Typography>

  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
    {["Competing", "Creating", "Solving problems", "Helping people"].map((opt) => (
      <Button
        key={opt}
       variant={guidedAnswers.q4 === opt ? "contained" : "outlined"}
sx={{
backgroundColor: guidedAnswers.q4 === opt ? "#3b82f6" : "",
color: guidedAnswers.q4 === opt ? "#fff" : "",
fontWeight: 600
}}

        onClick={() =>
          setGuidedAnswers({ ...guidedAnswers, q4: opt })
        }
      >
        {opt}
      </Button>
    ))}
  </Box>
</Box>

{(guidedAnswers.q2 || guidedAnswers.q4) && (
<Typography sx={{ mt: 2, fontSize: 13, color: "#555" }}>
Pattern forming:{" "}
{guidedAnswers.q2 === "Avoid" && "You tend to pull back under pressure. "}
{guidedAnswers.q2 === "Push harder" && "You tend to push through difficulty. "}
{guidedAnswers.q4 === "Competing" && "You’re drawn toward performance and competition. "} </Typography>
)}

{/* Q5 */}
<Box>
  <Typography fontWeight={600}>
    Q5. What are you avoiding right now?
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Internal resistance
  </Typography>
  <TextField
    fullWidth
    sx={{ mt: 1 }}
    value={guidedAnswers.q5}
    onChange={(e) =>
      setGuidedAnswers({ ...guidedAnswers, q5: e.target.value })
    }
    onKeyDown={(e) => {
if (e.key === "Enter" && !e.shiftKey) {
e.preventDefault();

  if (!guidedAnswers.q1 || !guidedAnswers.q2 || !guidedAnswers.q3 || !guidedAnswers.q4) {
    alert("Answer all required questions first");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    setResults({
      text: JSON.stringify(guidedAnswers),
      emotion: "guided"
    });
    setLoading(false);
  }, 1000);
}

}}
  />
</Box>

  </Box>
)}


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
onClick={() => {
if (mode === "journal") {
analyzeJournal();
} else {
if (!guidedAnswers.q1 || !guidedAnswers.q2 || !guidedAnswers.q3 || !guidedAnswers.q4) {
alert("Answer all required questions first");
return;
}
setLoading(true);

setTimeout(() => {
  setResults({
    text: JSON.stringify(guidedAnswers),
    emotion: "guided"
  });
  setLoading(false);
}, 1200);

}
}}

>

{loading ? "Analyzing..." : "Analyze & Save"} </Button>


<Button
  onClick={startListening}
  sx={{
    background: "#cfe8ff",
    color: "#1f2a44",
    px: 2,
    borderRadius: 3,
    fontWeight: 600,
    textTransform: "none"
  }}
>
  🎤 {listening ? "Listening..." : "Speak"}
</Button>
<Typography sx={{ fontSize: 12, color: "#6b7a83", mt: 1 }}>
 Voice input is experimental and may contain errors. Please review before analyzing.
</Typography>
                  </Box>
                </Box>
                <MoodSticker onSelect={setMood} />

                <Box sx={{ mt: 3 }}>
                  <NotesToSelf notes={notes} addNote={addNote} />
                </Box>
              </Box>
            </Grid>
{results && insight && (
  <Box sx={{ ...paperCard, p: 3, mb: 3 }}>
    <Typography sx={{ fontWeight: 800, mb: 1 }}>
      Latest Insight
    </Typography>

    <Typography>
      <strong>Sentiment:</strong> {results.sentiment}
    </Typography>

    <Typography>
     <strong>Emotion:</strong> 
{insight.emotion === "thinking" ? "Thoughtful / Reflective" : insight.emotion}
    </Typography>

    <Typography sx={{ mt: 1 }}>
      <strong>Understanding:</strong>
    </Typography>

    <Typography sx={{ color: "#555", mb: 1 }}>
      {insight.explanation}
    </Typography>

    <Typography>
      <strong>Detected Traits:</strong>{" "}
      {insight.traits.length > 0
        ? insight.traits.join(", ")
        : "Still discovering"}
    </Typography>

    <Typography sx={{ mt: 1 }}>
      <strong>Suggested Paths:</strong>
    </Typography>

    {insight.careers.map((c, i) => (
      <Typography key={i} sx={{ color: "#2b2b2b" }}>
        • {c}
      </Typography>


    ))}
<Typography sx={{ mt: 2 }}>
  <strong>Suggested Approach:</strong>
</Typography>

<Typography sx={{ color: "#555" }}>
  {insight.nextStep}
</Typography>
  </Box>
)}
            <Grid item xs={12} md={5}>
              <Box sx={{ ...paperCard, p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
                <Typography className="hand" sx={{ fontSize: 18, fontWeight: 800, color: "#1f2a44", mb: 1 }}>Recent Analyses</Typography>
                <Box sx={{ maxHeight: 260, overflow: "auto" }}>
                  {history.length === 0 ? (
                    <Typography sx={{ color: "#6b7a83" }}>No entries yet. Your saved analyses appear here.</Typography>
                  ) : (
                    <List>
                      {history.slice().map(it => (
                        <ListItem key={it._id} sx={{ mb: 1, p: 2.2, borderRadius: 2, background: "#fffaf2", boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }}>
                          <ListItemText
                            primary={<Typography sx={{ fontWeight: 700, color: "#1f2a44" }}>{new Date(it.date).toLocaleString()}</Typography>}
                            secondary={<Typography sx={{ color: "#465b6c" }}>{it.analysis}{it.analysis.length > 140 ? "…" : ""}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>

              <Box sx={{ height: 18 }} />

             <CareerImpression careers={insight?.careers || []} />
              <TraitAnalysis traits={derivedTraits} />
              <StrengthProfile strengths={derivedStrengths} />
              <WeeklyPatternPage patterns={weeklyPatterns} />
            </Grid>

            {results && (
              <Grid item xs={12}>
                <Box sx={{ ...paperCard, p: 4 }}>
                  <Typography className="hand" sx={{ fontSize: 18, fontWeight: 800, color: "#1f2a44", mb: 2 }}>Visualization</Typography>
                  <Line data={lineChartData} options={options} />
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
<Typography sx={{ fontSize: 14, color: "#888", mb: 1 }}>
  Based on your current thinking patterns:
</Typography>
      {careers.length === 0 ? (
        <Typography sx={{ color: "#6b7a83" }}>"No strong patterns yet — write more to get clearer career suggestions."</Typography>
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
