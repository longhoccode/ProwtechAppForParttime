import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ForbiddenPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    logout();            // 👉 Xóa session
    navigate("/login");  // Quay về login
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>403 - Forbidden</h1>
      <p style={styles.message}>Bạn không có quyền truy cập trang này.</p>
      <button onClick={handleBack} style={styles.link}>
        ⬅ Quay về trang đăng nhập
      </button>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", backgroundColor: "#f8f9fa", color: "#333" },
  title: { fontSize: "3rem", marginBottom: "1rem" },
  message: { fontSize: "1.2rem", marginBottom: "2rem" },
  link: { padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", textDecoration: "none", borderRadius: "6px", cursor: "pointer" },
};

export default ForbiddenPage;
