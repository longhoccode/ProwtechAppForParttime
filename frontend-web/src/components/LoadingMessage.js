// src/components/LoadingMessage.jsx
import React from "react";

function LoadingMessage({ message = "Loading..." }) {
  return <p className="loading-message">{message}</p>;
}

export default LoadingMessage;
