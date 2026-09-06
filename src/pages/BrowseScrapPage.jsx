import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';
import ScrapCard from '../components/ScrapCard';
import ScrapFilters from '../components/ScrapFilters';
import ScrapCardSkeleton from '../components/ScrapCardSkeleton';

function BrowseScrapPage() {
  usePageTitle('Marketplace');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasNoServiceRegions, setHasNoServiceRegions] = useState(false);

  // Region filter mode: 'my_regions' (default for buyers) or 'all_regions'
  const [regionFilterMode, setRegionFilterMode] = useState(
    user?.role === 'buyer' ? 'my_regions' : 'all_regions'
  );

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
    setHasNoServiceRegions(false);

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
        myRegionsOnly: regionFilterMode === 'my_regions' ? 'true' : 'false',
        page,
        limit,
      };

      const res = await api.getMarketplaceScraps(params);
      if (res.success) {
        setScraps(res.data || res.scraps || []);
        setPage(res.pagination?.page || res.page || 1);
        setTotalPages(res.pagination?.totalPages || res.totalPages || 1);
        setTotalListings(res.pagination?.total || res.totalListings || 0);
        setHasNoServiceRegions(Boolean(res.hasNoServiceRegions));
      }
    } catch (err) {
      console.error('Marketplace API error:', err);
      setErrorMsg('Unable to load scrap listings.');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, filters, sort, regionFilterMode, page, limit]);

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
    } else if (key === 'my_regions') {
      setRegionFilterMode('all_regions');
    } else {
      setFilters((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // Helper to collect active filter tags
  const activeTags = [];
  if (regionFilterMode === 'my_regions') activeTags.push({ key: 'my_regions', label: '🎯 Scope: My Operating Regions' });
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
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="marketplace-wrapper">
          <div className="marketplace-header">
            <h1 className="welcome-title">Browse Scrap Marketplace</h1>
            <p className="welcome-sub">Discover available scrap materials offered by verified local sellers</p>
          </div>

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="marketplace-filter-card">
            {/* REGION SCOPE TOGGLE BAR (MY REGIONS vs ALL REGIONS) */}
            {user?.role === 'buyer' && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Marketplace Scope:
                </span>

                <button
                  type="button"
                  onClick={() => { setPage(1); setRegionFilterMode('my_regions'); }}
                  style={{
                    background: regionFilterMode === 'my_regions' ? '#166534' : '#FFFFFF',
                    color: regionFilterMode === 'my_regions' ? '#FFFFFF' : '#334155',
                    border: regionFilterMode === 'my_regions' ? '1px solid #166534' : '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: regionFilterMode === 'my_regions' ? '0 2px 4px rgba(22, 101, 52, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🎯 My Operating Regions ({user?.location?.district || user?.serviceRegions?.[0]?.district || 'Configured Regions'})
                </button>

                <button
                  type="button"
                  onClick={() => { setPage(1); setRegionFilterMode('all_regions'); }}
                  style={{
                    background: regionFilterMode === 'all_regions' ? '#0F172A' : '#FFFFFF',
                    color: regionFilterMode === 'all_regions' ? '#FFFFFF' : '#334155',
                    border: regionFilterMode === 'all_regions' ? '1px solid #0F172A' : '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: regionFilterMode === 'all_regions' ? '0 2px 4px rgba(15, 23, 42, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🌐 All Regions (Nationwide)
                </button>
              </div>
            )}

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
          ) : hasNoServiceRegions ? (
            /* NO SERVICE REGIONS CONFIGURED STATE */
            <div className="empty-listings-card" style={{ border: '2px dashed #F59E0B', background: '#FFFBEB' }}>
              <div className="empty-icon">📍</div>
              <h3 style={{ color: '#B45309' }}>No Service Regions Selected</h3>
              <p style={{ color: '#92400E', maxWidth: '500px', margin: '0.5rem auto' }}>
                Please select the places where you are willing and able to collect scrap to see relevant listings in your service areas.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/buyer/service-regions')}
                style={{ marginTop: '1rem', background: '#D97706', borderColor: '#B45309' }}
              >
                ➕ Set Service Regions
              </button>
            </div>
          ) : scraps.length === 0 ? (
            /* NO MATCHING SCRAPS IN REGIONS STATE */
            <div className="empty-listings-card">
              <div className="empty-icon">🔍</div>
              <h3>No scrap available in your selected service regions</h3>
              <p>Try adding another service region or clearing search/category filters.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={() => navigate('/buyer/service-regions')}>
                  📍 Manage Service Regions
                </button>
                <button className="btn-secondary" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
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
