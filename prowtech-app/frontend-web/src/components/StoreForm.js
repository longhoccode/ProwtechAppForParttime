// File: StoreForm.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const DEFAULT_STATE = { 
  name: '', 
  address_vi: '', 
  latitude: '', 
  longitude: '', 
  is_active: true 
};

function StoreForm({ isOpen, onClose, onSave, initialData }) {
  const [storeData, setStoreData] = useState(DEFAULT_STATE);

  useEffect(() => {
    if (isOpen) {
      setStoreData(initialData || DEFAULT_STATE);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStoreData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(storeData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <form className="modal-form" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '20px' }}>
            {initialData ? 'Edit Store' : 'Add New Store'}
          </h3>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input 
              type="text"
              id="name"
              name="name"
              value={storeData.name || ''}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address_vi">Address:</label>
            <input 
              type="text"
              id="address_vi"
              name="address_vi"
              value={storeData.address_vi || ''}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Latitude */}
          <div className="form-group">
            <label htmlFor="latitude">Latitude:</label>
            <input 
              type="number"
              step="any"
              min="-90"
              max="90"
              id="latitude"
              name="latitude"
              value={storeData.latitude || ''}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Longitude */}
          <div className="form-group">
            <label htmlFor="longitude">Longitude:</label>
            <input 
              type="number"
              step="any"
              min="-180"
              max="180"
              id="longitude"
              name="longitude"
              value={storeData.longitude || ''}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {/* Active checkbox */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={storeData.is_active}
              onChange={handleChange}
              style={{ marginRight: '10px', width: 'auto' }}
            />
            <label htmlFor="is_active" style={{ marginBottom: 0, fontWeight: 'normal' }}>
              Store is Active
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-danger">
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

export default StoreForm;
