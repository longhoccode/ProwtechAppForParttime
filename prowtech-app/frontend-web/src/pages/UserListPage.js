// File: UserListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import UserDetailModal from "../components/modal/UserDetailModal";
import DataTable from "../components/DataTable";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";
import FilterBar from "../components/FilterBar";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // filter state
  const [filters, setFilters] = useState({ role: "", search: "" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        const { id, ...updateData } = userData;
        const response = await api.put(`/users/${id}`, updateData);
        setUsers((prev) => prev.map((u) => (u.id === id ? response.data.data : u)));
      } else {
        const response = await api.post("/users", userData);
        setUsers((prev) => [response.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch {
      setError(userData.id ? "Failed to update user." : "Failed to create user.");
    }
  };

  const handleDeactivateUser = async (user) => {
    if (!window.confirm(`Deactivate ${user.full_name}?`)) return;
    try {
      const updatedUser = { ...user, is_active: false };
      const response = await api.put(`/users/${user.id}`, updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? response.data.data : u)));
    } catch {
      setError("Failed to deactivate user.");
    }
  };

  // filter logic
  const filteredUsers = users.filter((user) => {
    const matchRole = filters.role ? user.role === filters.role : true;
    const matchSearch =
      user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
        <button className="btn btn-primary btn-lg" onClick={handleOpenCreateModal}>
          + Add User
        </button>
      </div>

      <FilterBar
        filters={[
          {
            type: "select",
            name: "role",
            label: "Role",
            options: [
              { value: "", label: "Tất cả" },
              { value: "admin", label: "Quản trị viên" },
              { value: "manager", label: "Quản lý" },
              { value: "staff", label: "Nhân viên" },
            ],
          },
          {
            type: "text",
            name: "search",
            label: "Search",
            placeholder: "Search by name or email...",
          },
        ]}
        values={filters}
        onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
      />

      {loading && <LoadingMessage message="Loading users..." />}
      <ErrorMessage message={error} />

      {!loading && !error && (
        <DataTable
          columns={[
            { label: "Full Name" },
            { label: "Email" },
            { label: "Role" },
            { label: "Status" },
            { label: "Actions", className: "text-center" },
          ]}
          data={filteredUsers}
          renderRow={(user) => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`} className="table-link">
                  {user.full_name}
                </Link>
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`badge ${user.is_active ? "badge-success" : "badge-error"}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="table-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenEditModal(user)}
                >
                  Edit
                </button>
                {user.is_active && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeactivateUser(user)}
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      )}

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={currentUser}
      />
    </div>
  );
}

export default UserListPage;
