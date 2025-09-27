import React from "react";
import "../styles/components.css";

function MapFilters({
  selectedBoard, setSelectedBoard,
  selectedDistrict, setSelectedDistrict,
  selectedDistrictRaw, setSelectedDistrictRaw,
  selectedCampaign, setSelectedCampaign,
  boardOptions, districts, districtRawOptions,
  campaigns, handleReset
}) {
  return (
    <div className="filter-bar">
      {/* Filter Board */}
      <div className="filter-item">
        <label htmlFor="board-filter">Chuỗi:</label>
        <select
          id="board-filter"
          className="form-control"
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
        >
          <option value="all">Tất cả</option>
          {boardOptions.map((board) => (
            <option key={board} value={board}>
              {board}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Campaign */}
      <div className="filter-item">
        <label htmlFor="campaign-filter">Chiến dịch:</label>
        <select
          id="campaign-filter"
          className="form-control"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="all">Tất cả</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Province/City */}
      <div className="filter-item">
        <label htmlFor="province-filter">Tỉnh/Thành phố:</label>
        <select
          id="province-filter"
          className="form-control"
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setSelectedDistrictRaw("all");
          }}
        >
          <option value="all">Tất cả</option>
          {districts.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter District Raw */}
      {selectedDistrict !== "all" && (
        <div className="filter-item">
          <label htmlFor="district-filter">Quận/Huyện:</label>
          <select
            id="district-filter"
            className="form-control"
            value={selectedDistrictRaw}
            onChange={(e) => setSelectedDistrictRaw(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {districtRawOptions.map((raw) => (
              <option key={raw.value} value={raw.value}>
                {raw.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Reset */}
      <button className="btn btn-primary btn-lg" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}

export default MapFilters;
