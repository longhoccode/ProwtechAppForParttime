
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { loginService, logoutService } from "../services/authService"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Trạng thái user chỉ chứa thông tin chi tiết (không chứa token)
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  // ✅ Load user details & check for tokens khi refresh
  useEffect(() => {
    // Chúng ta không cần gắn token vào axios ở đây vì Request Interceptor trong api.js đã xử lý
    // việc lấy token từ localStorage. Chúng ta chỉ cần lấy chi tiết user.
    const storedUser = localStorage.getItem("user_details");
    const token = localStorage.getItem("token"); // Kiểm tra sự tồn tại của token
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // Xảy ra lỗi khi parse user details (ví dụ: dữ liệu bị lỗi)
        console.error("Error parsing user details from localStorage:", error);
        logout(); // Đăng xuất để làm sạch localStorage
      }
    } else {
        // Nếu thiếu token hoặc user details, đảm bảo localStorage sạch sẽ
        if (storedUser || token) {
            logout(); 
        }
    }
    setLoading(false);
  }, []);

  // ✅ Đăng nhập
  const login = async (email, password) => {
    // loginService sẽ gọi API và tự động lưu "token" và "refreshToken" vào localStorage
    const { user: userData } = await loginService({ email, password }); 

    // Cập nhật state và lưu chi tiết user vào localStorage riêng
    setUser(userData);
    localStorage.setItem("user_details", JSON.stringify(userData));

    return userData;
  };

  // ✅ Đăng xuất
  const logout = () => {
    setUser(null);
    // Xóa tất cả các key liên quan đến Auth
    localStorage.removeItem("user_details"); // Key mới để lưu chi tiết user
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Gọi service để xử lý invalidate token trên backend (nếu có)
    logoutService(); 

    // Không cần xóa header Authorization ở đây, vì Interceptor sẽ thấy token bị mất
    // và sẽ không gắn vào request nữa.
  };

  const contextValue = useMemo(() => ({
    user, 
    login, 
    logout, 
    loading,
    isAuthenticated: !!user && !!localStorage.getItem("token"), // Kiểm tra cả state và token trong storage
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ custom hook để dùng auth nhanh gọn
export function useAuth() {
  return useContext(AuthContext);
}