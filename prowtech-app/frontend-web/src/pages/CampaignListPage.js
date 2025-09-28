// File: CampaignListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CampaignForm from "../components/modal/CampaignDetailModal";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";

function CampaignListPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);

  // State cho filter
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/campaigns");
      setCampaigns(response.data.data);
    } catch (err) {
      console.error("❌ Fetch campaigns error:", err);
      setError("Failed to fetch campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setCurrentCampaign(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (campaign) => {
    setCurrentCampaign(campaign);
    setIsModalOpen(true);
  };

  // Save (create/update)
  const handleSaveCampaign = async (campaignData) => {
    try {
      if (campaignData.id) {
        const { id, ...updateData } = campaignData;
        const response = await api.put(`/campaigns/${id}`, updateData);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? response.data.data : c))
        );
      } else {
        const response = await api.post("/campaigns", campaignData);
        setCampaigns((prev) => [response.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("❌ Save campaign error:", err);
      setError(
        campaignData.id
          ? "Failed to update campaign."
          : "Failed to create campaign."
      );
    }
  };

  // Delete
  const handleDeleteCampaign = async (campaign) => {
    if (
      window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)
    ) {
      try {
        await api.delete(`/campaigns/${campaign.id}`);
        setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      } catch (err) {
        console.error("❌ Delete campaign error:", err);
        setError("Failed to delete campaign.");
      }
    }
  };

  // Lọc data theo filter
  const filteredCampaigns = campaigns.filter((c) => {
    const matchStatus =
      filters.status === ""
        ? true
        : filters.status === "active"
        ? c.is_active
        : !c.is_active;

    const matchSearch =
      (c.name || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(filters.search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Campaign Management</h2>
        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-lg">
          + Add New Campaign
        </button>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={[
          {
            type: "select",
            name: "status",
            label: "Status",
            options: [
              { label: "All", value: "" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            type: "text",
            name: "search",
            label: "Search",
            placeholder: "Name or description...",
          },
        ]}
        values={filters}
        onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
      />

      {/* Loading & Error */}
      {loading && <LoadingMessage message="Loading campaigns..." />}
      <ErrorMessage message={error} />

      {/* DataTable */}
      {!loading && !error && (
        <DataTable
          columns={[
            { label: "Name" },
            { label: "Description" },
            { label: "Start Date" },
            { label: "End Date" },
            { label: "Status" },
            { label: "Actions", className: "actions-header" },
          ]}
          data={filteredCampaigns}
          renderRow={(campaign) => (
            <tr key={campaign.id}>
              <td>
                <Link to={`/campaigns/${campaign.id}`} className="table-link">
                  {campaign.name}
                </Link>
              </td>
              <td className="truncate-text" title={campaign.description}>
                {campaign.description}
              </td>
              <td>{new Date(campaign.start_date).toLocaleDateString("vi-VN")}</td>
              <td>{new Date(campaign.end_date).toLocaleDateString("vi-VN")}</td>
              <td>
                <span
                  className={`status ${
                    campaign.is_active ? "status-active" : "status-inactive"
                  }`}
                >
                  {campaign.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="table-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenEditModal(campaign)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCampaign(campaign)}
                >
                  Delete
                </button>
              </td>
            </tr>
          )}
        />
      )}

      {/* Modal */}
      <CampaignForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCampaign}
        initialData={currentCampaign}
      />
    </div>
  );
}

export default CampaignListPage;
