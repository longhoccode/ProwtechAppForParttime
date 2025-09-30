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
  getAllCampaignStores,      // ✅ đổi tên cho rõ nghĩa
  bulkUpdateStoresInCampaign,
} = require('../controllers/campaignController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Áp dụng middleware cho toàn bộ route
router.use(protect);
router.use(authorize('admin'));

// --- Routes cho Campaign-Store Mapping ---
// Lấy toàn bộ mapping giữa campaign và store
router.route('/campaign-stores')
  .get(getAllCampaignStores);

// --- Routes cho Campaigns ---
router.route('/')
  .get(getAllCampaigns)     // GET /api/campaigns
  .post(createCampaign);    // POST /api/campaigns

router.route('/:id')
  .get(getCampaignById)     // GET /api/campaigns/:id
  .put(updateCampaign)      // PUT /api/campaigns/:id
  .delete(deleteCampaign);  // DELETE /api/campaigns/:id

// --- Routes cho Stores trong Campaign ---
router.route('/:id/stores')
  .get(getCampaignStores)      // GET /api/campaigns/:id/stores
  .post(addStoreToCampaign);   // POST /api/campaigns/:id/stores

router.route('/:id/stores/bulk')
  .post(bulkUpdateStoresInCampaign); // POST /api/campaigns/:id/stores/bulk

router.route('/:id/stores/:storeId')
  .delete(removeStoreFromCampaign);  // DELETE /api/campaigns/:id/stores/:storeId

module.exports = router;
