// File: UserDetailModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const defaultUser = {
  full_name: '',
  email: '',
  password: '',
  phone_number: '',
  role: 'parttime',
  is_active: true,
};

function UserDetailModal({ isOpen, onClose, onSave, user }) {
  const [userData, setUserData] = useState(defaultUser);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setUserData(user || defaultUser);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData);
  };

  const isEdit = !!user;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="modal-content" onSubmit={handleSubmit}>
        <h3 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h3>

        <div className="modal-row">
          <div className="modal-label">Full Name:</div>
          <div className="modal-value">
            <input
              type="text"
              name="full_name"
              value={userData.full_name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>

        {!isEdit && (
          <>
            <div className="modal-row">
              <div className="modal-label">Email:</div>
              <div className="modal-value">
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-label">Password:</div>
              <div className="modal-value">
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
          </>
        )}

        <div className="modal-row">
          <div className="modal-label">Phone:</div>
          <div className="modal-value">
            <input
              type="tel"
              name="phone_number"
              value={userData.phone_number}
              onChange={handleChange}
              pattern="[0-9]*"
              className="form-control"
            />
          </div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Role:</div>
          <div className="modal-value">
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="parttime">Part-time</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Active:</div>
          <div className="modal-value">
            <input
              type="checkbox"
              name="is_active"
              checked={userData.is_active}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
            />
            User is Active
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-danger btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {isEdit ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserDetailModal;
