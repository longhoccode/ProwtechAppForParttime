const db = require('../db');

// Helper xử lý lỗi server
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

// GET /api/staff -> Lấy tất cả nhân viên
exports.getAllStaff = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM staff ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        handleServerError(res, error);
    }
};

// GET /api/staff/:id -> Lấy nhân viên theo ID
exports.getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM staff WHERE id = $1', [id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Staff not found' });
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        handleServerError(res, error);
    }
};

// POST /api/staff -> Tạo nhân viên mới
exports.createStaff = async (req, res) => {
    try {
        const fields = [
            'full_name', 'day_of_birth', 'gender', 'address', 'id_number',
            'id_issued_date', 'tax_id', 'phone_number', 'bank_account', 'bank_name',
            'image_front', 'image_back'
        ];

        const values = fields.map(field => req.body[field]);

        const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');

        const queryText = `
            INSERT INTO staff (${fields.join(',')})
            VALUES (${placeholders})
            RETURNING *
        `;

        const { rows } = await db.query(queryText, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        handleServerError(res, error);
    }
};

// PUT /api/staff/:id -> Cập nhật nhân viên
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = [
            'full_name', 'day_of_birth', 'gender', 'address', 'id_number',
            'id_issued_date', 'tax_id', 'phone_number', 'bank_account', 'bank_name',
            'image_front', 'image_back'
        ];

        const setString = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(id);

        const queryText = `
            UPDATE staff
            SET ${setString}, updated_at=NOW()
            WHERE id=$${fields.length + 1}
            RETURNING *
        `;

        const { rows } = await db.query(queryText, values);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Staff not found' });

        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        handleServerError(res, error);
    }
};

// DELETE /api/staff/:id -> Xóa nhân viên
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM staff WHERE id=$1', [id]);
        if (!result.rowCount) return res.status(404).json({ success: false, message: 'Staff not found' });
        res.status(200).json({ success: true, message: 'Staff deleted successfully' });
    } catch (error) {
        handleServerError(res, error);
    }
};
