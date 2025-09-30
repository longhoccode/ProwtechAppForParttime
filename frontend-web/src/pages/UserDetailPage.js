// src/pages/UserDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";

function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data.data);
      setError("");
    } catch {
      setError("Không thể tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) return <LoadingMessage text="Đang tải thông tin người dùng..." />;
  if (error) return <ErrorMessage text={error} />;
  if (!user) return <ErrorMessage text="Không tìm thấy người dùng." />;

  const accountDetails = [
    { label: "Họ và tên", value: user.full_name },
    { label: "Email", value: user.email },
    { label: "Số điện thoại", value: user.phone_number || "Chưa có" },
    {
      label: "Trạng thái",
      value: (
        <span className={user.is_active ? "badge badge-success" : "badge badge-error"}>
          {user.is_active ? "Hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
    {
      label: "Ngày tham gia",
      value: new Date(user.created_at).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <div className="container">
      <Link to="/campaigns" className="btn btn-outline btn-sm link">
        &larr; Quay lại danh sách chiến dịch
      </Link>

      <div className="detail-page">
        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="card">
            <div className="card-body">
              <div className="avatar mb-3">
                {user.full_name ? user.full_name[0] : "?"}
              </div>
              <h3>{user.full_name}</h3>
              <p className="text-muted">{user.role}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Thông tin tài khoản</div>
            <div className="card-body">
              {accountDetails.map((item) => (
                <div key={item.label} className="detail-row">
                  <span className="detail-label">{item.label}</span>
                  <span className="detail-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="detail-main">
          <div className="card">
            <div className="card-header">Thông tin bổ sung</div>
            <div className="card-body text-gray-600">
              <p>Chưa có dữ liệu bổ sung.</p>
              {/* TODO: bảng activity, logs, hoặc chi tiết khác */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDetailPage;
