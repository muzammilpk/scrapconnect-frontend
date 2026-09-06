import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

function SellerDashboard() {
  usePageTitle('Seller Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scraps, setScraps] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    availableCount: 0,
    reservedCount: 0,
    soldCount: 0,
    draftCount: 0,
  });
  const [loadingScraps, setLoadingScraps] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    const loadScrapsAndOverview = async () => {
      setLoadingScraps(true);
      setLoadingExtras(true);
      try {
        const [scrapRes, convRes, dealRes] = await Promise.all([
          api.getMyScraps(),
          api.getConversations(),
          api.getUserDeals(),
        ]);

        if (scrapRes.success) {
          setScraps(scrapRes.scraps || []);
          if (scrapRes.stats) {
            setStats(scrapRes.stats);
          } else {
            const items = scrapRes.scraps || [];
            setStats({
              totalCount: items.length,
              availableCount: items.filter((s) => s.status === 'available').length,
              reservedCount: items.filter((s) => s.status === 'reserved').length,
              soldCount: items.filter((s) => s.status === 'sold').length,
              draftCount: items.filter((s) => s.status === 'draft').length,
            });
          }
        }

        if (convRes.success) {
          setConversations(convRes.conversations || []);
        }

        if (dealRes.success) {
          setDeals(dealRes.deals || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard overview data:', err.message);
      } finally {
        setLoadingScraps(false);
        setLoadingExtras(false);
      }
    };

    loadScrapsAndOverview();
  }, []);

  const area = user?.location?.area;
  const city = user?.location?.city;
  const locationDisplay = area || city ? `${area ? area : ''}${area && city ? ', ' : ''}${city ? city : ''}` : 'Location not set yet';

  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Seller Dashboard</h1>
          <p className="welcome-sub">
            Welcome back, <strong>{user?.name}</strong>
          </p>

          {/* Location Summary Card */}
          <div className="location-summary-card">
            <div className="location-summary-header">
              <span className="location-summary-icon">📍</span>
              <div>
                <div className="location-summary-label">Primary Location:</div>
                <div className="location-summary-value">{locationDisplay}</div>
              </div>
            </div>
            {(!area && !city) && (
              <button className="btn-link-sm" onClick={() => navigate('/profile')}>
                Update Location →
              </button>
            )}
          </div>

          {/* MY SCRAP LISTINGS SUMMARY CARD */}
          <div className="scrap-summary-card">
            <div className="summary-card-header">
              <h3 className="summary-card-title">📦 My Scrap Statistics</h3>
              <div className="summary-card-actions">
                <button className="btn-primary btn-sm" onClick={() => navigate('/seller/add-scrap')}>
                  ➕ Add Scrap
                </button>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/seller/scraps')}>
                  View My Listings
                </button>
              </div>
            </div>

            {loadingScraps ? (
              <div className="summary-loading">Loading scrap statistics...</div>
            ) : (
              <div className="scrap-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalCount}</div>
                  <div className="stat-label">Total</div>
                </div>

                <div className="stat-card available">
                  <div className="stat-value text-success">{stats.availableCount}</div>
                  <div className="stat-label">Available</div>
                </div>

                <div className="stat-card draft" style={{ background: '#FFFBEB' }}>
                  <div className="stat-value" style={{ color: '#D97706' }}>{stats.draftCount}</div>
                  <div className="stat-label">Drafts</div>
                </div>

                <div className="stat-card reserved">
                  <div className="stat-value text-warning">{stats.reservedCount}</div>
                  <div className="stat-label">Reserved</div>
                </div>

                <div className="stat-card sold">
                  <div className="stat-value text-muted">{stats.soldCount}</div>
                  <div className="stat-label">Sold</div>
                </div>
              </div>
            )}
          </div>

          {/* TWO COLUMN GRID FOR MESSAGES & DEALS OVERVIEW */}
          <div className="dashboard-sections-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
            {/* 1. Recent Messages & Price Offers Card */}
            <div className="summary-card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div className="summary-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="summary-card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 Recent Messages & Offers
                  {unreadChatCount > 0 && <span className="unread-dot-badge">{unreadChatCount} NEW</span>}
                </h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/conversations')}>
                  View All Messages ({conversations.length})
                </button>
              </div>

              {loadingExtras ? (
                <p className="text-muted">Loading messages...</p>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', color: '#64748B' }}>
                  💬 No buyer messages or offers received yet.
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>When buyers contact you from the Marketplace, messages will appear here.</span>
                </div>
              ) : (
                <div className="dashboard-convs-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {conversations.slice(0, 3).map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => navigate(`/chat/${conv._id}`)}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: conv.unreadCount > 0 ? '#F0FDF4' : '#F8FAFC',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1E293B' }}>
                          👤 {conv.buyer?.name || 'Buyer'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          📦 {conv.scrap?.title || 'Scrap Listing'}
                        </div>
                      </div>
                      <button className="btn-primary btn-sm">Chat 💬</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Active Deals Overview Card */}
            <div className="summary-card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div className="summary-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="summary-card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🤝 Active Scrap Deals
                </h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/deals')}>
                  View All Deals ({deals.length})
                </button>
              </div>

              {loadingExtras ? (
                <p className="text-muted">Loading deals...</p>
              ) : deals.length === 0 ? (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', color: '#64748B' }}>
                  🤝 No active scrap deals yet.
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>When you accept a buyer offer, agreed deals appear here for pickup scheduling.</span>
                </div>
              ) : (
                <div className="dashboard-deals-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {deals.slice(0, 3).map((deal) => (
                    <div
                      key={deal._id}
                      onClick={() => navigate(`/deals/${deal._id}`)}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: '#FFFFFF',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1E293B' }}>
                          📦 {deal.scrap?.title || 'Scrap'} — ₹{deal.agreedPrice?.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Buyer: {deal.buyer?.name || 'User'} • Status: {deal.status}
                        </div>
                      </div>
                      <button className="btn-secondary btn-sm">Details ➔</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="placeholder-notice" style={{ marginTop: '1.25rem' }}>
            📌 <strong>Seller Tip</strong> — Keep your profile location updated and respond to buyer enquiries promptly to close deals quickly.
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
