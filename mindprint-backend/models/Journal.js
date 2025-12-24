// models/Journal.js
import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  text: { type: String, required: true },
  analysis: { type: String },
  tone: { type: String },
  emotion: { type: String },
  careers: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Journal", JournalSchema);
