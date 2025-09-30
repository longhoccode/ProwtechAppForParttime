// src/components/FilterBar.jsx
import React from "react";

function FilterBar({ filters, values, onChange, onReset }) {
  return (
    <div className="filter">
      <div className="filter-bar">
        {filters.map((filter) => (
          <div className="filter-item" key={filter.name}>
            <label htmlFor={filter.name}>{filter.label}</label>
            {filter.type === "select" ? (
              <select
                id={filter.name}
                className="filter-value"
                value={values[filter.name] || "all"}
                onChange={(e) => onChange(filter.name, e.target.value)}
              >
                {filter.options?.map((opt) =>
                  typeof opt === "string" ? (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ) : (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )
                )}
              </select>
            ) : filter.type === "text" ? (
              <input
                id={filter.name}
                type="text"
                className="filter-value"
                placeholder={filter.placeholder || ""}
                value={values[filter.name] || ""}
                onChange={(e) => onChange(filter.name, e.target.value)}
              />
            ) : null}
          </div>
        ))}
      </div>
      {onReset && (
        <button className="btn btn-primary btn-lg" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}

export default FilterBar;
