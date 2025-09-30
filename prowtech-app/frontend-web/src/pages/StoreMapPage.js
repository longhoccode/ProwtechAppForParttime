import React, { memo, useState, useMemo, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from "@react-google-maps/api";
import FilterBar from "../components/FilterBar";
import api from "../services/api";
import { provinces, districtMap } from "../constants/locationData";

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };
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
    // EFFECT 1: Lấy Vị trí Người dùng (Geolocation)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(newLocation);
                    // Tùy chọn: Dịch chuyển bản đồ đến vị trí người dùng ngay khi tải
                    if (mapRef.current) {
                        mapRef.current.setCenter(newLocation);
                        mapRef.current.setZoom(14); 
                    }
                },
                (error) => {
                    // Nếu người dùng từ chối hoặc có lỗi, giữ lại DEFAULT_CENTER
                    console.warn("Geolocation denied or error:", error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    }, [isLoaded]); // Chạy sau khi Maps API được giả định là tải xong

  // Fetch data
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
    if (mapRef.current) {
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(12);
    }
  };

  const boardOptions = useMemo(() => [...new Set(stores.map((s) => s.board_name))].sort(), [stores]);

  // Build filters dynamically
  const filters = useMemo(() => {
    const baseFilters = [
      { name: "board", label: "Chain", type: "select", options: ["Tất cả", ...boardOptions] },
      {
        name: "campaign",
        label: "Campaign",
        type: "select",
        options: [{ value: "all", label: "Tất cả" }, ...campaigns.map(c => ({ value: c.id, label: c.name }))],
      },
      {
        name: "district",
        label: "Provinces",
        type: "select",
        options: [{ value: "all", label: "Tất cả" }, ...provinces.map(p => ({ value: p.value, label: p.label }))],
      },
    ];

    // Quận/Huyện chỉ hiện khi đã chọn tỉnh
    if (filterValues.district !== "all") {
      baseFilters.push({
        name: "districtRaw",
        label: "District",
        type: "select",
        options: [
          { value: "all", label: "Tất cả" },
          ...(districtMap[filterValues.district]?.map(d => ({ value: d.value, label: d.label })) || []),
        ],
      });
    }

    return baseFilters;
  }, [boardOptions, campaigns, filterValues.district]);

  const handleFilterChange = (name, value) => {
    setFilterValues(prev => {
      if (name === "district") return { ...prev, district: value, districtRaw: "all" };
      return { ...prev, [name]: value };
    });

    // Sau khi đổi filter, reset map về vị trí người dùng
    if (mapRef.current && userLocation) {
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(12);
    }
  };


  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const boardMatch = filterValues.board === "all" || store.board_name === filterValues.board;
      const districtMatch = filterValues.district === "all" || store.district === filterValues.district;
      const districtRawMatch = filterValues.districtRaw === "all" || store.district_raw === filterValues.districtRaw;
      const campaignMatch =
        filterValues.campaign === "all" ||
        campaignStores.some(
          cs => String(cs.campaign_id) === String(filterValues.campaign) && String(cs.store_id) === String(store.id)
        );
      return boardMatch && districtMatch && districtRawMatch && campaignMatch;
    });
  }, [stores, filterValues, campaignStores]);

  if (loadError) return <div style={{ color: "red" }}>Error loading Google Maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Store Map</h2>
      </div>

      <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />
      <button className="btn btn-primary btn-lg mt-2" onClick={handleReset}>Reset</button>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={userLocation}
          zoom={12}
          onLoad={onMapLoad}
        >
          {filteredStores.map(store => (
            <Marker
              key={store.id}
              position={{ lat: Number(store.latitude), lng: Number(store.longitude) }}
              onClick={() => setSelectedStore(store)}
            />
          ))}

          {selectedStore && (
            <InfoWindow
              position={{ lat: Number(selectedStore.latitude), lng: Number(selectedStore.longitude) }}
              onCloseClick={() => setSelectedStore(null)}
            >
            <div className="map-popup">
              {/* The Store Code as the primary title/identifier */}
              <h3>{selectedStore.store_code}</h3>
              
              {/* Store Details */}
              <p className="address">{selectedStore.address}</p>
              <p className="board-name">BOARD: {selectedStore.board_name}</p>

              {/* Corrected Google Maps Link and Button */}
              <a 
                href={`https://maps.google.com/?q=${selectedStore.latitude},${selectedStore.longitude}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`View ${selectedStore.store_code} on Google Maps`}
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
