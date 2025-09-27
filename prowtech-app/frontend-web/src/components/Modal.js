// File: Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import "../styles/modal.css"; // nhớ thêm CSS animation, responsive

function Modal({ isOpen, onClose, children }) {
  // ESC key để đóng modal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng */}
        <button className="modal-close" onClick={onClose}>&times;</button>

        {/* Nội dung modal */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

export default Modal;
