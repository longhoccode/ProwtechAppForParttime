// File: controllers/campaignController.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// =============================================
// ==  CRUD CHO CAMPAIGN
// =============================================

// GET /api/campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error("❌ getAllCampaigns:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// GET /api/campaigns/:id
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Không tìm thấy campaign' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ getCampaignById:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// POST /api/campaigns
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });

    const { rows } = await db.query(
      `INSERT INTO campaigns (id, name, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [uuidv4(), name, description, start_date, end_date]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ createCampaign:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// PUT /api/campaigns/:id
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, is_active } = req.body;

    const { rows } = await db.query(
      `UPDATE campaigns
       SET name=$1, description=$2, start_date=$3, end_date=$4, is_active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, description, start_date, end_date, is_active ?? false, id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Campaign không tồn tại' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ updateCampaign:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// DELETE /api/campaigns/:id
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM campaign_stores WHERE campaign_id=$1", [id]);
      const result = await client.query("DELETE FROM campaigns WHERE id=$1", [id]);
      await client.query("COMMIT");

      if (!result.rowCount)
        return res.status(404).json({ success: false, message: "Không tìm thấy campaign" });

      res.json({ success: true, message: "Xóa campaign thành công" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ deleteCampaign:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// =============================================
// ==  QUẢN LÝ STORE TRONG CAMPAIGN
// =============================================
// GET /api/campaigns/:id/stores
exports.getCampaignStores = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT 
          s.*, 
          cs.drive_folder_id
       FROM campaign_stores cs
       JOIN stores s ON s.id = cs.store_id
       WHERE cs.campaign_id = $1
       ORDER BY s.store_code`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getCampaignStores:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// POST /api/campaigns/:id/stores
exports.addStoreToCampaign = async (req, res) => {
  try {
    const { id: campaign_id } = req.params;
    const { store_id } = req.body;
    if (!store_id)
      return res.status(400).json({ success: false, message: "Thiếu store_id" });

    const { rows } = await db.query(
      `INSERT INTO campaign_stores (campaign_id, store_id)
       VALUES ($1, $2)
       ON CONFLICT (campaign_id, store_id) DO NOTHING
       RETURNING *`,
      [campaign_id, store_id]
    );

    if (!rows.length)
      return res.json({ success: true, message: "Store đã tồn tại trong campaign" });

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ addStoreToCampaign:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// DELETE /api/campaigns/:id/stores/:storeId
exports.removeStoreFromCampaign = async (req, res) => {
  try {
    const { id: campaign_id, storeId } = req.params;
    const result = await db.query(
      "DELETE FROM campaign_stores WHERE campaign_id=$1 AND store_id=$2",
      [campaign_id, storeId]
    );
    if (!result.rowCount)
      return res.status(404).json({ success: false, message: "Không tìm thấy mapping" });

    res.json({ success: true, message: "Xóa store khỏi campaign thành công" });
  } catch (err) {
    console.error("❌ removeStoreFromCampaign:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// GET /api/campaign-stores
exports.getAllCampaignStores = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cs.id AS assignment_id, cs.drive_folder_id as link_image, c.id AS campaign_id, c.name AS campaign_name,
              s.id AS store_id, s.store_code, s.board_name
       FROM campaign_stores cs
       JOIN campaigns c ON c.id = cs.campaign_id
       JOIN stores s ON s.id = cs.store_id`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getAllCampaignStores:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// POST /api/campaigns/:id/stores/bulk
exports.bulkUpdateStoresInCampaign = async (req, res) => {
  const { id: campaign_id } = req.params;
  const { addIds = [], removeIds = [] } = req.body;

  const client = await db.pool.connect(); // 👈 lấy client từ pool
  try {
    await client.query("BEGIN");

    if (addIds.length > 0) {
      const values = addIds.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `
        INSERT INTO campaign_stores (campaign_id, store_id)
        VALUES ${values}
        ON CONFLICT (campaign_id, store_id) DO NOTHING
        `,
        [campaign_id, ...addIds]
      );
    }

    if (removeIds.length > 0) {
      await client.query(
        `
        DELETE FROM campaign_stores
        WHERE campaign_id = $1 AND store_id = ANY($2::uuid[])
        `,
        [campaign_id, removeIds]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ success: true, message: "Bulk update thành công" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Lỗi tại bulkUpdateStoresInCampaign:", err.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  } finally {
    client.release();
  }
};


// GET /api/campaigns/active
exports.getActiveCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM campaigns WHERE is_active=true ORDER BY start_date DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getActiveCampaigns:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
