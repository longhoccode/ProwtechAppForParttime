// File: StoreMapPage.jsx
import React, { memo, useState, useMemo, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from "@react-google-maps/api";
import FilterBar from "../components/FilterBar";
import StoreCount from "../components/StoreCount";
import api from "../services/api";
import { provinces, districtMap } from "../constants/locationData";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "8px" };

function StoreMapPage() {
  const [stores, setStores] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStores, setCampaignStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [selectedStore, setSelectedStore] = useState(null);

  const [filterValues, setFilterValues] = useState({
    board: "all",
    campaign: "all",
    district: "all",
    districtRaw: "all",
  });

  const mapRef = useRef(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Lấy vị trí người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapRef.current) {
            mapRef.current.setCenter(loc);
            mapRef.current.setZoom(14);
          }
        },
        (err) => console.warn("Geolocation denied or error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [isLoaded]);

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStores, resCampaigns, resCampaignStores] = await Promise.all([
          api.get("/stores"),
          api.get("/campaigns"),
          api.get("/campaigns/campaign-stores"),
        ]);
        setStores(resStores.data.data || []);
        setCampaigns(resCampaigns.data.data || []);
        setCampaignStores(resCampaignStores.data.data || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchData();
  }, []);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleReset = () => {
    setFilterValues({ board: "all", campaign: "all", district: "all", districtRaw: "all" });
    setSelectedStore(null);
    if (mapRef.current && userLocation) {
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(12);
    }
  };

  // Tính toán filteredStores
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const boardMatch = filterValues.board === "all" || store.board_name === filterValues.board;
      const districtMatch = filterValues.district === "all" || store.district === filterValues.district;
      const districtRawMatch =
        filterValues.districtRaw === "all" || store.district_raw === filterValues.districtRaw;
      const campaignMatch =
        filterValues.campaign === "all" ||
        campaignStores.some(
          (cs) =>
            String(cs.campaign_id) === String(filterValues.campaign) &&
            String(cs.store_id) === String(store.id)
        );
      return boardMatch && districtMatch && districtRawMatch && campaignMatch;
    });
  }, [stores, filterValues, campaignStores]);

  // Province options từ filteredStores
  const provinceOptions = useMemo(() => {
    const provincesFromFiltered = [...new Set(filteredStores.map((s) => s.district))];
    return provincesFromFiltered
      .map((d) => {
        const provinceObj = provinces.find((p) => p.value === d);
        return provinceObj ? { value: provinceObj.value, label: provinceObj.label } : null;
      })
      .filter(Boolean);
  }, [filteredStores]);

  // DistrictRaw options từ filteredStores
  const districtRawOptions = useMemo(() => {
    if (filterValues.district === "all") return [];

    const districtsFromFiltered = [
      ...new Set(
        filteredStores
          .filter((s) => s.district === filterValues.district)
          .map((s) => s.district_raw)
      ),
    ];

    return districtsFromFiltered
      .map((d) => {
        const found = districtMap[filterValues.district]?.find((x) => x.value === d);
        return found ? { value: found.value, label: found.label } : null;
      })
      .filter(Boolean);
  }, [filteredStores, filterValues.district]);

  // Board options
  const boardOptions = useMemo(
    () => [...new Set(stores.map((s) => s.board_name))].sort(),
    [stores]
  );

  // Filters
  const filters = useMemo(() => {
    const baseFilters = [
      { name: "board", label: "Chain", type: "select", options: ["Tất cả", ...boardOptions] },
      {
        name: "campaign",
        label: "Campaign",
        type: "select",
        options: [{ value: "all", label: "Tất cả" }, ...campaigns.map((c) => ({ value: c.id, label: c.name }))],
      },
      {
        name: "district",
        label: "Provinces",
        type: "select",
        options: [{ value: "all", label: "Tất cả" }, ...provinceOptions],
      },
    ];

    if (filterValues.district !== "all") {
      baseFilters.push({
        name: "districtRaw",
        label: "District",
        type: "select",
        options: [{ value: "all", label: "Tất cả" }, ...districtRawOptions],
      });
    }

    return baseFilters;
  }, [boardOptions, campaigns, filterValues.district, provinceOptions, districtRawOptions]);

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => {
      if (name === "district") {
        return { ...prev, district: value, districtRaw: "all" };
      }
      return { ...prev, [name]: value };
    });

    if (mapRef.current && userLocation) {
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(12);
    }
  };

  if (loadError) return <div style={{ color: "red" }}>Error loading Google Maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Store Map</h2>
      </div>

      <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />
      <button className="btn btn-primary btn-lg mt-2" onClick={handleReset}>
        Reset
      </button>

      <div style={{ margin: "0.5rem 0" }} className="desktop-only">
        <StoreCount count={filteredStores.length} />
      </div>

      <div className="map-container">
        <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={userLocation} zoom={12} onLoad={onMapLoad}>
          {filteredStores.map((store) => {
            let iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

            if (filterValues.campaign !== "all") {
              const cs = campaignStores.find(
                (cs) =>
                  String(cs.campaign_id) === String(filterValues.campaign) &&
                  String(cs.store_id) === String(store.id)
              );

              if (cs?.is_done) {
                iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
              }
            }

            return (
              <Marker
                key={store.id}
                position={{ lat: Number(store.latitude), lng: Number(store.longitude) }}
                icon={{ url: iconUrl, scaledSize: new window.google.maps.Size(24, 24) }}
                onClick={() => setSelectedStore(store)}
              />
            );
          })}

          {selectedStore && (
            <InfoWindow
              position={{ lat: Number(selectedStore.latitude), lng: Number(selectedStore.longitude) }}
              onCloseClick={() => setSelectedStore(null)}
            >
              <div className="map-popup">
                <h3>{selectedStore.store_code}</h3>
                <p className="address">{selectedStore.address}</p>
                <p className="board-name">BOARD: {selectedStore.board_name}</p>
                <a
                  href={`https://maps.google.com/?q=${selectedStore.latitude},${selectedStore.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View on Google Maps
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

export default memo(StoreMapPage);
