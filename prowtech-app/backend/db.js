const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000,
});

// Check kết nối
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to the database:", err.stack);
    process.exit(1);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // 👈 Export pool để dùng connect()
};
