// File: routes/campaignRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStores,
  addStoreToCampaign,
  removeStoreFromCampaign,
  getAllCampaignStores,
  bulkUpdateStoresInCampaign,
  updateStoreDoneStatus, // PATCH is_done
} = require('../controllers/campaignController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware áp dụng cho toàn bộ route
router.use(protect);
router.use(authorize('admin', 'parttime'));

// === Campaign-Store mapping ===
router.route('/campaign-stores')
  .get(getAllCampaignStores); // GET tất cả mapping

// === Campaigns ===
router.route('/')
  .get(getAllCampaigns)
  .post(createCampaign);

router.route('/:id')
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);

// === Stores trong Campaign ===
router.route('/:id/stores')
  .get(getCampaignStores)       // Lấy danh sách store của campaign
  .post(addStoreToCampaign);    // Thêm 1 store vào campaign

router.route('/:id/stores/bulk')
  .post(bulkUpdateStoresInCampaign); // Thêm/xóa nhiều store cùng lúc

router.route('/:campaignId/stores/:campaignStoreId')
  .patch(updateStoreDoneStatus)
  .delete(removeStoreFromCampaign);  // DELETE để xóa store khỏi campaign


module.exports = router;
