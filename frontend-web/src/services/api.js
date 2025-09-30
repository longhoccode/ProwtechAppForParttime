import axios from 'axios';

// API_BASE_URL: 
// 1. Sẽ đọc từ biến môi trường (được thiết lập trên Vercel)
// 2. Fallback về địa chỉ cục bộ (localhost) khi đang phát triển.
// Lưu ý: Tôi đã đổi IP cục bộ thành localhost:3001, bạn có thể thay đổi lại
// thành 'http://192.168.1.28:3001/api' nếu cần.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL
});

// We'll add more configuration here later, like setting the auth token
export default api;
