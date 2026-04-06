const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MONGODB CONNECTION ====================

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🧪 ENV CHECK:", process.env.MONGODB_URI ? "FOUND" : "MISSING");
console.log("🧪 MONGODB_URI VALUE:", process.env.MONGODB_URI);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.set('strictQuery', false);

console.log("📝 MONGODB_URI from env:", MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Atlas connection error:', err));


// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: 'user' },
  status: { type: String, default: 'Active' },
  profiles: { type: Number, default: 0 },
  interviews: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now }
});

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  jobRole: { type: String, required: true },
  experience: String,
  techStack: String,
  createdAt: { type: Date, default: Date.now }
});

// Interview Schema
const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  jobRole: String,
  techStack: String,
  questions: Array,
  answers: Array,
  score: Number,
  date: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Interview = mongoose.model('Interview', interviewSchema);

// ==================== USER ROUTES ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ joinedDate: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);

    const user = new User(req.body);
    const savedUser = await user.save();

    console.log("Saved User:", savedUser);

    res.status(201).json({
      message: 'User created successfully',
      user: savedUser
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE user BY ID
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  // Safety check for invalid user ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clean up associated data (optional but recommended)
    await Profile.deleteMany({ userId: id });
    await Interview.deleteMany({ userId: id });

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ✅ FIXED: Login accepts BOTH email and username
app.post('/api/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginId = email || username;

    console.log('🔍 Login attempt with:', loginId);

    // Hardcoded Admin Bypass
    if ((loginId === 'admin' || loginId === 'admin@gmail.com') && password === 'admin123') {
      console.log('✅ Admin bypass login successful');
      return res.status(200).json({
        user: {
          _id: "admin-system-id",
          name: "Admin User",
          username: "admin",
          email: "admin@gmail.com",
          role: "admin"
        }
      });
    }

    // Try to find by email first
    let user = await User.findOne({ email: loginId });

    // If not found by email, try by username
    if (!user) {
      console.log('⚠️ Not found by email, trying username...');
      user = await User.findOne({ username: loginId });
    }

    if (!user) {
      console.log('❌ User not found with:', loginId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.name || user.username);

    // Return user without sensitive data
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profiles: user.profiles,
        interviews: user.interviews,
        avgScore: user.avgScore
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROFILE ROUTES ====================

// Get all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profiles by user ID
app.get('/api/profiles/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  // Safety check: skip invalid IDs or admin-system-id
  if (userId === 'admin-system-id' || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.json([]); // return empty array instead of crashing
  }

  try {
    const profiles = await Profile.find({ userId }).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Create profile
app.post('/api/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    const savedProfile = await profile.save();

    await User.findByIdAndUpdate(profile.userId, {
      $inc: { profiles: 1 }
    });

    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE profile by ID
app.delete('/api/profiles/:id', async (req, res) => {
  const { id } = req.params;

  // Safety check for invalid profile ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid profile ID' });
  }

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const userId = profile.userId;
    await Profile.findByIdAndDelete(id);

    // Decrement profile count for the user
    await User.findByIdAndUpdate(userId, {
      $inc: { profiles: -1 }
    });

    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// ==================== INTERVIEW ROUTES ====================

// GET all interviews
app.get('/api/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ date: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET interviews by user ID
app.get('/api/interviews/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  // Safety check: skip invalid IDs or admin-system-id
  if (userId === 'admin-system-id' || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.json([]); // return empty array instead of crashing
  }

  try {
    const interviews = await Interview.find({ userId }).sort({ date: -1 });
    res.json(interviews);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// GET single interview by ID
app.get('/api/interviews/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new interview
app.post('/api/interviews', async (req, res) => {
  try {
    const interview = new Interview(req.body);
    const savedInterview = await interview.save();

    await User.findByIdAndUpdate(interview.userId, {
      $inc: { interviews: 1 },
      $set: { avgScore: interview.score }
    });

    res.status(201).json(savedInterview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE interview by ID
app.delete('/api/interviews/:id', async (req, res) => {
  const { id } = req.params;

  // Safety check for invalid interview ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid interview ID' });
  }

  try {
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const userId = interview.userId;
    await Interview.findByIdAndDelete(id);

    // Decrement interview count for the user
    await User.findByIdAndUpdate(userId, {
      $inc: { interviews: -1 }
    });

    res.json({ message: 'Interview deleted successfully' });
  } catch (err) {
    console.error('Error deleting interview:', err);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

// ==================== GEMINI ROUTE ====================
app.post("/api/gemini", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({ error: "Gemini API failed", details: data });
    }

    res.json(data);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== HEALTH ROUTE ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Smart Interview Prep API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Interview Prep API running at http://localhost:${PORT}`);
});