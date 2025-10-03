require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;

// ⚡ Cấu hình CORS cho FE vercel + local
const corsOptions = {
  origin: [
    "https://prowtech-app-for-parttime.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ Bắt tất cả preflight request (OPTIONS)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend API for Prowtech App is running! 🚀');
});

// Import routes
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const staffRoutes = require('./routes/staffRoutes');

app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/staffs', staffRoutes);

// Không hardcode IP nữa, để 0.0.0.0 khi deploy
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
