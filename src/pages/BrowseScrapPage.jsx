import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ScrapCard from '../components/ScrapCard';

const SCRAP_CATEGORIES = [
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

function BrowseScrapPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter & Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Pagination States
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
        category: category !== 'All Categories' ? category : '',
        district: district.trim(),
        city: city.trim(),
        state: stateName.trim(),
        sort,
        page,
        limit,
      };

      const res = await api.getMarketplaceScraps(params);
      if (res.success) {
        setScraps(res.scraps || []);
        setPage(res.page || 1);
        setTotalPages(res.totalPages || 1);
        setTotalListings(res.totalListings || 0);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load scrap marketplace listings.');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, category, district, city, stateName, sort, page, limit]);

  useEffect(() => {
    fetchScraps();
  }, [fetchScraps]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCategory('All Categories');
    setDistrict('');
    setCity('');
    setStateName('');
    setSort('newest');
    setPage(1);
  };

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
            <p className="welcome-sub">Discover available scrap materials offered by verified sellers</p>
          </div>

          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          {/* SEARCH & FILTERS BAR */}
          <div className="marketplace-filter-card">
            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit} className="search-bar-row">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by title, category, or description (e.g. plastic, iron, paper)..."
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
            </form>

            {/* Filter Dropdowns Grid */}
            <div className="filter-controls-grid">
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  className="form-input form-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  {SCRAP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">District</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter district..."
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">City / Town</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter city..."
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  className="form-input form-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="weight_asc">Weight: Low to High</option>
                  <option value="weight_desc">Weight: High to Low</option>
                </select>
              </div>
            </div>

            {/* Reset Filters Option */}
            {(activeSearch || category !== 'All Categories' || district || city || stateName || sort !== 'newest') && (
              <div className="reset-filters-row">
                <span className="active-filter-summary">
                  Showing results for {totalListings} {totalListings === 1 ? 'listing' : 'listings'}
                </span>
                <button className="btn-link-sm" onClick={handleClearSearch}>
                  🔄 Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* MARKETPLACE LISTINGS GRID */}
          {loading ? (
            <div className="loading-card">Loading scrap marketplace...</div>
          ) : scraps.length === 0 ? (
            <div className="empty-listings-card">
              <div className="empty-icon">🔍</div>
              <h3>No Available Scrap Listings Found</h3>
              <p>Try searching for a different keyword or adjusting your category/location filters.</p>
              <button className="btn-secondary" onClick={handleClearSearch} style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          ) : (
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
