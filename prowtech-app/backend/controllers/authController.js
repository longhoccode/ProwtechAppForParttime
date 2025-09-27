const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/register -> Đăng ký người dùng mới
exports.register = async (req, res) => {
    const { full_name, email, password, phone_number, role } = req.body;

    // --- Validation cơ bản ---
    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    
    try {
        // --- Băm mật khẩu ---
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- Lưu người dùng vào DB ---
        const queryText = `
            INSERT INTO users(full_name, email, password_hash, phone_number, role)
            VALUES($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, created_at
        `;
        const values = [full_name, email, password_hash, phone_number, role];

        const { rows } = await db.query(queryText, values);
        
        res.status(201).json({ success: true, data: rows[0] });

    } catch (error) {
        // Bắt lỗi email/phone đã tồn tại (unique constraint)
        if (error.code === '23505') { 
            return res.status(409).json({ success: false, message: 'Email or phone number already exists.'});
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// POST /api/auth/login -> Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // DEBUG LOG: Bắt đầu quá trình login
    console.log(`[DEBUG] Login attempt for email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    try {
        // --- Tìm user theo email ---
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            // DEBUG LOG: Không tìm thấy user
            console.log(`[DEBUG] User with email ${email} not found.`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        
        // DEBUG LOG: Đã tìm thấy user
        console.log(`[DEBUG] User found: ${user.email} (ID: ${user.id})`);

        // --- So sánh mật khẩu đã băm ---
        console.log(`[DEBUG] Comparing provided password with stored hash...`);
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // DEBUG LOG: Sai mật khẩu
            console.log(`[DEBUG] Password comparison failed for user: ${user.email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // DEBUG LOG: Mật khẩu chính xác
        console.log(`[DEBUG] Password match. Creating JWT...`);

        // --- Tạo JWT ---
        const payload = {
            id: user.id,
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });

        // Loại bỏ password hash khỏi object user trả về
        delete user.password_hash;

        // DEBUG LOG: Gửi response thành công
        console.log(`[DEBUG] JWT created. Login successful for ${user.email}.`);

        res.status(200).json({
            success: true,
            token,
            user
        });

    } catch (error) {
        // DEBUG LOG: Lỗi server
        console.error('[DEBUG] An error occurred during the login process:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};