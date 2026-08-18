const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Standard fetch helper with headers and error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('scrapconnect_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

export const api = {
  // Register API call
  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login API call
  login: async (credentials) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current authenticated user profile
  getMe: async () => {
    return await request('/auth/me', {
      method: 'GET',
    });
  },

  // Get user profile
  getProfile: async () => {
    return await request('/users/profile', {
      method: 'GET',
    });
  },

  // Update user profile and location
  updateProfile: async (profileData) => {
    return await request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Buyer Service Regions APIs
  getServiceRegions: async () => {
    return await request('/buyers/service-regions', {
      method: 'GET',
    });
  },

  addServiceRegion: async (regionData) => {
    return await request('/buyers/service-regions', {
      method: 'POST',
      body: JSON.stringify(regionData),
    });
  },

  updateServiceRegion: async (regionId, regionData) => {
    return await request(`/buyers/service-regions/${regionId}`, {
      method: 'PUT',
      body: JSON.stringify(regionData),
    });
  },

  deleteServiceRegion: async (regionId) => {
    return await request(`/buyers/service-regions/${regionId}`, {
      method: 'DELETE',
    });
  },
};

export default api;
