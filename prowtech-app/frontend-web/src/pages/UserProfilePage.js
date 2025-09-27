// src/pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data.data);
    } catch {
      setError("Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!user) return <div>User not found.</div>;

  return (
    
    <div className="container">
      <Link to="/users" className="btn btn-outline btn-sm mb-3">
        &larr; Back to User List
      </Link>
      <div className="profile-page">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {/* Avatar + Basic Info */}
          <div className="card text-center">
            <div className="card-body">
              <div className="profile-avatar mb-2">
                {user.full_name ? user.full_name[0] : "?"}
              </div>
              <h3>{user.full_name}</h3>
              <p className="detail-label">{user.role}</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="card">
            <div className="card-header">Account Details</div>
            <div className="card-body">
              {[
                { label: "Full Name", value: user.full_name },
                { label: "Email", value: user.email },
                { label: "Phone Number", value: user.phone_number || "N/A" },
                {
                  label: "Status",
                  value: (
                    <span
                      className={
                        user.is_active ? "detail-value" : "detail-label"
                      }
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  ),
                },
                {
                  label: "Joined Date",
                  value: new Date(user.created_at).toLocaleDateString("vi-VN"),
                },
              ].map((item) => (
                <div className="detail-row" key={item.label}>
                  <div className="detail-label">{item.label}</div>
                  <div className="detail-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          <div className="card">
            <div className="card-header">Additional Info</div>
            <div className="card-body">
              <p>No additional information available.</p>
              {/* Có thể thêm bảng activity, logs, hoặc chi tiết khác */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserProfilePage;
