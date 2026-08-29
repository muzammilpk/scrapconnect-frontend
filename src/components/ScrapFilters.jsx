import { useState, useEffect } from 'react';

const CATEGORIES = [
  'All Categories',
  'Paper',
  'Books',
  'Plastic',
  'Metal',
  'Iron',
  'Copper',
  'Aluminium',
  'Cardboard',
  'Bottles',
  'E-Waste',
  'Other',
];

function ScrapFilters({ filters, onApply, onClear }) {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || 'All Categories',
    state: filters.state || '',
    district: filters.district || '',
    city: filters.city || '',
    area: filters.area || '',
    pincode: filters.pincode || '',
    minWeight: filters.minWeight || '',
    maxWeight: filters.maxWeight || '',
  });

  useEffect(() => {
    setLocalFilters({
      category: filters.category || 'All Categories',
      state: filters.state || '',
      district: filters.district || '',
      city: filters.city || '',
      area: filters.area || '',
      pincode: filters.pincode || '',
      minWeight: filters.minWeight || '',
      maxWeight: filters.maxWeight || '',
    });
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      category: 'All Categories',
      state: '',
      district: '',
      city: '',
      area: '',
      pincode: '',
      minWeight: '',
      maxWeight: '',
    };
    setLocalFilters(emptyFilters);
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="scrap-filters-form">
      <div className="filter-panel-grid">
        {/* Category */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            name="category"
            className="form-input form-select"
            value={localFilters.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="filter-group">
          <label className="filter-label">State</label>
          <input
            type="text"
            name="state"
            className="form-input"
            placeholder="e.g. Kerala"
            value={localFilters.state}
            onChange={handleChange}
          />
        </div>

        {/* District */}
        <div className="filter-group">
          <label className="filter-label">District</label>
          <input
            type="text"
            name="district"
            className="form-input"
            placeholder="e.g. Kottayam"
            value={localFilters.district}
            onChange={handleChange}
          />
        </div>

        {/* City */}
        <div className="filter-group">
          <label className="filter-label">City</label>
          <input
            type="text"
            name="city"
            className="form-input"
            placeholder="e.g. Pala"
            value={localFilters.city}
            onChange={handleChange}
          />
        </div>

        {/* Area */}
        <div className="filter-group">
          <label className="filter-label">Area</label>
          <input
            type="text"
            name="area"
            className="form-input"
            placeholder="e.g. Town Center"
            value={localFilters.area}
            onChange={handleChange}
          />
        </div>

        {/* Pincode */}
        <div className="filter-group">
          <label className="filter-label">Pincode</label>
          <input
            type="text"
            name="pincode"
            className="form-input"
            placeholder="e.g. 686575"
            value={localFilters.pincode}
            onChange={handleChange}
          />
        </div>

        {/* Minimum Weight */}
        <div className="filter-group">
          <label className="filter-label">Min Weight (kg)</label>
          <input
            type="number"
            name="minWeight"
            step="0.1"
            min="0"
            className="form-input"
            placeholder="e.g. 5"
            value={localFilters.minWeight}
            onChange={handleChange}
          />
        </div>

        {/* Maximum Weight */}
        <div className="filter-group">
          <label className="filter-label">Max Weight (kg)</label>
          <input
            type="number"
            name="maxWeight"
            step="0.1"
            min="0"
            className="form-input"
            placeholder="e.g. 100"
            value={localFilters.maxWeight}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Filter Action Buttons */}
      <div className="filter-actions-row">
        <button type="submit" className="btn-primary btn-sm">
          ⚡ Apply Filters
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={handleReset}>
          🔄 Clear Filters
        </button>
      </div>
    </form>
  );
}

export default ScrapFilters;
