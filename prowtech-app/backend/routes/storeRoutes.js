const express = require('express');
const router = express.Router();
const { 
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    getAllStoresByChain
} = require('../controllers/storeController');

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Lấy tất cả cửa hàng
router.get('/', protect, authorize('admin','parttime'), getAllStores);

// Lấy tất cả cửa hàng theo chain
router.get('/chain/:chain', protect, authorize('admin','parttime'), getAllStoresByChain);

// Lấy cửa hàng theo ID
router.get('/:id', protect, authorize('admin','parttime'), getStoreById);

// Thêm mới cửa hàng
router.post('/', protect, authorize('admin'), createStore);

// Cập nhật cửa hàng
router.put('/:id', protect, authorize('admin'), updateStore);

// Xóa cửa hàng
router.delete('/:id', protect, authorize('admin'), deleteStore);

module.exports = router;
