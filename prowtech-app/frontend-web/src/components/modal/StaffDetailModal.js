import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";

const defaultStaff = {
  full_name: "",
  day_of_birth: "",
  gender: "Nam",
  address: "",
  id_number: "",
  join_date: "",
  phone_number: "",
  bank_account: "",
  bank_name: "",
  id_front_image: "",
  id_back_image: "",
  is_active: true,
};

function StaffDetailModal({ isOpen, onClose, onSave, staff }) {
  const [staffData, setStaffData] = useState(defaultStaff);

  useEffect(() => {
    if (isOpen) setStaffData(staff || defaultStaff);
  }, [isOpen, staff]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaffData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(staffData);
  };

  const isEdit = !!staff;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Staff" : "Add New Staff"}
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
          <input type="text" name="full_name" value={staffData.full_name} onChange={handleChange} className="form-control" required />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Date of Birth:</div>
        <div className="modal-value">
          <input type="date" name="day_of_birth" value={staffData.day_of_birth} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Gender:</div>
        <div className="modal-value">
          <select name="gender" value={staffData.gender} onChange={handleChange} className="form-control">
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Address:</div>
        <div className="modal-value">
          <input type="text" name="address" value={staffData.address} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">ID Number:</div>
        <div className="modal-value">
          <input type="text" name="id_number" value={staffData.id_number} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Join Date:</div>
        <div className="modal-value">
          <input type="date" name="join_date" value={staffData.join_date} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Phone Number:</div>
        <div className="modal-value">
          <input type="tel" name="phone_number" value={staffData.phone_number} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Bank Account:</div>
        <div className="modal-value">
          <input type="text" name="bank_account" value={staffData.bank_account} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Bank Name:</div>
        <div className="modal-value">
          <input type="text" name="bank_name" value={staffData.bank_name} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">ID Front Image:</div>
        <div className="modal-value">
          <input type="text" name="google_token" value={staffData.id_front_image} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">ID Back Image:</div>
        <div className="modal-value">
          <input type="text" name="facebook_token" value={staffData.id_back_image} onChange={handleChange} className="form-control" />
        </div>
      </div>

      <div className="modal-row">
        <div className="modal-label">Active:</div>
        <div className="modal-value">
          <input type="checkbox" name="is_active" checked={staffData.is_active} onChange={handleChange} style={{ marginRight: "8px" }} />
          Staff is Active
        </div>
      </div>
    </BaseModal>
  );
}

export default StaffDetailModal;
