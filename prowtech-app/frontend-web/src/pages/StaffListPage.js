// File: StaffListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import StaffDetailModal from "../components/modal/StaffDetailModal";
import DataTable from "../components/DataTable";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";
import FilterBar from "../components/FilterBar";

function StaffListPage() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  // filter state
  const [filters, setFilters] = useState({ search: "" });

  // Fetch staff
  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/staffs");
      setStaffs(response.data.data);
    } catch {
      setError("Failed to fetch staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const handleOpenCreateModal = () => {
    setCurrentStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setCurrentStaff(staff);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (staffData) => {
    try {
      if (staffData.id) {
        const { id, ...updateData } = staffData;
        const response = await api.put(`/staffs/${id}`, updateData);
        setStaffs((prev) => prev.map((s) => (s.id === id ? response.data.data : s)));
      } else {
        const response = await api.post("/staffs", staffData);
        setStaffs((prev) => [response.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch {
      setError(staffData.id ? "Failed to update staff." : "Failed to create staff.");
    }
  };

  // filter logic
  const filteredStaffs = staffs.filter((staff) => {
    const matchSearch =
      staff.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      staff.phone_number?.toLowerCase().includes(filters.search.toLowerCase() ?? "") ||
      staff.tax_id?.toLowerCase().includes(filters.search.toLowerCase() ?? "");
    return matchSearch;
  });

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Staff Management</h2>
        <button className="btn btn-primary btn-lg" onClick={handleOpenCreateModal}>
          + Add Staff
        </button>
      </div>

      <FilterBar
        filters={[
          {
            type: "text",
            name: "search",
            label: "Search",
            placeholder: "Search by name, phone, or tax ID...",
          },
        ]}
        values={filters}
        onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
      />

      {loading && <LoadingMessage message="Loading staff..." />}
      <ErrorMessage message={error} />

      {!loading && !error && (
        <DataTable
          columns={[
            { label: "Full Name" },
            { label: "Phone" },
            { label: "Tax ID" },
            { label: "Bank Account" },
            { label: "Bank Name" },
            { label: "Actions", className: "text-center" },
          ]}
          data={filteredStaffs}
          renderRow={(staff) => (
            <tr key={staff.id}>
              <td>
                <Link to={`/staffs/${staff.id}`} className="link">
                  {staff.full_name}
                </Link>
              </td>
              <td>{staff.phone_number || "N/A"}</td>
              <td>{staff.tax_id || "N/A"}</td>
              <td>{staff.bank_account || "N/A"}</td>
              <td>{staff.bank_name || "N/A"}</td>
              <td className="table-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenEditModal(staff)}
                >
                  Edit
                </button>
              </td>
            </tr>
          )}
        />
      )}

      <StaffDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        staff={currentStaff}
      />
    </div>
  );
}

export default StaffListPage;
