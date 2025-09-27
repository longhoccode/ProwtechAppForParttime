// File: StoreListPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import StoreDetailModal from "../components/StoreDetailModal";
import DataTable from "../components/DataTable";
import LoadingMessage from "../components/LoadingMessage";
import ErrorMessage from "../components/ErrorMessage";
import FilterBar from "../components/FilterBar";
import { provinces, districtMap } from "../constants/locationData";

function StoreListPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
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
      setStores(response.data.data);
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

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchProvince = filters.province ? store.district === filters.province : true;
      const matchDistrict = filters.district ? store.district_raw === filters.district : true;
      const matchSearch =
        (store.board_name || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.store_code || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.address || "").toLowerCase().includes(filters.search.toLowerCase());
      return matchProvince && matchDistrict && matchSearch;
    });
  }, [stores, filters]);

  return (
    <div className="container">
      <div className="page-header flex-between">
        <h2 className="page-title">Store Management</h2>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={[
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

      {loading && <LoadingMessage message="Loading stores..." />}
      <ErrorMessage message={error} />

      {!loading && !error && (
        <DataTable
          columns={[
            { label: "Store Chain" },
            { label: "Store Code" },
            { label: "Address" },
            { label: "Province" },
            { label: "District" },
            { label: "Status" },
            { label: "Actions", className: "table-actions" },
          ]}
          data={filteredStores}
          renderRow={(store) => (
            <tr key={store.id}>
              <td className="desktop-only">{store.board_name}</td>
              <td>{store.store_code}</td>
              <td className="desktop-only" id="address">{store.address}</td>
              <td className="desktop-only">{store.district}</td>
              <td className="desktop-only">{districtMap[store.district]?.find((d) => d.value === store.district_raw)?.label || store.district_raw}</td>
              <td className="desktop-only">
                <span
                  className={`status ${store.is_active ? "status-active" : "status-inactive"}`}
                >
                  {store.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="table-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenModal(store)}
                >
                  View
                </button>
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
