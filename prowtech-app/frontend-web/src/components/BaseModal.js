// src/components/BaseModal.jsx
import React from "react";
import ReactDOM from "react-dom";
import "../assets/styles/BaseModal.css";

function BaseModal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
          </div>
        )}

        <div className="modal-content">{children}</div>

        {actions && <div className="modal-actions-box">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}

export default BaseModal;
