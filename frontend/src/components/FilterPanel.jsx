import React from 'react';

const FilterPanel = ({ filters, filterOptions, onFilterChange }) => {
  // Map filter keys to their option arrays from the API
  const optionMapping = {
    month: filterOptions?.months || [],
    origin: filterOptions?.airports || [],
    destination: filterOptions?.airports || [],
    airport: filterOptions?.airports || [],
    route: filterOptions?.routes || [],
    status: filterOptions?.statuses || [],
    baseStation: filterOptions?.baseStations || [],
  };

  // Friendly labels
  const labelMap = {
    month: 'Month',
    origin: 'Origin Airport',
    destination: 'Dest Airport',
    airport: 'Airport',
    route: 'Route',
    status: 'Status',
    baseStation: 'Base Station',
  };

  return (
    <div className="filter-panel">
      {Object.keys(filters).map((key) => (
        <div key={key} className="filter-group">
          <label>{labelMap[key] || key}</label>
          <select
            value={filters[key]}
            onChange={(e) => onFilterChange(key, e.target.value)}
          >
            <option value="All">All</option>
            {(optionMapping[key] || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;
