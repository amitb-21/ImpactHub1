import API from './client';

// ===== AUTH =====
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  getCurrentUser: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
  googleLogin: () => {
    // Redirect to backend Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  },
  
  handleGoogleCallback: (token) => {
    // Store token from URL callback
    localStorage.setItem('token', token);
    return API.get('/auth/me');
  }
};

// ===== USERS =====
export const userAPI = {
  getProfile: (userId) => API.get(`/users/${userId}`),
  updateProfile: (userId, data) => API.put(`/users/${userId}`, data),
  getStats: (userId) => API.get(`/users/${userId}/stats`),
  getActivity: (userId, page = 1) => API.get(`/users/${userId}/activity?page=${page}&limit=10`),
  search: (query, page = 1) => API.get(`/users?q=${query}&page=${page}&limit=20`)
};

// ===== COMMUNITIES =====
export const communityAPI = {
  getAll: (filters = {}) => API.get('/communities', { params: filters }),
  getById: (id) => API.get(`/communities/${id}`),
  create: (data) => API.post('/communities', data),
  update: (id, data) => API.put(`/communities/${id}`, data),
  join: (id) => API.post(`/communities/${id}/join`),
  leave: (id) => API.post(`/communities/${id}/leave`),
  getVerificationStatus: (id) => API.get(`/communities/${id}/verification-status`)
};

// ===== EVENTS =====
export const eventAPI = {
  getAll: (filters = {}) => API.get('/events', { params: filters }),
  getById: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  join: (id) => API.post(`/events/${id}/join`),
  leave: (id) => API.post(`/events/${id}/leave`),
  getParticipants: (id, page = 1) => API.get(`/events/${id}/participants?page=${page}&limit=20`)
};

// ===== PARTICIPATION =====
export const participationAPI = {
  markAttended: (participationId, hoursContributed) => 
    API.post(`/participations/${participationId}/mark-attended`, { hoursContributed }),
  reject: (participationId, rejectionReason) => 
    API.post(`/participations/${participationId}/reject`, { rejectionReason }),
  getPending: (eventId, page = 1) => 
    API.get(`/participations/event/${eventId}/pending?page=${page}&limit=20`),
  getVerified: (eventId, page = 1) => 
    API.get(`/participations/event/${eventId}/verified?page=${page}&limit=20`),
  saveToWishlist: (eventId) => 
    API.post(`/participations/${eventId}/wishlist/save`),
  removeFromWishlist: (eventId) => 
    API.delete(`/participations/${eventId}/wishlist/remove`),
  getWishlist: (userId, page = 1) => 
    API.get(`/participations/user/${userId}/wishlist?page=${page}&limit=10`)
  , // end getWishlist
  // Get participation details
  getParticipationDetails: (participationId) => API.get(`/participations/${participationId}`)
};

// ===== RATINGS =====
export const ratingAPI = {
  create: (data) => API.post('/ratings', data),
  getAll: (filters = {}) => API.get('/ratings', { params: filters }),
  update: (id, data) => API.put(`/ratings/${id}`, data),
  delete: (id) => API.delete(`/ratings/${id}`),
  markHelpful: (id, helpful) => API.post(`/ratings/${id}/helpful`, { helpful })
};

// ===== IMPACT & POINTS =====
export const impactAPI = {
  getMetrics: (userId) => API.get(`/impact/metrics/${userId}`),
  getProgress: (userId) => API.get(`/impact/progress/${userId}`),
  getLeaderboard: (page = 1, metric = 'points') => 
    API.get(`/impact/leaderboard?page=${page}&limit=20&metric=${metric}`),
  getRank: (userId) => API.get(`/impact/rank/${userId}`),
  getSummary: () => API.get(`/impact/summary`)
};

export const pointsAPI = {
  getVolunteerPoints: (userId) => API.get(`/points/volunteer/${userId}`),
  getVolunteerLeaderboard: (page = 1) => 
    API.get(`/points/volunteer/leaderboard?page=${page}&limit=20`),
  getCommunityRewards: (communityId) => API.get(`/points/community/${communityId}`),
  getCommunityLeaderboard: (page = 1) => 
    API.get(`/points/community/leaderboard?page=${page}&limit=20`)
};

// ===== RESOURCES =====
export const resourceAPI = {
  getAll: (filters = {}) => API.get('/resources', { params: filters }),
  getById: (id) => API.get(`/resources/${id}`),
  create: (data) => API.post('/resources', data),
  update: (id, data) => API.put(`/resources/${id}`, data),
  delete: (id) => API.delete(`/resources/${id}`),
  search: (query, page = 1) => API.get(`/resources/search?q=${query}&page=${page}&limit=10`),
  getFeatured: () => API.get('/resources/featured'),
  like: (id) => API.post(`/resources/${id}/like`),
  unlike: (id) => API.post(`/resources/${id}/unlike`)
};

