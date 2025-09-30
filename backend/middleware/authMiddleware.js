const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// Middleware 1: Bảo vệ routes, kiểm tra JWT
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Lấy token từ header 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: 'Invalid token payload' });
      }

      // Lấy thông tin user từ DB (không lấy password) và gán vào req.user
      const { rows } = await db.query(
        'SELECT id, full_name, email, role FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = rows[0]; // gán user vào request
      return next();
    }

    // Không có header Authorization
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Middleware 2: Phân quyền theo role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User role missing, cannot authorize"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};
