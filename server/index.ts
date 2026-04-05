import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================
// 🔹 MongoDB Connection
// ============================

const MONGO_URI = process.env.MONGODB_URI as string;

// ✅ Debug logs (very important)
console.log("🧪 ENV CHECK:", MONGO_URI ? "FOUND" : "MISSING");
console.log("🧪 MONGODB_URI VALUE:", MONGO_URI);

if (!MONGO_URI) {
    console.error("❌ MONGODB_URI not defined");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
    });

// ============================
// 🔹 Health Route
// ============================

app.get("/api/health", (req, res) => {
    res.json({
        status: "Smart Interview Prep API is running",
        timestamp: new Date(),
        version: "1.0.0",
    });
});

// ============================
// 🔹 Register Route
// ============================

app.post("/api/register", async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);

        const { name, email, password } = req.body;

        const newUser = {
            name,
            email,
            password,
        };

        console.log("User Saved:", newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error: any) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================
// 🔹 Start Server
// ============================

// ✅ IMPORTANT for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});