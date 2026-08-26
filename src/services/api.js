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

  getMyScraps: async () => {
    return await request('/scraps/my-listings', {
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
};

export default api;
