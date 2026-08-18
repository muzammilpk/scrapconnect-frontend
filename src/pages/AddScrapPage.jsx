import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected image files & preview URLs
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, publicId }]

  // Form State pre-populated with seller profile location
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metal',
    description: '',
    estimatedWeight: '',
    weightUnit: 'kg',
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

  // Image Selection Handler
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size and mime type
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMsg(`File "${file.name}" is not a supported image format (JPEG, PNG, WEBP allowed).`);
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
        setUploadedImages((prev) => [...prev, ...res.images]);

        // Create local preview URLs
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload selected images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter a scrap title');
      return;
    }

    if (!formData.estimatedWeight || Number(formData.estimatedWeight) <= 0) {
      setErrorMsg('Please specify a valid estimated weight/quantity');
      return;
    }

    if (!formData.state.trim() || !formData.district.trim() || !formData.city.trim()) {
      setErrorMsg('State, District, and City are required for the scrap location');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        images: uploadedImages,
        estimatedWeight: Number(formData.estimatedWeight),
        weightUnit: formData.weightUnit,
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
        navigate('/seller/scraps', { state: { successMsg: 'Scrap listing published successfully!' } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish scrap listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/seller/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/seller/dashboard')}>
            ← Dashboard
          </button>
          <button className="btn-secondary" onClick={() => navigate('/seller/scraps')}>
            📦 My Listings
          </button>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className="role-tag">Seller ♻️</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="dashboard-content">
        <div className="form-page-container">
          <div className="form-header">
            <h1 className="welcome-title">Publish New Scrap Listing</h1>
            <p className="welcome-sub">List your scrap materials to connect with interested local buyers</p>
          </div>

          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

          <form onSubmit={handleSubmit} className="scrap-form-wrapper">
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
                  placeholder="e.g. Old iron materials, copper wires, paper bundles"
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
                  placeholder="Describe condition, scrap types, accessibility for pickup, etc."
                ></textarea>
              </div>
            </div>

            {/* Section 2: Quantity & Weight */}
            <div className="form-section-card">
              <h3 className="section-card-title">⚖️ Quantity & Weight</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedWeight">
                    Estimated Quantity / Weight <span className="required-star">*</span>
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="weightUnit">
                    Unit <span className="required-star">*</span>
                  </label>
                  <select
                    id="weightUnit"
                    name="weightUnit"
                    className="form-input form-select"
                    value={formData.weightUnit}
                    onChange={handleChange}
                    required
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ton">Tons</option>
                    <option value="g">Grams (g)</option>
                    <option value="items">Items / Pieces</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Photos Upload */}
            <div className="form-section-card">
              <h3 className="section-card-title">📸 Photos</h3>

              <div className="upload-dropzone">
                <input
                  type="file"
                  id="scrapImages"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="file-input-hidden"
                  disabled={uploadingImages}
                />
                <label htmlFor="scrapImages" className="dropzone-label">
                  <span className="dropzone-icon">📷</span>
                  <span className="dropzone-text">
                    {uploadingImages ? 'Uploading images...' : 'Click to select or drop scrap photos'}
                  </span>
                  <span className="dropzone-sub">PNG, JPG, WEBP up to 5MB</span>
                </label>
              </div>

              {/* Uploaded Images Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="image-previews-grid">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="preview-thumb-card">
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
              <h3 className="section-card-title">📍 Scrap Location</h3>

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
              <button type="submit" className="btn-primary btn-lg" disabled={submitting || uploadingImages}>
                {submitting ? 'Publishing Scrap...' : '🚀 Publish Scrap'}
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
