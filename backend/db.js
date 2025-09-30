const { Pool } = require('pg');
require('dotenv').config();

// Lấy chuỗi kết nối (Nếu bạn sử dụng biến DATABASE_URL)
const DATABASE_URL = process.env.DATABASE_URL;

// Cấu hình kết nối cho môi trường cục bộ (local)
let connectionConfig = {};

// Nếu DATABASE_URL tồn tại, sử dụng chuỗi kết nối
if (DATABASE_URL) {
  // Nếu có DATABASE_URL, Render đã cung cấp chuỗi hoàn chỉnh.
  connectionConfig = {
    connectionString: DATABASE_URL,
    // Bắt buộc cấu hình SSL khi kết nối từ bên ngoài (local)
    ssl: {
      // Cho phép kết nối khi không có chứng chỉ xác minh (Self-signed certificate)
      // cần thiết khi chạy dev cục bộ với Render DB.
      rejectUnauthorized: false
    }
  };
} else {
  // Nếu không dùng DATABASE_URL, dùng các biến rời rạc và vẫn thêm SSL
  connectionConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000,
    // Bật SSL
    ssl: {
      rejectUnauthorized: false
    }
  };
}

const pool = new Pool(connectionConfig);

// Check kết nối
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to the database. Check SSL configuration and IP access in Render:", err.stack);
    // Vẫn thoát nếu kết nối thất bại để không chạy ứng dụng với DB lỗi
    process.exit(1); 
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
