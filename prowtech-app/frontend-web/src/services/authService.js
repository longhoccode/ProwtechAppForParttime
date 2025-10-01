// authService.js (ĐÃ CẬP NHẬT)

import api from './api';

// Gọi API login
export const loginService = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { user, token, refreshToken } = response.data;
  
  // ⚡️ THÊM: Lưu refreshToken vào localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);

  return { user, token }; // Trả về user và access token
};

// Gọi API logout
export const logoutService = async () => {
  try {
    // ⚡️ THÊM: Có thể gọi API logout để invalidate refreshToken trên server
    await api.post('/auth/logout'); 
  } catch (error) {
    console.warn("Logout API failed:", error);
  } finally {
    // ⚡️ THÊM: Xóa token và refreshToken khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

