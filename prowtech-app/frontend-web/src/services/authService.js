import api from './api';

// Gọi API login
export const loginService = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; // { user, token }
};

// Gọi API logout (nếu backend có endpoint logout)
export const logoutService = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn("Logout API failed:", error);
  }
};

// Gọi API để load profile từ token (optional)
export const getProfileService = async () => {
  const response = await api.get('/auth/profile');
  return response.data; // { user }
};
