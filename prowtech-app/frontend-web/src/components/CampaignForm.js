import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const defaultState = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  is_active: true,
};

// Hàm tiện ích format ngày yyyy-mm-dd
const formatDate = (date) =>
  date ? new Date(date).toISOString().split('T')[0] : '';

function CampaignForm({ isOpen, onClose, onSave, initialData }) {
  const [campaignData, setCampaignData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCampaignData({
          ...initialData,
          start_date: formatDate(initialData.start_date),
          end_date: formatDate(initialData.end_date),
        });
      } else {
        setCampaignData(defaultState);
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCampaignData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate ngày
    if (
      campaignData.start_date &&
      campaignData.end_date &&
      campaignData.end_date < campaignData.start_date
    ) {
      alert('End date cannot be before start date');
      return;
    }

    onSave(campaignData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <form className="modal-form" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '24px' }}>
            {initialData ? 'Edit Campaign' : 'Add New Campaign'}
          </h3>

          <div className="form-group">
            <label htmlFor="name">Campaign Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={campaignData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={campaignData.description}
              onChange={handleChange}
              rows={4}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={campaignData.start_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date:</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={campaignData.end_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={campaignData.is_active}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="is_active" className="form-check-label">
              Campaign is Active
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-danger"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default CampaignForm;
