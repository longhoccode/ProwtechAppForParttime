import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";

function StaffDetailPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/staffs/${id}`); // URL theo ý bạn
      setStaff(response.data.data);
      setError("");
    } catch {
      setError("Không thể tải thông tin nhân viên.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  if (loading) return <LoadingMessage message="Đang tải thông tin nhân viên..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!staff) return <ErrorMessage message="Không tìm thấy nhân viên." />;

  const accountDetails = [
    { label: "Họ và tên", value: staff.full_name },
    { label: "Ngày sinh", value: staff.day_of_birth ? new Date(staff.day_of_birth).toLocaleDateString("vi-VN") : "Chưa có" },
    { label: "Số CMND/CCCD", value: staff.id_number || "Chưa có" },
    { label: "Ngày cấp CMND", value: staff.id_issued_date ? new Date(staff.id_issued_date).toLocaleDateString("vi-VN") : "Chưa có" },
    { label: "Mã số thuế", value: staff.tax_id || "Chưa có" },
    { label: "Số điện thoại", value: staff.phone_number || "Chưa có" },
    { label: "Tài khoản ngân hàng", value: staff.bank_account || "Chưa có" },
    { label: "Tên ngân hàng", value: staff.bank_name || "Chưa có" },
    { label: "Ngày tạo", value: staff.created_at ? new Date(staff.created_at).toLocaleDateString("vi-VN") : "Chưa có" },
  ];

  return (
    <div className="container">
      <Link to="/staffs" className="btn btn-outline btn-sm link">
        &larr; Quay lại danh sách nhân viên
      </Link>

      <div className="detail-page">
        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="card">
            <div className="card-body">
              <div className="avatar mb-3">{staff.full_name ? staff.full_name[0] : "?"}</div>
              <h3>{staff.full_name}</h3>
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

          <div className="card">
            <div className="card-header">Ảnh CMND</div>
            <div className="card-body">
              {staff.image_front && <img src={staff.image_front} alt="CMND mặt trước" className="mb-2" />}
              {staff.image_back && <img src={staff.image_back} alt="CMND mặt sau" />}
              {!staff.image_front && !staff.image_back && <p>Chưa có ảnh CMND</p>}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="detail-main">
          <div className="card">
            <div className="card-header">Thông tin bổ sung</div>
            <div className="card-body text-gray-600">
              <p>Chưa có dữ liệu bổ sung.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffDetailPage;
