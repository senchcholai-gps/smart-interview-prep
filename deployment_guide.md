# Smart Interview Prep - Production Deployment Guide

This guide contains everything you need to deploy your full-stack application. We will use **Render** for the Node.js/Express backend and **Vercel** for the React frontend, strictly using **MongoDB Atlas** for the database.

---

## 1. Backend Setup for Render

For Render to properly host your API, we need to ensure the backend is cleanly configured for production: CORS must allow the frontend's deployed URL, MongoDB Atlas must connect cleanly, and the start script must be defined.

### Updated `server/server.js` (or index.js)

Replace the relevant sections of your `server.js` with this production-ready code.

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MONGODB ATLAS CONNECTION ====================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ FATAL ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.set('strictQuery', false);

console.log("📝 Connecting to MongoDB Atlas...");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true, // Optional but good for compatibility
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas in Production'))
.catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    process.exit(1);
});

// ==================== MIDDLEWARE (CORS & Body Parser) ====================

// In production, restrict CORS to your specific Vercel URL
const allowedOrigins = [
  'http://localhost:3000', // For local dev frontends
  process.env.FRONTEND_URL // Your Vercel URL (e.g., https://smart-interview-prep.vercel.app)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ==================== HEALTH ROUTE (Used by Render) ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Smart Interview Prep API is running normally',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ... [Keep your existing schemas and route definitions here] ...

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
```

### `server/package.json` Scripts
Ensure your `package.json` in the `server` folder has a `start` script specifically for production (Render will run this automatically):

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 2. Frontend Setup for Vercel

When deploying to Vercel, your frontend must know to point to the live Render backend, rather than `http://localhost:5000`.

### Make API Calls Dynamic
Ensure every API call (`axios.get`, `fetch`, etc.) in your React app uses an environment variable for the base URL. Example:

```javascript
// frontend/src/config.js or similar
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Usage in a component
// axios.get(`${API_BASE_URL}/api/profiles`)
```

---

## 3. Environment Variables Template (`.env.example`)

Create a `.env.example` in both your frontend and backend directories and check it into git so other developers (and you) know what variables are expected.

**Backend `server/.env.example`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/interviewDB?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-project.vercel.app
```

**Frontend `.env.example`**
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 4. Step-by-Step Deployment Instructions

### Step A: Verify MongoDB Atlas
1. Log into your MongoDB Atlas dashboard.
2. Go to **Network Access** (under Security).
3. Click "Add IP Address" and select **Allow Access from Anywhere** (`0.0.0.0/0`). *(Render instances change IPs regularly, so this is required unless using specific VPC peering).*
4. Verify your Database User has `readWriteAnyDatabase` privileges.

### Step B: Deploy Backend to Render
1. Push your code to a GitHub repository.
2. Log into Render.com and click **New -> Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add all the keys from your backend `.env.example`.
   - *Leave `FRONTEND_URL` blank for a moment, we will grab it from Vercel.*
6. Click **Create Web Service**. Wait 3-5 minutes for it to build and start. 
7. Save the provided Render URL (e.g., `https://smart-interview-backend.onrender.com`).

### Step C: Deploy Frontend to Vercel
1. Log into Vercel and click **Add New -> Project**.
2. Select your GitHub repository.
3. Under **Framework Preset**, ensure it correctly auto-detects `Create React App` (or `Next.js` depending on your setup).
4. Under **Root Directory**, map it to your frontend folder (e.g., `.` or `frontend`).
5. Open **Environment Variables** and add:
   - Key: `REACT_APP_API_URL` 
   - Value: `https://smart-interview-backend.onrender.com` *(The URL you got from Render!)*
6. Click **Deploy**. Vercel will build and launch your site in ~2 minutes.
7. Save the provided Vercel URL (e.g., `https://smart-interview-prep.vercel.app`).

### Step D: Tie them together (Final CORS)
1. Go back to your Render Dashboard -> Environment Variables.
2. Add/Update `FRONTEND_URL` to match your new Vercel URL.
3. Click "Save", which usually triggers a quick redeploy/restart.

---

## 5. Optional Production Improvements

- **Security Headers (Helmet)**: Add `app.use(require('helmet')());` in `server.js` to protect against common web vulnerabilities.
- **Rate Limiting**: Install `express-rate-limit` to prevent spam/DDoS on your `/api/register` and `/api/login` endpoints.
- **Log Management**: Instead of `console.log`, install **Morgan** (`app.use(require('morgan')('combined'));`) to get detailed Apache-style logs of all incoming requests inside your Render dashboard.
- **HTTPS Setup**: Render and Vercel automatically handle SSL/HTTPS provisioning, ensuring all traffic between your users, Vercel, Render, and Atlas is fully encrypted.
- **Auto-Restart**: Render web services are configured by default to automatically restart if the Node process crashes. 

---

## 6. Post-Deployment Verification Checklist

Once both services are green, visit your Vercel URL and work through this test:

- [ ] **Health Check**: Open `https://your-backend.onrender.com/api/health` directly in the browser. You should see JSON containing "Smart Interview Prep API is running normally".
- [ ] **Registration Flow**: Create a new account on the Vercel frontend. Monitor the Network tab to ensure a `201 Created` status from the Render backend.
- [ ] **Atlas Verification**: Open your MongoDB Atlas dashboard -> Database -> "Browse Collections". Confirm the new User document was successfully saved.
- [ ] **Login Flow**: Log out on the frontend and log back in. The backend should return a `200 OK` with your profile payload.
- [ ] **Core API Functionality**: Fill out a job profile and complete a dummy interview flow. Ensure the backend properly assigns and returns the `score`.

> **Note on Render Free Tier**: Keep an eye on your **Render Dashboard Logs** during the first few frontend interactions! It is completely normal for a free-tier Render server to "sleep" after 15 minutes of inactivity; your first API request upon waking may take up to 30-50 seconds.
