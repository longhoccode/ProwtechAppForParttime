require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const campaignRoutes = require('./routes/campaignRoutes');

// Middlewares
app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Backend API for Prowtech App is running! 🚀');
});

// Use routes
app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);  

app.listen(PORT, '192.168.1.23', () => {
  console.log(`Server running on port ${PORT}`);
});