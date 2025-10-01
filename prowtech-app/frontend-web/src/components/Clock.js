import React, { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("vi-VN"); // dd/mm/yyyy

  return (
    <div className="popup">
      Today is <strong>{formattedDate}</strong>
    </div>
  );
}

export default Clock;
