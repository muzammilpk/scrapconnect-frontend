import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

function BuyerDashboard() {
  usePageTitle('Buyer Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState(user?.serviceRegions || []);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [localScraps, setLocalScraps] = useState([]);
  const [availableCount, setAvailableCount] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingRegions(true);
      try {
        const [regionsRes, scrapsRes, notifRes, convsRes, dealsRes] = await Promise.all([
          api.getServiceRegions(),
          api.getMarketplaceScraps({ myRegionsOnly: 'true', limit: 3 }),
          api.getUnreadNotificationCount(),
          api.getConversations(),
          api.getUserDeals(),
        ]);

        if (regionsRes.success) {
          setRegions(regionsRes.data || regionsRes.serviceRegions || []);
        }
        if (scrapsRes.success) {
          setAvailableCount(scrapsRes.pagination?.total ?? scrapsRes.totalListings ?? 0);
          setLocalScraps(scrapsRes.data || scrapsRes.scraps || []);
        }
        if (notifRes.success) {
          setUnreadNotifCount(notifRes.unreadCount || 0);
        }
        if (convsRes.success) {
          setConversations(convsRes.conversations || []);
        }
        if (dealsRes.success) {
          setDeals(dealsRes.deals || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoadingRegions(false);
      }
    };

    loadData();
  }, []);

  const city = user?.location?.city;
  const district = user?.location?.district;
  const state = user?.location?.state;
  const locationDisplay = city || district
    ? `${city ? city + ', ' : ''}${district ? district : ''}${state ? ' (' + state + ')' : ''}`
    : 'Location not set yet';

  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Buyer Dashboard</h1>
          <p className="welcome-sub">
            Welcome back, <strong>{user?.name}</strong>
          </p>

          {/* Location Bar */}
          <div className="location-summary-card">
            <div className="location-summary-header">
              <span className="location-summary-icon">📍</span>
              <div>
                <div className="location-summary-label">Primary Operating Location:</div>
                <div className="location-summary-value">{locationDisplay}</div>
              </div>
            </div>
            {(!district && !city) ? (
              <button className="btn-primary btn-sm" onClick={() => navigate('/profile/edit')}>
                Set Location →
              </button>
            ) : (
              <button className="btn-secondary btn-sm" onClick={() => navigate('/profile/edit')}>
                Edit Region
              </button>
            )}
          </div>

          {/* BUYER DASHBOARD SUMMARY CARDS GRID */}
          <div className="buyer-dashboard-grid">
            {/* 1. Available Scrap Marketplace Card */}
            <div className="buyer-summary-card highlight-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">Region Scrap Marketplace</h3>
                  <p className="summary-card-sub">Local scrap listed in your operating area</p>
                </div>
              </div>
              <div className="summary-card-body">
                <div className="summary-stat-large">
                  {availableCount !== null ? `${availableCount} In My Region` : 'Explore Listings'}
                </div>
                <button className="btn-primary btn-full" onClick={() => navigate('/buyer/browse')}>
                  🔍 Browse Local Scrap
                </button>
              </div>
            </div>

            {/* 2. My Service Regions Card */}
            <div className="buyer-summary-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">My Service Regions</h3>
                  <p className="summary-card-sub">Your operating scrap collection areas</p>
                </div>
                <span className="summary-count-badge">
                  {loadingRegions ? '...' : `${regions.length} ${regions.length === 1 ? 'Region' : 'Regions'}`}
                </span>
              </div>
              <div className="summary-card-body">
                {regions.length > 0 ? (
                  <ul className="summary-regions-list">
                    {regions.slice(0, 4).map((reg) => (
                      <li key={reg._id} className="summary-region-item">
                        <span className="bullet-dot">🟢</span>
                        <strong>{reg.area ? `${reg.area}, ` : ''}{reg.city || reg.district}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="summary-empty">No service regions added yet.</div>
                )}
                <button
                  className="btn-secondary btn-full"
                  onClick={() => navigate('/buyer/service-regions')}
                  style={{ marginTop: '1rem' }}
                >
                  Manage Service Regions
                </button>
              </div>
            </div>

            {/* 3. Notifications Summary Card */}
            <div className="buyer-summary-card">
              <div className="summary-card-header">
                <div>
                  <h3 className="summary-card-title">Scrap Alerts</h3>
                  <p className="summary-card-sub">Nearby matching scrap listings</p>
                </div>
                {unreadNotifCount > 0 && <span className="status-badge available">{unreadNotifCount} UNREAD</span>}
              </div>
              <div className="summary-card-body">
                <div className="summary-stat-large" style={{ fontSize: '1.25rem' }}>
                  {unreadNotifCount > 0
                    ? `🔔 ${unreadNotifCount} new alert${unreadNotifCount > 1 ? 's' : ''}`
                    : '🔔 No unread alerts'}
                </div>
                <button
                  className="btn-secondary btn-full"
                  onClick={() => navigate('/notifications')}
                  style={{ marginTop: '1rem' }}
                >
                  View Notifications
                </button>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID FOR MESSAGES & DEALS OVERVIEW */}
          <div className="dashboard-sections-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
            {/* Recent Messages Card */}
            <div className="summary-card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div className="summary-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="summary-card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 Active Conversations & Offers
                  {unreadChatCount > 0 && <span className="unread-dot-badge">{unreadChatCount} NEW</span>}
                </h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/conversations')}>
                  Messages ({conversations.length})
                </button>
              </div>

              {conversations.length === 0 ? (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', color: '#64748B' }}>
                  💬 No active chats yet.
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>Browse marketplace and click "Contact Seller" to start negotiating scrap price.</span>
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
                          📦 {conv.scrap?.title || 'Scrap Item'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Seller: {conv.seller?.name || 'Seller'}
                        </div>
                      </div>
                      <button className="btn-primary btn-sm">Open Chat 💬</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Deals Card */}
            <div className="summary-card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div className="summary-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="summary-card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🤝 Purchased Scrap Deals
                </h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/deals')}>
                  My Deals ({deals.length})
                </button>
              </div>

              {deals.length === 0 ? (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', color: '#64748B' }}>
                  🤝 No scrap deals yet.
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>When a seller accepts your price offer, agreed deals appear here.</span>
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
                          Seller: {deal.seller?.name || 'Seller'} • Status: {deal.status}
                        </div>
                      </div>
                      <button className="btn-secondary btn-sm">Details ➔</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyerDashboard;
