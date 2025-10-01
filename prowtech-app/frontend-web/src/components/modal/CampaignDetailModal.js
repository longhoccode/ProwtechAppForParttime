import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";

const defaultState = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "draft",  // default status
  is_done: false,
};

const formatDate = (date) =>
  date ? new Date(date).toISOString().split("T")[0] : "";

function CampaignDetailModal({ isOpen, onClose, onSave, initialData }) {
  const [campaignData, setCampaignData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCampaignData({
          ...initialData,
          start_date: formatDate(initialData.start_date),
          end_date: formatDate(initialData.end_date),
          status: initialData.status || "draft",
          is_done: initialData.is_done ?? false,
        });
      } else setCampaignData(defaultState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCampaignData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (campaignData.start_date && campaignData.end_date && campaignData.end_date < campaignData.start_date) {
      alert("End date cannot be before start date");
      return;
    }
    onSave(campaignData);
  };

  const isEdit = !!initialData;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Add New Campaign"}
      actions={
        <>
          <button className="btn btn-danger btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {isEdit ? "Update" : "Save"}
          </button>
        </>
      }
    >
      <div className="modal-row">
        <div className="modal-label">Campaign Name:</div>
        <div className="modal-value">
          <input
            type="text"
            name="name"
            value={campaignData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Description:</div>
        <div className="modal-value">
          <input
            type="text"
            name="description"
            value={campaignData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Start Date (MM-DD-YYYY):</div>
        <div className="modal-value">
          <input
            type="date"
            name="start_date"
            value={campaignData.start_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">End Date (MM-DD-YYYY):</div>
        <div className="modal-value">
          <input
            type="date"
            name="end_date"
            value={campaignData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Status:</div>
        <div className="modal-value">
          <select
            name="status"
            value={campaignData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      {/* Active */}
      <div className="modal-row">
        <div className="modal-label">Active:</div>
        <div className="modal-value">
          <input
            type="checkbox"
            name="is_done"
            checked={campaignData.is_done}
            onChange={handleChange}
            style={{ marginRight: "8px" }}
          />
          Campaign Is Done
        </div>
      </div>
    </BaseModal>
  );
}

export default CampaignDetailModal;