// ===== PHOTOS =====
export const photoAPI = {
  upload: (eventId, formData) => 
    API.post(`/event-photos/${eventId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getPhotos: (eventId, page = 1) => 
    API.get(`/event-photos/${eventId}?page=${page}&limit=20`),
  getByType: (eventId, type) => API.get(`/event-photos/${eventId}/type/${type}`),
  deletePhoto: (photoId) => API.delete(`/event-photos/photo/${photoId}`),
  updateDescription: (photoId, description) => 
    API.put(`/event-photos/photo/${photoId}/description`, { description }),
  likePhoto: (photoId) => API.post(`/event-photos/photo/${photoId}/like`),
  unlikePhoto: (photoId) => API.post(`/event-photos/photo/${photoId}/unlike`),
  getCommunityGallery: (communityId, page = 1) => 
    API.get(`/event-photos/community/${communityId}/gallery?page=${page}&limit=30`)
};

// ===== LOCATION =====
export const locationAPI = {
  getNearbyEvents: (lat, lng, radiusKm = 10) => 
    API.get(`/location/nearby-events?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
  getNearbyCommunities: (lat, lng, radiusKm = 15) => 
    API.get(`/location/nearby-communities?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
  getEventsByCity: (city) => API.get(`/location/city/${city}`),
  getTodayNearby: (lat, lng, radiusKm = 10) => 
    API.get(`/location/today?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`)
};

// ===== CALENDAR =====
export const calendarAPI = {
  downloadICS: (eventId) => 
    API.get(`/location/calendar/events/${eventId}/download.ics`),
  getInviteURLs: (eventId) => 
    API.get(`/location/calendar/events/${eventId}/invite-urls`)
};

// ===== ACTIVITY =====
export const activityAPI = {
  getUserActivity: (userId, page = 1) => 
    API.get(`/activities/user/${userId}?page=${page}&limit=10`),
  getCommunityActivity: (communityId, page = 1) => 
    API.get(`/activities/community/${communityId}?page=${page}&limit=10`),
  getGlobalActivity: (page = 1) => 
    API.get(`/activities?page=${page}&limit=20`),
  getStats: () => API.get(`/activities/stats`)
};

// ===== VERIFICATION =====
export const verificationAPI = {
  getStatus: (communityId) => API.get(`/verifications/${communityId}/status`),
  submitRequest: (communityId, data) => 
    API.post(`/verifications/${communityId}/submit`, data),
  getPending: (page = 1) => 
    API.get(`/verifications/admin/pending?page=${page}&limit=10`),
  approve: (verificationId, notes) => 
    API.post(`/verifications/${verificationId}/approve`, { notes }),
  reject: (verificationId, rejectionReason, notes) => 
    API.post(`/verifications/${verificationId}/reject`, { rejectionReason, notes })
};

// ===== ADMIN =====
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getSystemAnalytics: (startDate, endDate) => 
    API.get(`/admin/analytics?startDate=${startDate}&endDate=${endDate}`),
  
  // Users
  getUsers: (page = 1, filters = {}) => 
    API.get(`/admin/users?page=${page}&limit=20`, { params: filters }),
  getUserDetails: (userId) => API.get(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => API.put(`/admin/users/${userId}/role`, { role }),
  deactivateUser: (userId, reason) => 
    API.post(`/admin/users/${userId}/deactivate`, { reason }),
  reactivateUser: (userId) => API.post(`/admin/users/${userId}/reactivate`),
  
  // Communities
  getAllCommunities: (page = 1, filters = {}) => 
    API.get(`/admin/communities?page=${page}&limit=20`, { params: filters }),
  getCommunityAnalytics: (communityId) => 
    API.get(`/admin/communities/${communityId}/analytics`),
  deactivateCommunity: (communityId, reason) => 
    API.post(`/admin/communities/${communityId}/deactivate`, { reason }),
  reactivateCommunity: (communityId) => 
    API.post(`/admin/communities/${communityId}/reactivate`),
  
  // Events
  getEventParticipants: (eventId, page = 1) => 
    API.get(`/admin/events/${eventId}/participants?page=${page}&limit=20`),
  exportParticipantsCSV: (eventId) => 
    API.get(`/admin/events/${eventId}/participants/export/csv`)
};

export default API;