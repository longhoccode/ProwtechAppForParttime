import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import api from "../../services/api";

function AssignStoreModal({ isOpen, onClose, onSave, campaignId, initiallyAssignedIds }) {
  const [allStores, setAllStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setLoading(true);
      setError("");
      api.get("/stores")
        .then((res) => {
          setAllStores(res.data.data || []);
          setSelectedStoreIds(new Set(initiallyAssignedIds));
        })
        .catch(() => setError("Không thể tải danh sách cửa hàng."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, initiallyAssignedIds]);

  const handleToggleStore = (id) => {
    setSelectedStoreIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleSave = async () => {
    const orig = new Set(initiallyAssignedIds);
    const curr = selectedStoreIds;
    const add = [...curr].filter(id => !orig.has(id));
    const remove = [...orig].filter(id => !curr.has(id));

    setLoading(true);
    setError("");
    try {
      await Promise.all([
        ...add.map(id => api.post(`/campaigns/${campaignId}/stores`, { store_id: id })),
        ...remove.map(id => api.delete(`/campaigns/${campaignId}/stores/${id}`))
      ]);
      onSave();
    } catch {
      setError("Lưu thay đổi thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = allStores.filter(store =>
    `${store.board_name || ""} ${store.store_code || ""} ${store.address || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân công cửa hàng cho chiến dịch"
      actions={
        <>
          <button className="btn btn-danger btn-sm" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </>
      }
    >
      {error && <p className="alert alert-error">{error}</p>}

      <div className="modal-row">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="form-control"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="modal-content" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {filteredStores.map(store => (
          <label key={store.id} className="modal-row">
            <input type="checkbox" checked={selectedStoreIds.has(store.id)} onChange={() => handleToggleStore(store.id)} />
            <div className="modal-label">{store.store_code}</div>
            <div className="modal-value">{store.address}</div>
          </label>
        ))}
      </div>
    </BaseModal>
  );
}

export default AssignStoreModal;
