const db = require('../db');
const bcrypt = require('bcryptjs'); 
// GET /api/users -> Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả user nhưng loại bỏ cột password_hash để bảo mật
        const { rows } = await db.query('SELECT id, full_name, email, phone_number, role, is_active, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// GET /api/users/:id -> Lấy thông tin một người dùng
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT id, full_name, email, phone_number, role, is_active, created_at FROM users WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// PUT /api/users/:id -> Cập nhật thông tin người dùng (do Admin)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role, is_active } = req.body; // Admin có thể thay đổi các trường này

        const queryText = 'UPDATE users SET full_name = $1, role = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING id, full_name, email, role, is_active';
        const values = [full_name, role, is_active, id];
        
        const { rows } = await db.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// POST /api/users -> Admin tạo người dùng mới
exports.createUser = async (req, res) => {
    const { full_name, email, password, phone_number, role } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const queryText = `
            INSERT INTO users(full_name, email, password_hash, phone_number, role)
            VALUES($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, created_at
        `;
        const values = [full_name, email, password_hash, phone_number, role];

        const { rows } = await db.query(queryText, values);
        res.status(201).json({ success: true, data: rows[0] });

    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ success: false, message: 'Email or phone number already exists.'});
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// DELETE /api/users/:id -> Admin xóa (xóa cứng) người dùng
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM users WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
