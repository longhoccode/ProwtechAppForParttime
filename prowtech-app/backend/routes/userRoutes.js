const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, getUserById, updateUser, createUser, deleteUser } = require('../controllers/userController');

// Tất cả các route dưới đây đều được bảo vệ và yêu cầu quyền 'admin'
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;