import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

function MyDealsPage() {
  usePageTitle('My Deals');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDeals = async (statusFilter = '') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getUserDeals(statusFilter);
      if (res.success) {
        setDeals(res.deals || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filter = activeTab === 'all' ? '' : activeTab;
    fetchDeals(filter);
  }, [activeTab]);

  const getCounterpart = (deal) => {
    if (!deal || !user) return { name: 'User', role: '' };
    const isBuyer = (deal.buyer?._id || deal.buyer) === user._id;
    return isBuyer ? deal.seller : deal.buyer;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_confirmation':
        return <span className="status-badge status-pending">⏳ PENDING CONFIRMATION</span>;
      case 'confirmed':
        return <span className="status-badge status-accepted">✅ CONFIRMED</span>;
      case 'pickup_scheduled':
        return <span className="status-badge status-countered">🚚 PICKUP SCHEDULED</span>;
      case 'completed':
        return <span className="status-badge status-accepted">🎉 COMPLETED (SOLD)</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">❌ CANCELLED</span>;
      default:
        return <span className="status-badge">{status?.toUpperCase()}</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="deals-page-header">
          <div>
            <h1 className="dashboard-title">🤝 My Scrap Deals</h1>
            <p className="dashboard-subtitle">
              Manage your confirmed transactions, pickup schedules, and completed scrap purchases.
            </p>
          </div>
        </div>

        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

        {/* Tab Filters */}
        <div className="deal-tabs-bar">
          <button className={`deal-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All Deals
          </button>
          <button className={`deal-tab ${activeTab === 'pending_confirmation' ? 'active' : ''}`} onClick={() => setActiveTab('pending_confirmation')}>
            Pending Confirmation
          </button>
          <button className={`deal-tab ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>
            Confirmed
          </button>
          <button className={`deal-tab ${activeTab === 'pickup_scheduled' ? 'active' : ''}`} onClick={() => setActiveTab('pickup_scheduled')}>
            Pickup Scheduled
          </button>
          <button className={`deal-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
            Completed (Sold)
          </button>
          <button className={`deal-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
            Cancelled
          </button>
        </div>

        {/* Deals List Grid */}
        {loading ? (
          <div className="loading-card">Loading scrap deals...</div>
        ) : deals.length === 0 ? (
          <div className="empty-regions-card">
            <div className="empty-icon">🤝</div>
            <h3>No Deals Found</h3>
            <p>You don't have any deals matching this filter.</p>
            {user?.role === 'buyer' && (
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/buyer/marketplace')}>
                Browse Scrap Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="deals-grid">
            {deals.map((deal) => {
              const counterpart = getCounterpart(deal);
              const scrap = deal.scrap || {};

              return (
                <div key={deal._id} className="deal-card">
                  <div className="deal-card-header">
                    <div>
                      <h3 className="deal-scrap-title">{scrap.title || 'Scrap Listing'}</h3>
                      <p className="deal-scrap-meta">
                        {scrap.category || 'Scrap'} • {scrap.estimatedWeight} {scrap.weightUnit || 'kg'}
                      </p>
                    </div>
                    {getStatusBadge(deal.status)}
                  </div>

                  <div className="deal-card-body">
                    <div className="deal-price-box">
                      <span className="deal-price-label">Agreed Price</span>
                      <span className="deal-price-value">₹{deal.agreedPrice?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="deal-party-info">
                      <span className="party-role">{user?.role === 'buyer' ? 'Seller' : 'Buyer'}:</span>
                      <span className="party-name">{counterpart.name || 'User'}</span>
                      {counterpart.phone && <span className="party-phone">📞 {counterpart.phone}</span>}
                    </div>

                    {scrap.location && (
                      <p className="deal-location-text">
                        📍 {scrap.location.city}, {scrap.location.district}, {scrap.location.state}
                      </p>
                    )}
                  </div>

                  <div className="deal-card-footer">
                    <span className="deal-date-sub">
                      Created: {new Date(deal.createdAt).toLocaleDateString()}
                    </span>
                    <button className="btn-primary btn-sm" onClick={() => navigate(`/deals/${deal._id}`)}>
                      View Deal Details ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyDealsPage;
