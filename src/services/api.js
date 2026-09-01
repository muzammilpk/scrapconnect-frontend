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
    const data = await response.json().catch(() => ({ message: 'Server error' }));

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('scrapconnect_token');
      localStorage.removeItem('scrapconnect_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
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
    return await request('/users/me', {
      method: 'GET',
    });
  },

  // Update user profile and location
  updateProfile: async (profileData) => {
    return await request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Get user dynamic statistics
  getUserStats: async () => {
    return await request('/users/me/stats', {
      method: 'GET',
    });
  },

  // Get public profile for user by ID
  getPublicProfile: async (userId) => {
    return await request(`/users/${userId}/profile`, {
      method: 'GET',
    });
  },

  // Get public seller active listings
  getPublicSellerListings: async (sellerId) => {
    return await request(`/users/${sellerId}/listings`, {
      method: 'GET',
    });
  },

  // Change account password
  changePassword: async (passwordData) => {
    return await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Deactivate user account
  deactivateAccount: async () => {
    return await request('/users/me/status', {
      method: 'PATCH',
    });
  },

  // Buyer Service Regions APIs
  getServiceRegions: async () => {
    return await request('/users/me/service-regions', {
      method: 'GET',
    });
  },

  addServiceRegion: async (regionData) => {
    return await request('/users/me/service-regions', {
      method: 'POST',
      body: JSON.stringify(regionData),
    });
  },

  updateServiceRegion: async (regionId, regionData) => {
    return await request(`/users/me/service-regions/${regionId}`, {
      method: 'PATCH',
      body: JSON.stringify(regionData),
    });
  },

  deleteServiceRegion: async (regionId) => {
    return await request(`/users/me/service-regions/${regionId}`, {
      method: 'DELETE',
    });
  },

  // Seller Scrap Listing APIs
  uploadScrapImages: async (formData) => {
    const token = localStorage.getItem('scrapconnect_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/scraps/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }
    return data;
  },

  createScrap: async (scrapData) => {
    return await request('/scraps', {
      method: 'POST',
      body: JSON.stringify(scrapData),
    });
  },

  getMyScraps: async (status = '') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/scraps/my-listings${query}`, {
      method: 'GET',
    });
  },

  getScrapById: async (id) => {
    return await request(`/scraps/${id}`, {
      method: 'GET',
    });
  },

  updateScrap: async (id, scrapData) => {
    return await request(`/scraps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scrapData),
    });
  },

  deleteScrap: async (id) => {
    return await request(`/scraps/${id}`, {
      method: 'DELETE',
    });
  },

  getMatchingBuyers: async (id) => {
    return await request(`/scraps/${id}/matching-buyers`, {
      method: 'GET',
    });
  },

  // Marketplace Browsing & Search (Buyer)
  getMarketplaceScraps: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/scraps${queryString ? `?${queryString}` : ''}`;
    return await request(endpoint, {
      method: 'GET',
    });
  },

  // Notifications API (Step 10)
  getNotifications: async (page = 1, limit = 15) => {
    return await request(`/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  getUnreadNotificationCount: async () => {
    return await request('/notifications/unread-count', {
      method: 'GET',
    });
  },

  markNotificationAsRead: async (id) => {
    return await request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsAsRead: async () => {
    return await request('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  deleteNotification: async (id) => {
    return await request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Real-Time Chat API (Step 11)
  createOrGetConversation: async (scrapId) => {
    return await request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ scrapId }),
    });
  },

  getConversations: async () => {
    return await request('/chat/conversations', {
      method: 'GET',
    });
  },

  getConversationById: async (id) => {
    return await request(`/chat/conversations/${id}`, {
      method: 'GET',
    });
  },

  getMessages: async (conversationId) => {
    return await request(`/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
    });
  },

  sendMessage: async (conversationId, text) => {
    return await request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  markConversationRead: async (conversationId) => {
    return await request(`/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },

  // Price Offer & Negotiation API (Step 12)
  createOffer: async (conversationId, amount) => {
    return await request('/offers', {
      method: 'POST',
      body: JSON.stringify({ conversationId, amount }),
    });
  },

  counterOffer: async (offerId, amount) => {
    return await request(`/offers/${offerId}/counter`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  acceptOffer: async (offerId) => {
    return await request(`/offers/${offerId}/accept`, {
      method: 'POST',
    });
  },

  rejectOffer: async (offerId) => {
    return await request(`/offers/${offerId}/reject`, {
      method: 'POST',
    });
  },

  cancelOffer: async (offerId) => {
    return await request(`/offers/${offerId}/cancel`, {
      method: 'POST',
    });
  },

  getConversationOffers: async (conversationId) => {
    return await request(`/offers/conversation/${conversationId}`, {
      method: 'GET',
    });
  },

  // Deal / Transaction Management API (Step 13)
  createDeal: async (acceptedOfferId, pickupDetails = {}, notes = '') => {
    return await request('/deals', {
      method: 'POST',
      body: JSON.stringify({ acceptedOfferId, pickupDetails, notes }),
    });
  },

  getUserDeals: async (status = '') => {
    const query = status ? `?status=${status}` : '';
    return await request(`/deals${query}`, {
      method: 'GET',
    });
  },

  getDealById: async (id) => {
    return await request(`/deals/${id}`, {
      method: 'GET',
    });
  },

  updateDealStatus: async (id, status, cancellationReason = '') => {
    return await request(`/deals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellationReason }),
    });
  },

  updateDealPickup: async (id, pickupData) => {
    return await request(`/deals/${id}/pickup`, {
      method: 'PATCH',
      body: JSON.stringify(pickupData),
    });
  },

  // Ratings & Reviews API (Step 14)
  createReview: async (dealId, rating, comment = '') => {
    return await request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ dealId, rating, comment }),
    });
  },

  getUserReviews: async (userId) => {
    return await request(`/reviews/user/${userId}`, {
      method: 'GET',
    });
  },

  getUserRatingSummary: async (userId) => {
    return await request(`/reviews/user/${userId}/rating`, {
      method: 'GET',
    });
  },

  updateReview: async (id, rating, comment = '') => {
    return await request(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, comment }),
    });
  },

  deleteReview: async (id) => {
    return await request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // User Report Submission
  createReport: async (reportData) => {
    return await request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  // Admin Dashboard & Management API (Step 15)
  getAdminDashboardStats: async () => {
    return await request('/admin/dashboard', {
      method: 'GET',
    });
  },

  getAdminUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const query = queryParams.toString();
    return await request(`/admin/users${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getAdminUserById: async (id) => {
    return await request(`/admin/users/${id}`, {
      method: 'GET',
    });
  },

  updateAdminUserStatus: async (id, status) => {
    return await request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getAdminScraps: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const query = queryParams.toString();
    return await request(`/admin/scraps${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getAdminScrapById: async (id) => {
    return await request(`/admin/scraps/${id}`, {
      method: 'GET',
    });
  },

  updateAdminScrapStatus: async (id, status) => {
    return await request(`/admin/scraps/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getAdminDeals: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const query = queryParams.toString();
    return await request(`/admin/deals${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getAdminDealById: async (id) => {
    return await request(`/admin/deals/${id}`, {
      method: 'GET',
    });
  },

  getAdminReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const query = queryParams.toString();
    return await request(`/admin/reviews${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  deleteAdminReview: async (id) => {
    return await request(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  getAdminReports: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const query = queryParams.toString();
    return await request(`/admin/reports${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  updateAdminReportStatus: async (id, status, resolutionNotes = '') => {
    return await request(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    return await request('/users/me/notification-preferences', {
      method: 'GET',
    });
  },

  updateNotificationPreferences: async (preferences) => {
    return await request('/users/me/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  getUnreadChatCount: async () => {
    return await request('/conversations/unread-count', {
      method: 'GET',
    });
  },
};

export default api;
