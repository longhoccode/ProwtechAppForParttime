// api.js (ĐÃ TỐI ƯU)

import axios from "axios";

// ... Khởi tạo axios instance ...

// === Request Interceptor: tự động gắn token ===
api.interceptors.request.use(
  (config) => {
    // Lấy token từ key "token" đã đồng bộ
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor: xử lý lỗi chung (401, 500, …) ===
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ⚡️ CHẮC CHẮN: Kiểm tra cả token và refreshToken đều có
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      
      // Xử lý logic Refresh Token... (Phần này của bạn đã đúng)
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Dùng axios gốc để tránh bị chặn bởi chính interceptor này
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken || refreshToken; // Nếu backend trả về refreshToken mới
        
        // ⚡️ LƯU TRỮ TOKEN MỚI
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken); 

        // Gắn token mới vào headers và retry request cũ
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại -> logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Xóa thông tin user nếu bạn lưu riêng (ví dụ: localStorage.removeItem("user_details"))
        
        // ⚡️ CẦN THIẾT: Chuyển hướng người dùng
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;