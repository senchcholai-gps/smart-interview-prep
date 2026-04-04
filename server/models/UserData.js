const mongoose = require('mongoose');
const userDataSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  profiles: [{
    id: String,
    jobRole: String,
    jobDescription: String,
    yearsOfExperience: String,
    techStacks: [String],
    createdAt: Date
  }],
  interviews: [{
    id: String,
    profileId: String,
    date: Date,
    score: Number,
    questionsCount: Number,
    answers: Array
  }],
  lastSync: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('UserData', userDataSchema);
