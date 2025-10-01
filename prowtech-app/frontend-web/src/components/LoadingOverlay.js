import React from "react";

function LoadingOverlay({ text = "Đang tải..." }) {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
}

export default LoadingOverlay;
