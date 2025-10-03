// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/register
exports.register = async (req, res) => {
  const { full_name, email, password, phone_number, role } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (full_name, email, password_hash, phone_number, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, role, created_at
    `;
    const values = [full_name, email, password_hash, phone_number, role];
    const { rows } = await db.query(query, values);

    return res.status(201).json({
      success: true,
      user: rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email or phone already exists' });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    delete user.password_hash;

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
