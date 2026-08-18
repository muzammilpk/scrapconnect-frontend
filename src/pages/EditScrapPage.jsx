import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function EditScrapPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metal',
    description: '',
    estimatedWeight: '',
    weightUnit: 'kg',
    status: 'available',
    state: '',
    district: '',
    city: '',
    area: '',
    pincode: '',
  });

  useEffect(() => {
    const fetchScrap = async () => {
      setLoading(true);
      try {
        const res = await api.getScrapById(id);
        if (res.success && res.scrap) {
          const s = res.scrap;
          setFormData({
            title: s.title || '',
            category: s.category || 'Metal',
            description: s.description || '',
            estimatedWeight: s.estimatedWeight || '',
            weightUnit: s.weightUnit || 'kg',
            status: s.status || 'available',
            state: s.location?.state || '',
            district: s.location?.district || '',
            city: s.location?.city || '',
            area: s.location?.area || '',
            pincode: s.location?.pincode || '',
          });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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
        setUploadedImages((prev) => [...prev, ...res.images]);
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

    if (!formData.estimatedWeight || Number(formData.estimatedWeight) <= 0) {
      setErrorMsg('Valid estimated weight is required');
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

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/seller/dashboard')} style={{ cursor: 'pointer' }}>
          <span>♻️</span> ScrapConnect
        </div>

        <div className="user-badge">
          <button className="btn-secondary" onClick={() => navigate('/seller/scraps')}>
            ← My Listings
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

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="form-page-container">
          <div className="form-header">
            <h1 className="welcome-title">✏️ Edit Scrap Listing</h1>
            <p className="welcome-sub">Update scrap details, weight, status, or photos</p>
          </div>

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
                      required
                    >
                      <option value="available">Available 🟢</option>
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

              {/* Section 2: Weight */}
              <div className="form-section-card">
                <h3 className="section-card-title">⚖️ Quantity & Weight</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="estimatedWeight">
                      Estimated Weight / Quantity <span className="required-star">*</span>
                    </label>
                    <input
                      id="estimatedWeight"
                      type="number"
                      step="0.01"
                      name="estimatedWeight"
                      className="form-input"
                      value={formData.estimatedWeight}
                      onChange={handleChange}
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

              {/* Section 3: Photos */}
              <div className="form-section-card">
                <h3 className="section-card-title">📸 Photos</h3>

                <div className="upload-dropzone">
                  <input
                    type="file"
                    id="editScrapImages"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="file-input-hidden"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="editScrapImages" className="dropzone-label">
                    <span className="dropzone-icon">📷</span>
                    <span className="dropzone-text">
                      {uploadingImages ? 'Uploading images...' : 'Click to add more photos'}
                    </span>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="image-previews-grid">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="preview-thumb-card">
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
                <h3 className="section-card-title">📍 Location</h3>

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
