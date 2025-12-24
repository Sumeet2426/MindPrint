// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fetch from "node-fetch";
import Journal from "./models/Journal.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HF_KEY = process.env.HF_API_KEY;
const MONGO = process.env.MONGODB_URI;

// MongoDB connect
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connect error:", err));


// Helper to call HuggingFace
async function callHF(model, payload) {
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF error ${res.status}: ${txt}`);
  }

  return res.json();
}


// SIMPLE keyword-based career mapper
function keywordCareerMapper(text) {
  const t = text.toLowerCase();
  const careers = new Set();

  if (/code|python|js|react|linux|exploit/.test(t)) careers.add("Cybersecurity / Software Engineer");
  if (/data|sql|pandas|ml|analytics/.test(t)) careers.add("Data Analyst / ML Engineer");
  if (/teach|mentor|education/.test(t)) careers.add("Education / Trainer");
  if (/design|ux|ui|figma/.test(t)) careers.add("UX / Product Designer");
  if (/write|blog|copy|content/.test(t)) careers.add("Content Creator / Technical Writer");
  if (/manage|lead|team|project/.test(t)) careers.add("Product / Project Manager");

  if (careers.size === 0) careers.add("General Tech / Problem Solver");

  return Array.from(careers).slice(0, 3);
}



// ----------------------------------------------------------
// ANALYZE ROUTE
// ----------------------------------------------------------
app.post("/analyze", async (req, res) => {
  try {
    const { text, uid } = req.body;
    if (!text || !uid)
      return res.status(400).json({ error: "text and uid required" });

    // WORD COUNT VALIDATION (proper place)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return res.json({
        success: false,
        error: "Write a little more for a meaningful analysis (at least 10+ words)."
      });
    }

    console.log("Received text:", text);

    // 1. EMOTION
    let emotion = "neutral";
    let emotionsResult = null;

    try {
      emotionsResult = await callHF(
        "j-hartmann/emotion-english-distilroberta-base",
        { inputs: text }
      );

      if (Array.isArray(emotionsResult) && Array.isArray(emotionsResult[0])) {
        emotion = emotionsResult[0][0].label.toLowerCase();
      }
    } catch (err) {
      console.warn("EMOTION FAILED:", err.message);
    }

    // 2. SENTIMENT
    let sentiment = "neutral";
    let sentimentResult = null;

    try {
      sentimentResult = await callHF(
        "cardiffnlp/twitter-roberta-base-sentiment",
        { inputs: text }
      );

      if (Array.isArray(sentimentResult) && Array.isArray(sentimentResult[0])) {
        const bestLabel = sentimentResult[0][0].label;
        sentiment =
          bestLabel === "LABEL_2" ? "positive" :
          bestLabel === "LABEL_0" ? "negative" :
          "neutral";
      }
    } catch (err) {
      console.warn("SENTIMENT FAILED:", err.message);
    }

    // 3. Careers
    const career_suggestions = keywordCareerMapper(text);

    // 4. Summary
    const analysisText =
      `Sentiment: ${sentiment} | ` +
      `Dominant emotion: ${emotion} | ` +
      `Suggested careers: ${career_suggestions.join(", ")}`;

    // 5. Save to Mongo
    const journal = new Journal({
      uid,
      text,
      analysis: analysisText,
      tone: sentiment,
      emotion,
      careers: career_suggestions,
      date: new Date(),
    });

    await journal.save();

    return res.json({
      success: true,
      analysis: analysisText,
      emotion,
      sentiment,
      careers: career_suggestions,
      _id: journal._id
    });

  } catch (err) {
    console.error("MAIN ANALYZE ERROR:", err);
    return res.status(500).json({
      error: "Analysis error",
      details: err.message
    });
  }
});





// ----------------------------------------------------------
// GET USER ENTRIES
// ----------------------------------------------------------
app.get("/user/:uid", async (req, res) => {
  try {
    const items = await Journal.find({ uid: req.params.uid })
      .sort({ date: -1 })
      .limit(100);

    res.json({ analyses: items });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------------
// EDIT ENTRY
// ----------------------------------------------------------
app.put("/journal/:id", async (req, res) => {
  try {
    const item = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------------
// DELETE ENTRY
// ----------------------------------------------------------
app.delete("/journal/:id", async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.params.id);
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
