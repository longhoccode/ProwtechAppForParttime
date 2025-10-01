// File: StoreListPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import StoreDetailModal from "../components/modal/StoreDetailModal";
import DataTable from "../components/DataTable";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";
import FilterBar from "../components/FilterBar";
import StoreCount from "../components/StoreCount";
import { provinces, districtMap } from "../constants/locationData";

function StoreListPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [filters, setFilters] = useState({
    board: "all",
    province: "",
    district: "",
    search: "",
  });

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/stores");
      setStores(response.data.data || []);
    } catch (err) {
      console.error("❌ Fetch stores error:", err);
      setError("Failed to fetch stores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenModal = (store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  // District options based on selected province
  const districtOptions = filters.province ? districtMap[filters.province] || [] : [];

  // Board options
  const boardOptions = useMemo(
    () => [...new Set(stores.map((s) => s.board_name))].sort(),
    [stores]
  );

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const boardMatch = filters.board === "all" || store.board_name === filters.board;
      const matchProvince = filters.province ? store.district === filters.province : true;
      const matchDistrict = filters.district
        ? store.district_raw === filters.district
        : true;
      const matchSearch =
        (store.board_name || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.store_code || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.address || "").toLowerCase().includes(filters.search.toLowerCase());
      return boardMatch && matchProvince && matchDistrict && matchSearch;
    });
  }, [stores, filters]);

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Store Management</h2>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={[
          {
            name: "board",
            label: "Chain",
            type: "select",
            options: [{ value: "all", label: "Tất cả" }, ...boardOptions.map(b => ({ value: b, label: b }))],
          },
          {
            name: "province",
            type: "select",
            label: "Province",
            options: [{ value: "", label: "Tỉnh/TP" }, ...provinces],
          },
          {
            name: "district",
            type: "select",
            label: "District",
            options: [{ value: "", label: "Quận/Huyện" }, ...districtOptions],
          },
          {
            name: "search",
            type: "text",
            label: "Search",
            placeholder: "Name, code, or address...",
          },
        ]}
        values={filters}
        onChange={(name, value) =>
          setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "province" ? { district: "" } : {}),
          }))
        }
      />

      {/* Store count */}
      <div style={{ margin: "0.5rem 0" }}>
        <StoreCount count={filteredStores.length} />
      </div>

      {loading && <LoadingMessage message="Loading stores..." />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <DataTable
          columns={[
            { label: "Store Chain" },
            { label: "Store Code" },
            { label: "Address" },
            { label: "District" },
            { label: "Province" },
            { label: "Status" },
            { label: "Actions", className: "table-actions" },
          ]}
          data={filteredStores}
          renderRow={(store) => (
            <tr key={store.id}>
              <td>{store.board_name}</td>
              <td>{store.store_code}</td>
              <td id="address">{store.address}</td>
              <td>
                {districtMap[store.district]?.find((d) => d.value === store.district_raw)?.label ||
                  store.district_raw}
              </td>
              <td>{store.district}</td>
              <td>
                <span className={`badge ${store.is_active ? "badge-success" : "badge-error"}`}>
                  {store.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenModal(store)}
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      <StoreDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        store={selectedStore}
      />
    </div>
  );
}

export default StoreListPage;
