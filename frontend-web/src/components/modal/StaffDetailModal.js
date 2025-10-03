import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";

// format YYYY-MM-DD -> YYYY-MM-DD (safe cho input)
const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0]; // chỉ lấy YYYY-MM-DD
};

const defaultStaff = {
  full_name: "",
  day_of_birth: "",
  gender: "Nam",
  address: "",
  id_number: "",
  id_issued_date: "",
  phone_number: "",
  bank_account_number: "",
  bank_name: "",
  image_front: "",
  image_back: "",
  is_active: true,
};

function StaffDetailModal({ isOpen, onClose, onSave, staff }) {
  const [staffData, setStaffData] = useState(defaultStaff);

  useEffect(() => {
    if (isOpen) {
      const formattedStaff = staff
        ? {
            ...staff,
            day_of_birth: formatDateForInput(staff.day_of_birth),
            id_issued_date: formatDateForInput(staff.id_issued_date),
          }
        : defaultStaff;
      setStaffData(formattedStaff);
    }
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
      {/* Full Name */}
      <div className="modal-row">
        <div className="modal-label">Full Name:</div>
        <div className="modal-value">
          <input
            type="text"
            name="full_name"
            value={staffData.full_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Date of Birth */}
      <div className="modal-row">
        <div className="modal-label">Date of Birth:</div>
        <div className="modal-value">
          <input
            type="date"
            name="day_of_birth"
            value={staffData.day_of_birth}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="modal-row">
        <div className="modal-label">Gender:</div>
        <div className="modal-value">
          <select name="gender" value={staffData.gender} onChange={handleChange}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="modal-row">
        <div className="modal-label">Address:</div>
        <div className="modal-value">
          <input type="text" name="address" value={staffData.address} onChange={handleChange} />
        </div>
      </div>

      {/* ID Number */}
      <div className="modal-row">
        <div className="modal-label">ID Number:</div>
        <div className="modal-value">
          <input type="text" name="id_number" value={staffData.id_number} onChange={handleChange} />
        </div>
      </div>

      {/* ID Issued Date */}
      <div className="modal-row">
        <div className="modal-label">ID Issued Date:</div>
        <div className="modal-value">
          <input
            type="date"
            name="id_issued_date"
            value={staffData.id_issued_date}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="modal-row">
        <div className="modal-label">Phone Number:</div>
        <div className="modal-value">
          <input type="tel" name="phone_number" value={staffData.phone_number} onChange={handleChange} />
        </div>
      </div>

      {/* Bank Account */}
      <div className="modal-row">
        <div className="modal-label">Bank Account:</div>
        <div className="modal-value">
          <input
            type="text"
            name="bank_account_number"
            value={staffData.bank_account_number}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bank Name */}
      <div className="modal-row">
        <div className="modal-label">Bank Name:</div>
        <div className="modal-value">
          <input type="text" name="bank_name" value={staffData.bank_name} onChange={handleChange} />
        </div>
      </div>

      {/* ID Front Image */}
      <div className="modal-row">
        <div className="modal-label">ID Front Image:</div>
        <div className="modal-value">
          <input type="text" name="image_front" value={staffData.image_front} onChange={handleChange} />
        </div>
      </div>

      {/* ID Back Image */}
      <div className="modal-row">
        <div className="modal-label">ID Back Image:</div>
        <div className="modal-value">
          <input type="text" name="image_back" value={staffData.image_back} onChange={handleChange} />
        </div>
      </div>

      {/* Active */}
      <div className="modal-row">
        <div className="modal-label">Active:</div>
        <div className="modal-value">
          <input
            type="checkbox"
            name="is_active"
            checked={staffData.is_active}
            onChange={handleChange}
            style={{ marginRight: "8px" }}
          />
          Staff is Active
        </div>
      </div>
    </BaseModal>
  );
}

export default StaffDetailModal;
