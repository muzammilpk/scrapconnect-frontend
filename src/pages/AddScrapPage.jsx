import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected image files & preview URLs
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, publicId }]

  // Form State pre-populated with seller profile location
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metal',
    description: '',
    estimatedWeight: '',
    weightUnit: 'kg',
    expectedPrice: '',
    state: user?.location?.state || 'Kerala',
    district: user?.location?.district || 'Kottayam',
    city: user?.location?.city || 'Pala',
    area: user?.location?.area || '',
    pincode: user?.location?.pincode || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleSubmit = async (e, targetStatus = 'available') => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate clicks
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
      setErrorMsg('Weight must be a positive number if specified');
      return;
    }

    if (formData.expectedPrice && (isNaN(formData.expectedPrice) || Number(formData.expectedPrice) < 0)) {
      setErrorMsg('Expected price cannot be negative');
      return;
    }

    if (!formData.district.trim() || !formData.city.trim()) {
      setErrorMsg('District and City/Town location fields are required.');
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

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Form Content */}
      <main className="dashboard-content">
        <div className="form-page-container">
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
                  placeholder="e.g. Mixed Plastic Scrap, Old Newspaper Bundle, Iron Scrap"
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

            {/* Section 2: Weight & Price */}
            <div className="form-section-card">
              <h3 className="section-card-title">⚖️ Weight & Pricing</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedWeight">
                    Estimated Weight / Quantity (Optional)
                  </label>
                  <input
                    id="estimatedWeight"
                    type="number"
                    step="0.01"
                    name="estimatedWeight"
                    className="form-input"
                    value={formData.estimatedWeight}
                    onChange={handleChange}
                    placeholder="e.g. 25"
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
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ton">Tons</option>
                    <option value="g">Grams (g)</option>
                    <option value="items">Items / Pieces</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expectedPrice">
                    Expected Price (₹ INR, Optional)
                  </label>
                  <input
                    id="expectedPrice"
                    type="number"
                    step="1"
                    name="expectedPrice"
                    className="form-input"
                    value={formData.expectedPrice}
                    onChange={handleChange}
                    placeholder="e.g. 2500 (Leave empty for offers)"
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
              <h3 className="section-card-title">📍 Scrap Pickup Location</h3>

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
                    placeholder="e.g. Pala Town"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City / Town <span className="required-star">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Pala"
                    required
                  />
                </div>
              </div>

              <div className="form-row three-col">
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
                    placeholder="e.g. 686575"
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
