import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";

const defaultUser = {
  full_name: "",
  email: "",
  password: "",
  phone_number: "",
  role: "parttime",
  is_active: true,
};

function UserDetailModal({ isOpen, onClose, onSave, user }) {
  const [userData, setUserData] = useState(defaultUser);

  useEffect(() => {
    if (isOpen) setUserData(user || defaultUser);
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData);
  };

  const isEdit = !!user;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add New User"}
      actions={
        <>
          <button className="btn btn-danger btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {isEdit ? "Update" : "Add"}
          </button>
        </>
      }
    >
      <div className="modal-row">
        <div className="modal-label">Full Name:</div>
        <div className="modal-value">
          <input type="text" name="full_name" value={userData.full_name} onChange={handleChange} className="form-control" required />
        </div>
      </div>

      {!isEdit && (
        <>
          <div className="modal-row">
            <div className="modal-label">Email:</div>
            <div className="modal-value">
              <input type="email" name="email" value={userData.email} onChange={handleChange} className="form-control" required />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-label">Password:</div>
            <div className="modal-value">
              <input type="password" name="password" value={userData.password} onChange={handleChange} className="form-control" required />
            </div>
          </div>
        </>
      )}

      <div className="modal-row">
        <div className="modal-label">Phone:</div>
        <div className="modal-value">
          <input type="tel" name="phone_number" value={userData.phone_number} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Role:</div>
        <div className="modal-value">
          <select name="role" value={userData.role} onChange={handleChange} className="form-control">
            <option value="parttime">Part-time</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Active:</div>
        <div className="modal-value">
          <input type="checkbox" name="is_active" checked={userData.is_active} onChange={handleChange} style={{ marginRight: "8px" }} />
          User is Active
        </div>
      </div>
    </BaseModal>
  );
}

export default UserDetailModal;
