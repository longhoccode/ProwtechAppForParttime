// File: staffRoutes.js
const express = require('express');
const router = express.Router();

// Import từng controller riêng lẻ
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

// Middleware bảo vệ route
const { protect, authorize } = require('../middleware/authMiddleware');

// ===================== Staff Routes ===================== //

// Lấy tất cả nhân viên
// GET /api/staffs
router.get('/', protect, authorize('admin'), getAllStaff);

// Lấy nhân viên theo ID
// GET /api/staffs/:id
router.get('/:id', protect, authorize('admin'), getStaffById);

// Tạo nhân viên mới
// POST /api/staffs
router.post('/', protect, authorize('admin'), createStaff);

// Cập nhật nhân viên theo ID
// PUT /api/staffs/:id
router.put('/:id', protect, authorize('admin'), updateStaff);

// Xóa nhân viên theo ID
// DELETE /api/staffs/:id
router.delete('/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
