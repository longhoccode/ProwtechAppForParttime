require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const app = express();
// Render thiết lập process.env.PORT là 10000. Cần lắng nghe chính xác cổng này.
const PORT = process.env.PORT || 3001; 

// Import routes
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const campaignRoutes = require('./routes/campaignRoutes');
const staffRoutes = require('./routes/staffRoutes')

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
app.use('/api/staffs', staffRoutes);

// Khắc phục: Loại bỏ hardcoded IP ('192.168.1.28')
// Khi chỉ cung cấp PORT, Express sẽ mặc định lắng nghe trên 0.0.0.0 (tất cả các giao diện mạng),
// đây là hành vi bắt buộc trên các nền tảng cloud như Render.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
