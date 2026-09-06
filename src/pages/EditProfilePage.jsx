import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';
import { getStates, getDistricts, getCities, INDIAN_LOCATION_DATA } from '../utils/locationData';

function EditProfilePage() {
  usePageTitle('Edit Profile & Regions');
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const defaultState = user?.location?.state || 'Kerala';
  const defaultDistrict = user?.location?.district || 'Kottayam';
  const defaultCity = user?.location?.city || 'Kottayam';

  // Primary Location State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    profileImage: user?.profileImage || '',
    address: user?.address || '',
    state: defaultState,
    district: defaultDistrict,
    city: defaultCity,
    area: user?.location?.area || '',
    pincode: user?.location?.pincode || '',
  });

  const [isCustomState, setIsCustomState] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

  // Service Regions State (for Buyers / Operating Scrap Areas)
  const [serviceRegions, setServiceRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [newRegionState, setNewRegionState] = useState(defaultState);
  const [newRegionDistrict, setNewRegionDistrict] = useState(defaultDistrict);
  const [newRegionCity, setNewRegionCity] = useState(defaultCity);
  const [addingRegion, setAddingRegion] = useState(false);

  useEffect(() => {
    if (user) {
      const stateVal = user.location?.state || 'Kerala';
      const distVal = user.location?.district || 'Kottayam';
      const cityVal = user.location?.city || 'Kottayam';

      const knownStates = getStates();
      const isKnownState = knownStates.includes(stateVal);

      setFormData({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        profileImage: user.profileImage || '',
        address: user.address || '',
        state: isKnownState ? stateVal : (stateVal ? stateVal : 'Kerala'),
        district: distVal || (isKnownState ? getDistricts(stateVal)[0] || '' : ''),
        city: cityVal,
        area: user.location?.area || '',
        pincode: user.location?.pincode || '',
      });

      if (stateVal && !isKnownState) {
        setIsCustomState(true);
      }

      setNewRegionState(stateVal);
      setNewRegionDistrict(distVal);
      setNewRegionCity(cityVal);
    }
  }, [user]);

  // Load Service Regions if user is buyer or has regions
  useEffect(() => {
    const loadServiceRegions = async () => {
      setLoadingRegions(true);
      try {
        const res = await api.getServiceRegions();
        if (res.success) {
          setServiceRegions(res.serviceRegions || res.data || []);
        }
      } catch (err) {
        console.warn('Could not load service regions:', err.message);
      } finally {
        setLoadingRegions(false);
      }
    };

    if (user?.role === 'buyer') {
      loadServiceRegions();
    }
  }, [user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStateSelect = (e) => {
    const selectedState = e.target.value;
    if (selectedState === 'Other / Custom') {
      setIsCustomState(true);
      setFormData((prev) => ({ ...prev, state: '', district: '', city: '' }));
    } else {
      setIsCustomState(false);
      const districts = getDistricts(selectedState);
      const firstDistrict = districts[0] || '';
      const cities = getCities(selectedState, firstDistrict);
      const firstCity = cities[0] || '';
      setFormData((prev) => ({
        ...prev,
        state: selectedState,
        district: firstDistrict,
        city: firstCity,
      }));
    }
  };

  const handleDistrictSelect = (e) => {
    const selectedDistrict = e.target.value;
    const cities = getCities(formData.state, selectedDistrict);
    const firstCity = cities[0] || '';
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      city: firstCity,
    }));
  };

  const handleNewRegionStateSelect = (e) => {
    const st = e.target.value;
    setNewRegionState(st);
    const dsts = getDistricts(st);
    const firstDst = dsts[0] || '';
    const cities = getCities(st, firstDst);
    setNewRegionDistrict(firstDst);
    setNewRegionCity(cities[0] || '');
  };

  const handleNewRegionDistrictSelect = (e) => {
    const dst = e.target.value;
    setNewRegionDistrict(dst);
    const cities = getCities(newRegionState, dst);
    setNewRegionCity(cities[0] || '');
  };

  const handleAddServiceRegion = async (e) => {
    e.preventDefault();
    if (!newRegionState.trim() || !newRegionDistrict.trim()) {
      setErrorMsg('Please select State, District, and City for service region');
      return;
    }

    setAddingRegion(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        state: newRegionState.trim(),
        district: newRegionDistrict.trim(),
        city: newRegionCity.trim(),
      };
      const res = await api.addServiceRegion(payload);
      if (res.success) {
        setSuccessMsg('📍 New Service Region added successfully!');
        setServiceRegions(res.serviceRegions || res.data || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add service region');
    } finally {
      setAddingRegion(false);
    }
  };

  const handleDeleteServiceRegion = async (regionId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.deleteServiceRegion(regionId);
      if (res.success) {
        setSuccessMsg('Service region removed.');
        setServiceRegions(res.serviceRegions || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete service region');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }

    if (!formData.mobileNumber.trim()) {
      setErrorMsg('Mobile Number is required');
      return;
    }

    const mobileRegex = /^[0-9+\s-]{10,15}$/;
    if (!mobileRegex.test(formData.mobileNumber.trim())) {
      setErrorMsg('Please enter a valid mobile number (10 to 15 digits)');
      return;
    }

    if (formData.pincode.trim()) {
      const pincodeRegex = /^[0-9]{5,10}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        setErrorMsg('Please enter a valid pincode (5 to 10 digits)');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        profileImage: formData.profileImage.trim(),
        address: formData.address.trim(),
        location: {
          state: formData.state.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const res = await updateProfile(payload);
      if (res && res.success) {
        setSuccessMsg('✓ Profile & Region options updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setErrorMsg(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const stateList = getStates();
  const districtList = getDistricts(formData.state);
  const cityList = getCities(formData.state, formData.district);

  const newRegionDistrictList = getDistricts(newRegionState);
  const newRegionCityList = getCities(newRegionState, newRegionDistrict);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="form-page-container" style={{ maxWidth: '850px' }}>
          <div className="form-header">
            <h1 className="welcome-title">Edit Profile & Region Options</h1>
            <p className="welcome-sub">Select your State, District, City/Town, and scrap service regions</p>
          </div>

          {successMsg && <div className="alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="form-section-card">
              <h3 className="section-card-title">👤 Personal Details</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="mobileNumber">
                    Mobile Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="mobileNumber"
                    type="text"
                    name="mobileNumber"
                    className="form-input"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210 or +91 9876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileImage">
                    Profile Image URL (Optional)
                  </label>
                  <input
                    id="profileImage"
                    type="url"
                    name="profileImage"
                    className="form-input"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input read-only-input"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            {/* SECTION 2: 3-LEVEL REGION SELECTION (STATE, DISTRICT, CITY) */}
            <div className="form-section-card">
              <h3 className="section-card-title">📍 Primary Region Selection (State, District & City)</h3>

              <div className="form-row three-col">
                {/* 1. STATE SELECTOR */}
                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    1. Select State <span className="required-star">*</span>
                  </label>
                  {!isCustomState ? (
                    <select
                      id="state-select"
                      className="form-input"
                      value={formData.state}
                      onChange={handleStateSelect}
                      style={{ fontWeight: 600 }}
                    >
                      {stateList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        className="form-input"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Type State name..."
                        required
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsCustomState(false)}
                        style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. DISTRICT SELECTOR */}
                <div className="form-group">
                  <label className="form-label" htmlFor="district">
                    2. Select District <span className="required-star">*</span>
                  </label>
                  {!isCustomState && districtList.length > 0 ? (
                    <select
                      id="district-select"
                      className="form-input"
                      value={formData.district}
                      onChange={handleDistrictSelect}
                      style={{ fontWeight: 600 }}
                    >
                      {districtList.map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="district"
                      type="text"
                      name="district"
                      className="form-input"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Type District name..."
                      required
                    />
                  )}
                </div>

                {/* 3. CITY / TOWN SELECTOR */}
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    3. Select City / Town <span className="required-star">*</span>
                  </label>
                  {!isCustomState && cityList.length > 0 && !isCustomCity ? (
                    <select
                      id="city-select"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => {
                        if (e.target.value === 'Other / Custom City') {
                          setIsCustomCity(true);
                          setFormData((prev) => ({ ...prev, city: '' }));
                        } else {
                          setFormData((prev) => ({ ...prev, city: e.target.value }));
                        }
                      }}
                      style={{ fontWeight: 600 }}
                    >
                      {cityList.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                      <option value="Other / Custom City">➕ Other / Custom City...</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        className="form-input"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Type City / Town name..."
                      />
                      {!isCustomState && cityList.length > 0 && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setIsCustomCity(false)}
                          style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                        >
                          List
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label className="form-label" htmlFor="area">
                    Area / Locality
                  </label>
                  <input
                    id="area"
                    type="text"
                    name="area"
                    className="form-input"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Sector 5 or Main Bazaar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    className="form-input"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 400001 or 686575"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Street Address / House No.
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Green Street, Flat 4B"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: SERVICE REGIONS MANAGEMENT (STATE, DISTRICT, CITY) */}
            {user?.role === 'buyer' && (
              <div className="form-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="section-card-title" style={{ margin: 0 }}>
                    🎯 Scrap Collection Service Regions ({serviceRegions.length})
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginBottom: '1rem' }}>
                  Select State, District, and City/Town for regions where you collect scrap. Automated alerts trigger when scrap is posted in these areas.
                </p>

                {/* Quick Add Region Box with 3 Dropdowns */}
                <div style={{ background: '#F0FDF4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #86EFAC', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#15803D', marginBottom: '0.75rem' }}>
                    ➕ Add Operating Service Region (State, District & City)
                  </div>
                  <div className="form-row four-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>1. State</label>
                      <select
                        className="form-input"
                        value={newRegionState}
                        onChange={handleNewRegionStateSelect}
                        style={{ fontWeight: 600 }}
                      >
                        {stateList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>2. District</label>
                      <select
                        className="form-input"
                        value={newRegionDistrict}
                        onChange={handleNewRegionDistrictSelect}
                        style={{ fontWeight: 600 }}
                      >
                        {newRegionDistrictList.map((dst) => (
                          <option key={dst} value={dst}>{dst}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>3. City / Town</label>
                      <select
                        className="form-input"
                        value={newRegionCity}
                        onChange={(e) => setNewRegionCity(e.target.value)}
                        style={{ fontWeight: 600 }}
                      >
                        {newRegionCityList.map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAddServiceRegion}
                        disabled={addingRegion}
                        style={{ height: '42px', padding: '0 1.25rem', whiteSpace: 'nowrap' }}
                      >
                        {addingRegion ? 'Adding...' : '+ Add Region'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Regions List */}
                {loadingRegions ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>Loading regions...</div>
                ) : serviceRegions.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                    No service regions added yet. Add a region above to start receiving scrap notifications.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.75rem' }}>
                    {serviceRegions.map((reg) => (
                      <div
                        key={reg._id}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                            📍 {reg.city ? `${reg.city}, ` : ''}{reg.district}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                            {reg.state}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteServiceRegion(reg._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            padding: '0.2rem',
                          }}
                          title="Remove Region"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FORM ACTIONS BAR */}
            <div className="form-actions-bar">
              <button type="submit" className="btn-primary btn-lg" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile & Region Options'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-lg"
                onClick={() => navigate('/profile')}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditProfilePage;
