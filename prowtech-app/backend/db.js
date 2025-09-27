const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Thêm cấu hình timeout để tránh treo khi không kết nối được
  connectionTimeoutMillis: 5000, 
});

// (IIFE) Hàm tự gọi để kiểm tra kết nối ngay khi file được require
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Database connected successfully!");
  } catch (err) {
    console.error("❌ Error connecting to the database:", err.stack);
    // Thoát tiến trình nếu không kết nối được DB, vì app không thể hoạt động
    process.exit(1); 
  } finally {
    // Rất quan trọng: Phải giải phóng client về lại pool
    if (client) {
      client.release();
    }
  }
})();


module.exports = {
  query: (text, params) => pool.query(text, params),
};