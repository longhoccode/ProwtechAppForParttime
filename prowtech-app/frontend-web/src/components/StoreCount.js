import React from "react";

function StoreCount({ count }) {
  return (
    <div className="popup">
      Số lượng cửa hàng tìm kiếm được: <strong>{count}</strong>
    </div>
  );
}

export default StoreCount;
