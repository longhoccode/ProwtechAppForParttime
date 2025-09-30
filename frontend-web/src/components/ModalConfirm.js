// File: ModalConfirm.jsx
import React from 'react';
import Modal from './Modal';

function ModalConfirm({ isOpen, onClose, onConfirm, title = "Confirm", message = "Are you sure?" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <h3 style={{ marginBottom: "15px" }}>{title}</h3>
        <p style={{ marginBottom: "20px" }}>{message}</p>

        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalConfirm;
