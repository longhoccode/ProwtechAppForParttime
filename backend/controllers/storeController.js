const db = require('../db'); // Import module kết nối db

// GET /api/stores -> Lấy tất cả cửa hàng
exports.getAllStores = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM stores ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// GET /api/stores/chain/:chain -> Lấy tất cả cửa hàng theo chuỗi
exports.getAllStoresByChain = async (req, res) => {
    try {
        const { chain } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM stores WHERE board_name = $1 ORDER BY created_at DESC',
            [chain]
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// GET /api/stores/:id -> Lấy một cửa hàng theo ID
exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM stores WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// POST /api/stores -> Tạo cửa hàng mới
exports.createStore = async (req, res) => {
    try {
        const {
            inventory_id,
            board_name,
            store_code,
            display_name,
            address,
            e_address,
            district,
            state,
            country,
            ref_id,
            no_of_lcds,
            no_of_lightbox,
            screen_facing,
            board_format,
            category,
            latitude,
            longitude,
            is_active
        } = req.body;

        const queryText = `
            INSERT INTO stores (
                inventory_id, board_name, store_code, display_name, address,
                e_address, district, state, country, ref_id, no_of_lcds, no_of_lightbox,
                screen_facing, board_format, category, latitude, longitude, is_active
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18
            )
            RETURNING *
        `;

        const values = [
            inventory_id, board_name, store_code, display_name, address,
            e_address, district, state, country, ref_id, no_of_lcds, no_of_lightbox,
            screen_facing, board_format, category, latitude, longitude, is_active
        ];

        const { rows } = await db.query(queryText, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// PUT /api/stores/:id -> Cập nhật cửa hàng
exports.updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            board_name,
            store_code,
            display_name,
            address,
            e_address,
            district,
            state,
            country,
            ref_id,
            no_of_lcds,
            no_of_lightbox,
            screen_facing,
            board_format,
            category,
            latitude,
            longitude,
            is_active
        } = req.body;

        const queryText = `
            UPDATE stores
            SET
                board_name = $1,
                store_code = $2,
                display_name = $3,
                address = $4,
                e_address = $5,
                district = $6,
                state = $7,
                country = $8,
                ref_id = $9,
                no_of_lcds = $10,
                no_of_lightbox = $11,
                screen_facing = $12,
                board_format = $13,
                category = $14,
                latitude = $15,
                longitude = $16,
                is_active = $17,
                updated_at = NOW()
            WHERE id = $18
            RETURNING *
        `;

        const values = [
            board_name, store_code, display_name, address, e_address,
            district, state, country, ref_id, no_of_lcds, no_of_lightbox,
            screen_facing, board_format, category, latitude, longitude, is_active, id
        ];

        const { rows } = await db.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// DELETE /api/stores/:id -> Xóa cửa hàng
exports.deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM stores WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.status(200).json({ success: true, message: 'Store deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
