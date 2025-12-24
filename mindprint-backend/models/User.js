const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  journals: [{ text: String, date: Date }],
  analyses: [{ skills: [String], traits: [String], tone: String, careers: [Object], date: Date }]
});

module.exports = mongoose.model('User', userSchema);