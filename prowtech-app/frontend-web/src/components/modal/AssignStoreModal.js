// src/components/AssignStoreModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import BaseModal from "../BaseModal";
import FilterBar from "../FilterBar";
import DataTable from "../DataTable";
import api from "../../services/api";
import { provinces, districtMap } from "../../constants/locationData";

function AssignStoreModal({ isOpen, onClose, onSave, campaignId, initiallyAssignedIds }) {
  const [allStores, setAllStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ province: "all", district: "", search: "", board: "" });

  useEffect(() => {
    if (isOpen) {
      setFilters({ search: "", province: "all", district: "" });
      setLoading(true);
      setError("");
      api
        .get("/stores")
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

  const handleSelectAll = () => {
    setSelectedStoreIds((prev) => {
      const copy = new Set(prev);
      filteredStores.forEach((s) => copy.add(s.id));
      return copy;
    });
  };

  const handleDeselectAll = () => {
    setSelectedStoreIds((prev) => {
      const copy = new Set(prev);
      filteredStores.forEach((s) => copy.delete(s.id));
      return copy;
    });
  };

  const handleSave = async () => {
    const orig = new Set(initiallyAssignedIds);
    const curr = selectedStoreIds;
    const add = [...curr].filter((id) => !orig.has(id));
    const remove = [...orig].filter((id) => !curr.has(id));

    if (add.length === 0 && remove.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post(`/campaigns/${campaignId}/stores/bulk`, { addIds: add, removeIds: remove });
      onSave();
    } catch {
      setError("Lưu thay đổi thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const getProvinceLabel = (code) => provinces.find((p) => p.value === code)?.label || code;
  const getDistrictLabel = (provinceCode, districtCode) =>
    districtMap[provinceCode]?.find((d) => d.value === districtCode)?.label || districtCode;

  const districtOptions =
    filters.province && filters.province !== "all" ? districtMap[filters.province] || [] : [];

  const boardOptions = useMemo(() => {
    const names = Array.from(new Set(allStores.map((s) => s.board_name).filter(Boolean)));
    return [{ value: "", label: "Tất cả" }, ...names.map((name) => ({ value: name, label: name }))];
  }, [allStores]);


  const filterConfig = [
    { name: "search", label: "Tìm kiếm", type: "text", placeholder: "Mã, tên hoặc địa chỉ..." },
    { name: "province", label: "Tỉnh/Thành phố", type: "select", options: [{ value: "all", label: "Tất cả" }, ...provinces] },
    { name: "district", label: "Quận/Huyện", type: "select", options: [{ value: "", label: "Tất cả" }, ...districtOptions] },
    { name: "board", label: "Board", type: "select", options: boardOptions },
  ];


  const filteredStores = useMemo(() => {
    return allStores.filter((store) => {
      const matchProvince = filters.province === "all" || store.district === filters.province;
      const matchDistrict = filters.district ? store.district_raw === filters.district : true;
      const matchBoard = filters.board ? store.board_name === filters.board : true;
      const text = `${store.board_name || ""} ${store.store_code || ""} ${store.address || ""}`.toLowerCase();
      const matchSearch = text.includes(filters.search.toLowerCase());
      return matchProvince && matchDistrict && matchBoard && matchSearch;
    });
  }, [allStores, filters]);


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân công cửa hàng cho chiến dịch"
      actions={
        <>
          <div className="modal-actions">
            <button className="btn btn-danger btn-sm" onClick={handleDeselectAll} disabled={loading}>Bỏ chọn tất cả</button>
            <button className="btn btn-success btn-sm" onClick={handleSelectAll} disabled={loading}>Chọn tất cả</button>
            <div>Đã chọn: {selectedStoreIds.size} / {allStores.length}</div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-danger btn-sm" onClick={onClose} disabled={loading}>Hủy</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
          </div>
        </>
      }
    >
      {error && <p className="alert alert-error">{error}</p>}

      <div className="sticky-filter">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
          onReset={() => setFilters({ search: "", province: "all", district: "" })}
        />
      </div>

      <DataTable
        columns={[
          { label: "Chọn" },
          { label: "Mã cửa hàng" },
          { label: "Địa chỉ" },
          { label: "Quận/Huyện" },
          { label: "Tỉnh/Thành phố" },
        ]}
        data={filteredStores}
        renderRow={(store) => (
          <tr key={store.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedStoreIds.has(store.id)}
                onChange={() => handleToggleStore(store.id)}
              />
            </td>
            <td>{store.store_code}</td>
            <td style={{maxWidth: "450px", textAlign: "left"}}>{store.address}</td>
            <td>{getDistrictLabel(store.district, store.district_raw)}</td>
            <td>{getProvinceLabel(store.district)}</td>
          </tr>
        )}
      />
    </BaseModal>
  );
}

export default AssignStoreModal;
