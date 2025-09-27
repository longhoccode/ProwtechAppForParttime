const db = require('../db');

// =============================================
// ==      CHỨC NĂNG CRUD CHO CAMPAIGN         ==
// =============================================

/**
 * Lấy tất cả các chiến dịch.
 * @route GET /api/campaigns
 */
exports.getAllCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("❌ Lỗi tại getAllCampaigns:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Lấy thông tin chi tiết của một chiến dịch bằng ID.
 * @route GET /api/campaigns/:id
 */
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM campaigns WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chiến dịch' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Lỗi tại getCampaignById:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Tạo một chiến dịch mới.
 * @route POST /api/campaigns
 */
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, start_date, end_date } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Tên, ngày bắt đầu và ngày kết thúc là bắt buộc' });
    }

    const query = `
      INSERT INTO campaigns (name, description, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, description, start_date, end_date];
    const { rows } = await db.query(query, values);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Lỗi tại createCampaign:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Cập nhật thông tin một chiến dịch.
 * @route PUT /api/campaigns/:id
 */
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, is_active } = req.body;

    const query = `
      UPDATE campaigns
      SET 
        name = $1, 
        description = $2, 
        start_date = $3, 
        end_date = $4,
        is_active = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const values = [name, description, start_date, end_date, is_active, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chiến dịch để cập nhật' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Lỗi tại updateCampaign:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 * Xóa một chiến dịch.
 * @route DELETE /api/campaigns/:id
 */
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    // Xóa các store liên quan trong bảng campaign_stores trước
    await db.query('DELETE FROM campaign_stores WHERE campaign_id = $1', [id]);
    
    const result = await db.query('DELETE FROM campaigns WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chiến dịch để xóa' });
    }

    res.status(200).json({ success: true, message: 'Chiến dịch đã được xóa thành công' });
  } catch (error) {
    console.error("❌ Lỗi tại deleteCampaign:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};


// =============================================
// ==      CHỨC NĂNG QUẢN LÝ STORE TRONG CAMPAIGN  ==
// =============================================

/**
 * Lấy tất cả các cửa hàng thuộc về một chiến dịch cụ thể.
 * @route GET /api/campaigns/:id/stores
 */
exports.getCampaignStores = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*
      FROM campaign_stores cs
      JOIN stores s ON cs.store_id = s.id
      WHERE cs.campaign_id = $1
      ORDER BY s.store_code ASC
    `;
    const { rows } = await db.query(query, [id]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Lỗi tại getCampaignStores:", error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

/**
 * Gán một cửa hàng vào một chiến dịch.
 * @route POST /api/campaigns/:id/stores
 */
exports.addStoreToCampaign = async (req, res) => {
  try {
    const { id: campaign_id } = req.params;
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp store_id' });
    }

    const query = `
      INSERT INTO campaign_stores (campaign_id, store_id)
      VALUES ($1, $2)
      ON CONFLICT (campaign_id, store_id) DO NOTHING
      RETURNING *
    `;
    const { rows } = await db.query(query, [campaign_id, store_id]);

    if (rows.length === 0) {
      return res.status(200).json({ success: true, message: 'Cửa hàng này đã có trong chiến dịch' });
    }

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Lỗi tại addStoreToCampaign:", error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

/**
 * Xóa một cửa hàng khỏi một chiến dịch.
 * @route DELETE /api/campaigns/:id/stores/:storeId
 */
exports.removeStoreFromCampaign = async (req, res) => {
  try {
    const { id: campaign_id, storeId: store_id } = req.params;

    const result = await db.query(
      'DELETE FROM campaign_stores WHERE campaign_id = $1 AND store_id = $2',
      [campaign_id, store_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng này trong chiến dịch' });
    }

    return res.status(200).json({ success: true, message: 'Đã xóa cửa hàng khỏi chiến dịch' });
  } catch (error) {
    console.error("❌ Lỗi tại removeStoreFromCampaign:", error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// GET /api/campaign-stores -> Trả về tất cả mapping campaign-store
exports.getAllCampaignStores = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        cs.id AS assignment_id,
        c.id AS campaign_id,
        c.name AS campaign_name,
        s.id AS store_id,
        s.store_code AS store_code,
        s.board_name AS store_chain
      FROM campaign_stores cs
      JOIN campaigns c ON cs.campaign_id = c.id
      JOIN stores s ON cs.store_id = s.id
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Lỗi tại getAllCampaignStores:", error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/campaigns/:id/stores/bulk
exports.bulkUpdateStoresInCampaign = async (req, res) => {
  try {
    const { id: campaign_id } = req.params;
    const { addIds = [], removeIds = [] } = req.body;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      for (const store_id of addIds) {
        await client.query(
          `INSERT INTO campaign_stores (campaign_id, store_id)
           VALUES ($1, $2)
           ON CONFLICT (campaign_id, store_id) DO NOTHING`,
          [campaign_id, store_id]
        );
      }

      for (const store_id of removeIds) {
        await client.query(
          'DELETE FROM campaign_stores WHERE campaign_id = $1 AND store_id = $2',
          [campaign_id, store_id]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({ success: true, message: 'Bulk update thành công' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Lỗi tại bulkUpdateStoresInCampaign:", error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// GET /api/campaigns/active
exports.getActiveCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM campaigns
      WHERE is_active = true
      ORDER BY start_date DESC
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Lỗi tại getActiveCampaigns:", error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
