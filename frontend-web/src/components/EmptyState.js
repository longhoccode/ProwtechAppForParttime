import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";

function EmptyState({ title = "Không có dữ liệu", message = "Hãy thử lại sau.", icon = faInbox }) {
  return (
    <div className="empty-state">
      <FontAwesomeIcon icon={icon} className="empty-icon" />
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
    </div>
  );
}

export default EmptyState;
