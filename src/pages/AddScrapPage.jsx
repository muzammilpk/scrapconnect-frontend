import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function AddScrapPage() {
  usePageTitle('Sell Scrap');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected image files & preview URLs
  const [uploadedImages, setUploadedImages] = useState([]);

  const defaultState = user?.location?.state || 'Kerala';
  const defaultDistrict = user?.location?.district || 'Kottayam';
  const defaultCity = user?.location?.city || 'Kottayam Town';

  // Form State pre-populated with seller profile location
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metal',
    description: '',
    estimatedWeight: '',
    weightUnit: 'kg',
    expectedPrice: '',
    state: defaultState,
    district: defaultDistrict,
    city: defaultCity,
    area: user?.location?.area || '',
    pincode: user?.location?.pincode || '',
  });

  const [isCustomState, setIsCustomState] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

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

  // Image Selection Handler (Max 5 images total)
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setErrorMsg(`You can upload a maximum of 5 images per listing. (Already uploaded: ${uploadedImages.length})`);
      return;
    }

    try {
      setUploadingImages(true);
      setErrorMsg('');
      const uploadData = new FormData();
      files.forEach((file) => {
        uploadData.append('images', file);
      });

      const res = await api.uploadScrapImages(uploadData);
      if (res.success && res.images) {
        setUploadedImages((prev) => [...prev, ...res.images].slice(0, 5));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload selected images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveListing = async (e, targetStatus = 'available') => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Scrap title is required.');
      return;
    }

    if (!formData.category) {
      setErrorMsg('Please select a scrap category.');
      return;
    }

    if (formData.estimatedWeight && (isNaN(formData.estimatedWeight) || Number(formData.estimatedWeight) < 0)) {
      setErrorMsg('Weight must be a valid positive number if specified');
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
        status: targetStatus,
        location: {
          state: formData.state.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const res = await api.createScrap(payload);
      if (res.success) {
        const msg = targetStatus === 'draft'
          ? 'Scrap listing saved as draft.'
          : 'Scrap listing published successfully. Matching buyers have been notified!';
        navigate('/seller/scraps', { state: { successMsg: msg } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save scrap listing.');
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

      {/* Main Form Content */}
      <main className="dashboard-content">
        <div className="form-page-container" style={{ maxWidth: '850px' }}>
          <div className="form-header">
            <h1 className="welcome-title">Publish New Scrap Listing</h1>
            <p className="welcome-sub">List your scrap materials to connect with interested local buyers</p>
          </div>

          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          <form onSubmit={(e) => handleSaveListing(e, 'available')} className="scrap-form-wrapper">
            {/* Section 1: Basic Information */}
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
                  placeholder="e.g. Heavy Metal Scrap, Copper Wires, Plastic Scrap"
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
                  placeholder="Describe condition, scrap items, collection accessibility, etc."
                ></textarea>
              </div>
            </div>

            {/* Section 2: Weight & Price (Type numbers directly without scroll spinner arrows) */}
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
                    placeholder="e.g. 5000 (Empty for offers)"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Photos Upload */}
            <div className="form-section-card">
              <h3 className="section-card-title">📸 Photos (1 to 5 Photos)</h3>

              <div className="upload-dropzone">
                <input
                  type="file"
                  id="scrapImages"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="file-input-hidden"
                  disabled={uploadingImages || uploadedImages.length >= 5}
                />
                <label htmlFor="scrapImages" className="dropzone-label">
                  <span className="dropzone-icon">📷</span>
                  <span className="dropzone-text">
                    {uploadingImages ? 'Uploading images...' : uploadedImages.length >= 5 ? 'Maximum 5 images reached' : 'Click to select or drop scrap photos'}
                  </span>
                  <span className="dropzone-sub">PNG, JPG, WEBP up to 5MB ({uploadedImages.length}/5 uploaded)</span>
                </label>
              </div>

              {/* Uploaded Images Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="image-previews-grid">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="preview-thumb-card" style={{ position: 'relative' }}>
                      {idx === 0 && (
                        <span className="primary-img-badge" style={{ position: 'absolute', top: '4px', left: '4px', background: '#16A34A', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                          ⭐ Primary Image
                        </span>
                      )}
                      <img src={img.url} alt={`Scrap preview ${idx + 1}`} className="preview-img" />
                      <button
                        type="button"
                        className="btn-remove-thumb"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Scrap Pickup Location (Structured 3-Level State -> District -> City Dropdowns) */}
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
                        placeholder="Type City / Town name..."
                        required
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
                    placeholder="e.g. Town Center, Main Bazaar, Sector 5"
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
                    placeholder="e.g. 686001"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions-bar">
              <button
                type="submit"
                className="btn-primary btn-lg"
                disabled={submitting || uploadingImages}
              >
                {submitting ? 'Publishing Scrap...' : '🚀 Publish Scrap'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-lg"
                onClick={(e) => handleSaveListing(e, 'draft')}
                disabled={submitting || uploadingImages}
              >
                💾 Save Draft
              </button>
              <button
                type="button"
                className="btn-secondary btn-lg"
                onClick={() => navigate('/seller/scraps')}
                disabled={submitting}
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

export default AddScrapPage;
