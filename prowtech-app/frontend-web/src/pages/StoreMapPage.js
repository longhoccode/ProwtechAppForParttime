import React, { memo, useState, useMemo, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from "@react-google-maps/api";
import MapFilters from "../components/MapFilters";
import api from "../services/api";
import { provinces, districtMap } from "../constants/locationData";  // 👈 import sẵn

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };

function StoreMapPage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [stores, setStores] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStores, setCampaignStores] = useState([]);

  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedDistrictRaw, setSelectedDistrictRaw] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const mapRef = useRef(null);

  // Fetch data (chỉ còn store + campaign + campaign-store)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStores = await api.get("/stores");
        setStores(resStores.data.data);

        const resCampaigns = await api.get("/campaigns");
        const campaignData = resCampaigns.data?.data || resCampaigns.data || [];
        setCampaigns(campaignData);

        const resCampaignStores = await api.get("/campaign-stores");
        setCampaignStores(resCampaignStores.data.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchData();
  }, []);

  const onMapLoad = (map) => { mapRef.current = map; };

  const handleReset = () => {
    setSelectedBoard("all");
    setSelectedDistrict("all");
    setSelectedDistrictRaw("all");
    setSelectedCampaign("all");
    setSelectedStore(null);
    if (mapRef.current) {
      mapRef.current.setCenter(DEFAULT_CENTER);
      mapRef.current.setZoom(12);
    }
  };

  const boardOptions = useMemo(
    () => (stores?.length ? [...new Set(stores.map((s) => s.board_name))].sort() : []),
    [stores]
  );

  const districtRawOptions = selectedDistrict !== "all" ? districtMap[selectedDistrict] || [] : [];

  const filteredStores = useMemo(() => {
    return (stores || []).filter((store) => {
      const boardMatch = selectedBoard === "all" || store.board_name === selectedBoard;
      const districtMatch =
        selectedDistrict === "all" || store.district === selectedDistrict; // 👈 so sánh trực tiếp
      const districtRawMatch =
        selectedDistrictRaw === "all" || store.district_raw === selectedDistrictRaw;
      const campaignMatch =
        selectedCampaign === "all" ||
        campaignStores.some(
          (cs) =>
            String(cs.campaign_id) === String(selectedCampaign) &&
            String(cs.store_id) === String(store.id)
        );
      return boardMatch && districtMatch && districtRawMatch && campaignMatch;
    });
  }, [stores, selectedBoard, selectedDistrict, selectedDistrictRaw, selectedCampaign, campaignStores]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Store Map</h2>
      </div>

      {/* Filters */}
      <div>
        <MapFilters
          selectedBoard={selectedBoard}
          setSelectedBoard={setSelectedBoard}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedDistrictRaw={selectedDistrictRaw}
          setSelectedDistrictRaw={setSelectedDistrictRaw}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          boardOptions={boardOptions}
          districts={provinces}  // 👈 dùng constants
          districtRawOptions={districtRawOptions}
          campaigns={campaigns}
          handleReset={handleReset}
        />
      </div>

      {/* Map */}
      <div className="map-container">
        <GoogleMap
          mapContainerClassName="google-map"
          center={DEFAULT_CENTER}
          zoom={12}
          onLoad={onMapLoad}
        >
          {filteredStores.map((store) => (
            <Marker
              key={store.id}
              position={{ lat: Number(store.latitude), lng: Number(store.longitude) }}
              onClick={() => setSelectedStore(store)}
            />
          ))}

          {selectedStore && (
            <InfoWindow
              position={{
                lat: Number(selectedStore.latitude),
                lng: Number(selectedStore.longitude),
              }}
              onCloseClick={() => setSelectedStore(null)}
            >
              <div className="map-popup">
                <h3>{selectedStore.store_code || selectedStore.name}</h3>
                <p>{selectedStore.address}</p>
                <p><b>Board:</b> {selectedStore.board_name}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

export default memo(StoreMapPage);
