import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, full_name, role, token }
  const [loading, setLoading] = useState(true);

  // Load user & token từ localStorage khi refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // gắn token vào axios cho các request tiếp theo
      if (parsedUser.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
      }
    }
    setLoading(false);
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    // backend trả về { success, token, user }
    const { token, user: userData } = response.data;

    const userWithToken = { ...userData, token };

    // cập nhật state + localStorage
    setUser(userWithToken);
    localStorage.setItem("user", JSON.stringify(userWithToken));

    // gắn token vào axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return userWithToken;
  };

  // Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook để dùng auth nhanh gọn
export function useAuth() {
  return useContext(AuthContext);
}
