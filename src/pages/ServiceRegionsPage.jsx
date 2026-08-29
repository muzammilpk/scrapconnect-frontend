import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ServiceRegionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null); // null if adding new
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    city: '',
    area: '',
    pincode: '',
  });

  // Delete Confirmation State
  const [deletingRegionId, setDeletingRegionId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch service regions
  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await api.getServiceRegions();
      if (res.success) {
        setRegions(res.serviceRegions || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load service regions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const openAddModal = () => {
    setEditingRegion(null);
    setFormData({
      state: 'Kerala',
      district: '',
      city: '',
      area: '',
      pincode: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (region) => {
    setEditingRegion(region);
    setFormData({
      state: region.state || '',
      district: region.district || '',
      city: region.city || '',
      area: region.area || '',
      pincode: region.pincode || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRegion(null);
    setErrorMsg('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.state.trim() || !formData.district.trim()) {
      setErrorMsg('State and District are required fields');
      return;
    }

    if (formData.pincode.trim()) {
      const pincodeRegex = /^[0-9]{5,10}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        setErrorMsg('Please enter a valid pincode (5 to 10 digits)');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        state: formData.state.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        pincode: formData.pincode.trim(),
      };

      if (editingRegion) {
        // Update existing region
        const res = await api.updateServiceRegion(editingRegion._id, payload);
        if (res.success) {
          setSuccessMsg('Service region updated successfully!');
          setRegions(res.data || res.serviceRegions || []);
          closeModal();
        }
      } else {
        // Add new region
        const res = await api.addServiceRegion(payload);
        if (res.success) {
          setSuccessMsg('New service region added successfully!');
          setRegions(res.data ? (Array.isArray(res.data) ? res.data : res.serviceRegions) : res.serviceRegions || []);
          closeModal();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save service region');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRegionId) return;
    setDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.deleteServiceRegion(deletingRegionId);
      if (res.success) {
        setSuccessMsg('Service region deleted successfully');
        setRegions(res.serviceRegions || []);
        setDeletingRegionId(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete service region');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/buyer/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/buyer/dashboard')}>
            ← Dashboard
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
        {/* Banner Messages */}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}
        {errorMsg && !isModalOpen && <div className="alert-error">⚠️ {errorMsg}</div>}

        <div className="regions-header">
          <div>
            <h1 className="welcome-title">My Service Regions</h1>
            <p className="welcome-sub">Areas where you collect scrap from sellers</p>
          </div>
          <button className="btn-primary add-region-btn" onClick={openAddModal}>
            ➕ Add New Region
          </button>
        </div>

        {loading ? (
          <div className="loading-card">Loading service regions...</div>
        ) : regions.length === 0 ? (
          <div className="empty-regions-card">
            <div className="empty-icon">📍</div>
            <h3>No Service Regions Added Yet</h3>
            <p>Define the cities, districts, and areas where you offer scrap collection services.</p>
            <button className="btn-primary" onClick={openAddModal} style={{ marginTop: '1rem' }}>
              + Add Your First Region
            </button>
          </div>
        ) : (
          <div className="regions-grid">
            {regions.map((reg) => (
              <div key={reg._id} className="region-card">
                <div className="region-card-body">
                  <div className="region-city-title">
                    {reg.area ? `${reg.area}, ` : ''}{reg.city || `${reg.district} (Entire District)`}
                  </div>
                  <div className="region-location-detail">
                    {reg.district && <span>{reg.district} District</span>}
                    {reg.state && <span> • {reg.state}</span>}
                  </div>
                  {reg.pincode && (
                    <div className="region-pincode">
                      📮 Pincode: <strong>{reg.pincode}</strong>
                    </div>
                  )}
                </div>

                <div className="region-card-actions">
                  <button className="btn-secondary btn-sm" onClick={() => openEditModal(reg)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-danger-link btn-sm"
                    onClick={() => setDeletingRegionId(reg._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD / EDIT REGION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingRegion ? '✏️ Edit Service Region' : '➕ Add Service Region'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State <span className="required-star">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Kerala"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="district">
                    District <span className="required-star">*</span>
                  </label>
                  <input
                    id="district"
                    type="text"
                    name="district"
                    className="form-input"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Kottayam"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City / Area (Optional)
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Pala (leave empty for entire district)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="area">
                    Area / Locality (Optional)
                  </label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    className="form-input"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Town Center"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">
                    Pincode (Optional)
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    className="form-input"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 686575"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRegion ? '💾 Save Changes' : '➕ Add Region'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingRegionId && (
        <div className="modal-overlay">
          <div className="modal-card modal-confirm">
            <div className="modal-header">
              <h3>⚠️ Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this service region?</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Region'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeletingRegionId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceRegionsPage;
