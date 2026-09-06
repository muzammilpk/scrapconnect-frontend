import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';
import { getStates, getDistricts, getCities } from '../utils/locationData';

const SCRAP_CATEGORIES = [
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

function EditScrapPage() {
  usePageTitle('Edit Scrap Listing');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [initialStatus, setInitialStatus] = useState('available');

  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metal',
    description: '',
    estimatedWeight: '',
    weightUnit: 'kg',
    expectedPrice: '',
    status: 'available',
    state: 'Kerala',
    district: 'Kottayam',
    city: 'Kottayam Town',
    area: '',
    pincode: '',
  });

  const [isCustomState, setIsCustomState] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

  useEffect(() => {
    const fetchScrap = async () => {
      setLoading(true);
      try {
        const res = await api.getScrapById(id);
        if (res.success && res.scrap) {
          const s = res.scrap;
          setInitialStatus(s.status || 'available');
          const stateVal = s.location?.state || 'Kerala';
          const distVal = s.location?.district || 'Kottayam';
          const cityVal = s.location?.city || '';

          const knownStates = getStates();
          const isKnownState = knownStates.includes(stateVal);

          setFormData({
            title: s.title || '',
            category: s.category || 'Metal',
            description: s.description || '',
            estimatedWeight: s.estimatedWeight !== undefined && s.estimatedWeight !== null ? s.estimatedWeight : '',
            weightUnit: s.weightUnit || 'kg',
            expectedPrice: s.expectedPrice !== undefined && s.expectedPrice !== null ? s.expectedPrice : '',
            status: s.status || 'available',
            state: isKnownState ? stateVal : (stateVal ? stateVal : 'Kerala'),
            district: distVal || (isKnownState ? getDistricts(stateVal)[0] || '' : ''),
            city: cityVal,
            area: s.location?.area || '',
            pincode: s.location?.pincode || '',
          });
          if (stateVal && !isKnownState) {
            setIsCustomState(true);
          }
          setUploadedImages(s.images || []);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to fetch scrap details for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchScrap();
  }, [id]);

  const isRestricted = ['reserved', 'sold'].includes(initialStatus);

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

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setErrorMsg(`Maximum 5 images allowed per listing. (Already uploaded: ${uploadedImages.length})`);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMsg(`File "${file.name}" is not a supported format.`);
        return;
      }
    }

    setErrorMsg('');
    setUploadingImages(true);

    try {
      const uploadData = new FormData();
      files.forEach((file) => {
        uploadData.append('images', file);
      });

      const res = await api.uploadScrapImages(uploadData);
      if (res.success && res.images) {
        setUploadedImages((prev) => [...prev, ...res.images].slice(0, 5));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Scrap title is required');
      return;
    }

    if (formData.estimatedWeight && (isNaN(formData.estimatedWeight) || Number(formData.estimatedWeight) < 0)) {
      setErrorMsg('Valid estimated weight is required if provided');
      return;
    }

    if (formData.expectedPrice && (isNaN(formData.expectedPrice) || Number(formData.expectedPrice) < 0)) {
      setErrorMsg('Expected price cannot be negative');
      return;
    }

    if (!formData.state.trim() || !formData.district.trim() || !formData.city.trim()) {
      setErrorMsg('State, District, and City/Town location fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        images: uploadedImages,
        estimatedWeight: formData.estimatedWeight !== '' ? Number(formData.estimatedWeight) : null,
        weightUnit: formData.weightUnit,
        expectedPrice: formData.expectedPrice !== '' ? Number(formData.expectedPrice) : null,
        status: formData.status,
        location: {
          state: formData.state.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const res = await api.updateScrap(id, payload);
      if (res.success) {
        navigate(`/seller/scraps/${id}`, { state: { successMsg: 'Scrap listing updated successfully!' } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update scrap listing');
    } finally {
      setSubmitting(false);
    }
  };

  const stateList = getStates();
  const districtList = getDistricts(formData.state);
  const cityList = getCities(formData.state, formData.district);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="form-page-container" style={{ maxWidth: '850px' }}>
          <div className="form-header">
            <h1 className="welcome-title">✏️ Edit Scrap Listing</h1>
            <p className="welcome-sub">Update scrap details, weight, price, status, or photos</p>
          </div>

          {isRestricted && (
            <div className="alert-success" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#F59E0B' }}>
              ℹ️ This listing is currently <strong>{initialStatus.toUpperCase()}</strong>. Core terms (category, weight, price, location) are locked to maintain active negotiation integrity.
            </div>
          )}

          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          {loading ? (
            <div className="loading-card">Loading scrap listing data...</div>
          ) : (
            <form onSubmit={handleSubmit} className="scrap-form-wrapper">
              {/* Section 1: Basic Info */}
              <div className="form-section-card">
                <h3 className="section-card-title">📝 Basic Information</h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Scrap Title <span className="required-star">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">
                      Category <span className="required-star">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-input form-select"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isRestricted}
                      style={{ fontWeight: 600 }}
                      required
                    >
                      {SCRAP_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">
                      Status <span className="required-star">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="form-input form-select"
                      value={formData.status}
                      onChange={handleChange}
                      style={{ fontWeight: 600 }}
                      required
                    >
                      <option value="available">Available 🟢</option>
                      <option value="draft">Draft 📝</option>
                      <option value="reserved">Reserved 🟠</option>
                      <option value="sold">Sold ⚪</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input form-textarea"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Section 2: Weight & Price */}
              <div className="form-section-card">
                <h3 className="section-card-title">⚖️ Weight & Pricing</h3>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="estimatedWeight">
                      Estimated Weight / Quantity
                    </label>
                    <input
                      id="estimatedWeight"
                      type="text"
                      inputMode="decimal"
                      name="estimatedWeight"
                      className="form-input"
                      value={formData.estimatedWeight}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setFormData((prev) => ({ ...prev, estimatedWeight: val }));
                        }
                      }}
                      disabled={isRestricted}
                      placeholder="e.g. 50"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="weightUnit">
                      Unit
                    </label>
                    <select
                      id="weightUnit"
                      name="weightUnit"
                      className="form-input form-select"
                      value={formData.weightUnit}
                      onChange={handleChange}
                      disabled={isRestricted}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ton">Tons</option>
                      <option value="g">Grams (g)</option>
                      <option value="items">Items / Pieces</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="expectedPrice">
                      Expected Price (₹ INR)
                    </label>
                    <input
                      id="expectedPrice"
                      type="text"
                      inputMode="numeric"
                      name="expectedPrice"
                      className="form-input"
                      value={formData.expectedPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setFormData((prev) => ({ ...prev, expectedPrice: val }));
                        }
                      }}
                      disabled={isRestricted}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Photos */}
              <div className="form-section-card">
                <h3 className="section-card-title">📸 Photos (1 to 5 Photos)</h3>

                <div className="upload-dropzone">
                  <input
                    type="file"
                    id="editScrapImages"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="file-input-hidden"
                    disabled={uploadingImages || uploadedImages.length >= 5}
                  />
                  <label htmlFor="editScrapImages" className="dropzone-label">
                    <span className="dropzone-icon">📷</span>
                    <span className="dropzone-text">
                      {uploadingImages ? 'Uploading images...' : uploadedImages.length >= 5 ? 'Maximum 5 images reached' : 'Click to add more photos'}
                    </span>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="image-previews-grid">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="preview-thumb-card" style={{ position: 'relative' }}>
                        {idx === 0 && (
                          <span className="primary-img-badge" style={{ position: 'absolute', top: '4px', left: '4px', background: '#16A34A', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                            ⭐ Primary Image
                          </span>
                        )}
                        <img src={img.url} alt={`Preview ${idx + 1}`} className="preview-img" />
                        <button
                          type="button"
                          className="btn-remove-thumb"
                          onClick={() => removeImage(idx)}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Location */}
              <div className="form-section-card">
                <h3 className="section-card-title">📍 Scrap Pickup Location (State, District & City)</h3>

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
                        disabled={isRestricted}
                        style={{ fontWeight: 600 }}
                        required
                      >
                        {stateList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                        <option value="Other / Custom">➕ Other / Custom State...</option>
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
                          disabled={isRestricted}
                          placeholder="Type State name..."
                          required
                        />
                        {!isRestricted && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setIsCustomState(false)}
                            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                          >
                            List
                          </button>
                        )}
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
                        disabled={isRestricted}
                        style={{ fontWeight: 600 }}
                        required
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
                        disabled={isRestricted}
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
                        disabled={isRestricted}
                        style={{ fontWeight: 600 }}
                        required
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
                          disabled={isRestricted}
                          placeholder="Type City / Town name..."
                          required
                        />
                        {!isCustomState && cityList.length > 0 && !isRestricted && (
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

                <div className="form-row">
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
                      disabled={isRestricted}
                      placeholder="e.g. Town Center"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pincode">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      inputMode="numeric"
                      name="pincode"
                      className="form-input"
                      value={formData.pincode}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setFormData((prev) => ({ ...prev, pincode: val }));
                        }
                      }}
                      disabled={isRestricted}
                      placeholder="e.g. 686001"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions-bar">
                <button type="submit" className="btn-primary btn-lg" disabled={submitting || uploadingImages}>
                  {submitting ? 'Saving Changes...' : '💾 Save Listing Changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-lg"
                  onClick={() => navigate(`/seller/scraps/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default EditScrapPage;
