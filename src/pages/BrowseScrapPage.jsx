import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ScrapCard from '../components/ScrapCard';
import ScrapFilters from '../components/ScrapFilters';
import ScrapCardSkeleton from '../components/ScrapCardSkeleton';

function BrowseScrapPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    state: '',
    district: '',
    city: '',
    area: '',
    pincode: '',
    minWeight: '',
    maxWeight: '',
  });
  const [sort, setSort] = useState('newest');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);

  const fetchScraps = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const params = {
        search: activeSearch,
        category: filters.category !== 'All Categories' ? filters.category : '',
        state: filters.state.trim(),
        district: filters.district.trim(),
        city: filters.city.trim(),
        area: filters.area.trim(),
        pincode: filters.pincode.trim(),
        minWeight: filters.minWeight,
        maxWeight: filters.maxWeight,
        sort,
        page,
        limit,
      };

      const res = await api.getMarketplaceScraps(params);
      if (res.success) {
        setScraps(res.data || res.scraps || []);
        setPage(res.pagination?.page || res.page || 1);
        setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
        setTotalListings(res.pagination?.total || res.totalListings || 0);
      }
    } catch (err) {
      console.error('Marketplace API error:', err);
      setErrorMsg('Unable to load scrap listings.');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, filters, sort, page, limit]);

  useEffect(() => {
    fetchScraps();
  }, [fetchScraps]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const handleApplyFilters = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveSearch('');
    setFilters({
      category: 'All Categories',
      state: '',
      district: '',
      city: '',
      area: '',
      pincode: '',
      minWeight: '',
      maxWeight: '',
    });
    setSort('newest');
    setPage(1);
  };

  const removeFilterTag = (key) => {
    setPage(1);
    if (key === 'search') {
      setSearchQuery('');
      setActiveSearch('');
    } else if (key === 'category') {
      setFilters((prev) => ({ ...prev, category: 'All Categories' }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // Helper to collect active filter tags
  const activeTags = [];
  if (activeSearch) activeTags.push({ key: 'search', label: `Search: "${activeSearch}"` });
  if (filters.category && filters.category !== 'All Categories') activeTags.push({ key: 'category', label: filters.category });
  if (filters.state) activeTags.push({ key: 'state', label: `State: ${filters.state}` });
  if (filters.district) activeTags.push({ key: 'district', label: `District: ${filters.district}` });
  if (filters.city) activeTags.push({ key: 'city', label: `City: ${filters.city}` });
  if (filters.area) activeTags.push({ key: 'area', label: `Area: ${filters.area}` });
  if (filters.pincode) activeTags.push({ key: 'pincode', label: `Pincode: ${filters.pincode}` });
  if (filters.minWeight) activeTags.push({ key: 'minWeight', label: `Min: ${filters.minWeight}kg` });
  if (filters.maxWeight) activeTags.push({ key: 'maxWeight', label: `Max: ${filters.maxWeight}kg` });

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/buyer/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/buyer/dashboard')}>
            ← Dashboard
          </button>
          <button className="btn-secondary" onClick={() => navigate('/buyer/service-regions')}>
            📍 Service Regions
          </button>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              Buyer 🛒
            </span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="marketplace-wrapper">
          <div className="marketplace-header">
            <h1 className="welcome-title">Browse Scrap Marketplace</h1>
            <p className="welcome-sub">Discover available scrap materials offered by verified local sellers</p>
          </div>

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="marketplace-filter-card">
            {/* Search Bar Row */}
            <form onSubmit={handleSearchSubmit} className="search-bar-row">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search scrap, category or item (e.g. plastic, iron, paper)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveSearch('');
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary search-submit-btn">
                Search
              </button>
              <button
                type="button"
                className={`btn-secondary filter-toggle-btn ${showFilterPanel ? 'active' : ''}`}
                onClick={() => setShowFilterPanel((prev) => !prev)}
              >
                ⚙️ Filters {activeTags.length > 0 ? `(${activeTags.length})` : ''}
              </button>
            </form>

            {/* Expandable Advanced Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel-wrapper" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <ScrapFilters filters={filters} onApply={handleApplyFilters} onClear={handleClearFilters} />
              </div>
            )}

            {/* Quick Sort & Active Filter Tags Bar */}
            <div className="marketplace-toolbar-row">
              {/* Left: Active Filter Chips */}
              <div className="active-filters-chips">
                {activeTags.length > 0 ? (
                  <>
                    <span className="filter-chips-label">Filters:</span>
                    {activeTags.map((tag) => (
                      <span key={tag.key} className="filter-chip">
                        {tag.label}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() => removeFilterTag(tag.key)}
                          title="Remove filter"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button type="button" className="btn-link-sm" onClick={handleClearFilters} style={{ marginLeft: '0.5rem' }}>
                      Clear All
                    </button>
                  </>
                ) : (
                  <span className="filter-chips-label text-muted">No active filters applied</span>
                )}
              </div>

              {/* Right: Sort By Dropdown */}
              <div className="sort-dropdown-wrapper">
                <label className="filter-label" htmlFor="sortBySelect" style={{ marginRight: '0.5rem', marginBottom: 0 }}>
                  Sort By:
                </label>
                <select
                  id="sortBySelect"
                  className="form-input form-select sort-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="weight_low">Weight: Low to High</option>
                  <option value="weight_high">Weight: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEARCH RESULTS COUNT HEADER */}
          {!loading && !errorMsg && (
            <div className="results-count-bar">
              <h3>
                {totalListings} scrap listing{totalListings !== 1 ? 's' : ''} found
              </h3>
            </div>
          )}

          {/* ERROR STATE */}
          {errorMsg ? (
            <div className="empty-listings-card alert-error-box">
              <div className="empty-icon">⚠️</div>
              <h3>Unable to load scrap listings.</h3>
              <p>There was a problem communicating with the marketplace server.</p>
              <button className="btn-primary" onClick={fetchScraps} style={{ marginTop: '1rem' }}>
                Try Again
              </button>
            </div>
          ) : loading ? (
            /* LOADING SKELETON STATE */
            <div className="scraps-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ScrapCardSkeleton key={idx} />
              ))}
            </div>
          ) : scraps.length === 0 ? (
            /* NO RESULTS STATE */
            <div className="empty-listings-card">
              <div className="empty-icon">🔍</div>
              <h3>No scrap listings found.</h3>
              <p>Try changing your search or filters.</p>
              <button className="btn-primary" onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            /* SCRAP LISTINGS GRID */
            <>
              <div className="scraps-grid">
                {scraps.map((scrap) => (
                  <ScrapCard key={scrap._id} scrap={scrap} detailPath={`/buyer/scraps/${scrap._id}`} />
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`page-num-btn ${page === pageNum ? 'active' : ''}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default BrowseScrapPage;
