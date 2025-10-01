require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;

// ⚡ Cấu hình CORS cho FE Vercel
const corsOptions = {
  origin: [
    "https://prowtech-app-for-parttime.vercel.app", // FE vercel
    "http://localhost:3000" // nếu bạn còn test local
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // xử lý preflight

app.use(express.json());

// Routes
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const campaignRoutes = require('./routes/campaignRoutes');
const staffRoutes = require('./routes/staffRoutes');

app.get('/', (req, res) => {
    res.send('Backend API for Prowtech App is running! 🚀');
});

app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes); 
app.use('/api/staffs', staffRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
