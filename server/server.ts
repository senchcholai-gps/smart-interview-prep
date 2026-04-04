import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// MongoDB Connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('? MONGODB_URI is not defined in .env file');
  console.error('Please add MONGODB_URI=mongodb://localhost:27017/smart-interview-prep to your .env file');
  process.exit(1);
}
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('? Connected to MongoDB successfully');
    console.log('?? Database:', MONGODB_URI);
  })
  .catch((err) => {
    console.error('? MongoDB connection error:', err);
    process.exit(1);
  });
// Middleware
app.use(cors());
app.use(express.json());
// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Smart Interview Prep API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});
// Generate questions route
app.post("/api/generate-questions", (req, res) => {
  const { role, experience, count = 5 } = req.body;
  // Template literals with backticks
  const mockQuestions = [
    Tell me about yourself for  position.,
    What skills make you suitable for ?,
    Describe a challenging  project.,
    How do you stay updated as a ?,
    Where do you see your career as a ?
  ];
  res.json({
    role,
    experience,
    questions: mockQuestions.slice(0, count).map((text, i) => ({
      id: q,
      text,
      category: i < 2 ? "Technical" : "Behavioral",
      difficulty: ["easy", "medium", "hard"][i % 3],
      timeLimit: 120
    }))
  });
});
// Start server
app.listen(PORT, () => {
  console.log(?? Interview Prep API: http://localhost:);
  console.log(?? Health check: http://localhost:/api/health);
});
