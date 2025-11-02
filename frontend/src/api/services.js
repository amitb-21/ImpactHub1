import API from './client';

// ===== AUTH =====
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getCurrentUser: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
  googleLogin: () => {
    window.location.href = `${API.defaults.baseURL}/auth/google`;
  },
  handleGoogleCallback: (token) => {
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
  update: (id, data) => API.put(`/communities/${id}`, data),
  join: (id) => API.post(`/communities/${id}/join`),
  leave: (id) => API.post(`/communities/${id}/leave`),
  getVerificationStatus: (id) => API.get(`/communities/${id}/verification-status`),
  getMembers: (communityId, page = 1) => 
    API.get(`/communities/${communityId}/members?page=${page}&limit=20`)
};

// ===== COMMUNITY MANAGER APPLICATIONS =====
export const communityManagerAPI = {
  apply: (data) => API.post('/community-manager/apply', data),
  getMyApplication: () => API.get('/community-manager/my-application'),
  getApplicationHistory: (page = 1) => 
    API.get(`/community-manager/my-history?page=${page}&limit=10`),
  
  // Admin endpoints
  getPendingApplications: (page = 1) => 
    API.get(`/community-manager/admin/pending?page=${page}&limit=20`),
  viewApplication: (applicationId) => 
    API.get(`/community-manager/admin/${applicationId}`),
  approveApplication: (applicationId, approvalNotes) => 
    API.post(`/community-manager/admin/${applicationId}/approve`, { approvalNotes }),
  rejectApplication: (applicationId, rejectionReason) => 
    API.post(`/community-manager/admin/${applicationId}/reject`, { rejectionReason })
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
    API.get(`/participations/user/${userId}/wishlist?page=${page}&limit=10`),
  getParticipationDetails: (participationId) => 
    API.get(`/participations/${participationId}`)
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
// ===== CALENDAR =====
export const calendarAPI = {
  getInviteURLs: (eventId) => API.get(`/events/${eventId}/calendar-urls`),
  downloadICS: (eventId) => API.get(`/events/${eventId}/calendar.ics`, {
    responseType: 'blob'
  }).then(response => {
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event-${eventId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return response;
  })
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
  getByCategory: (category, page = 1) => 
    API.get(`/resources/category/${category}?page=${page}&limit=10`),
  like: (id) => API.post(`/resources/${id}/like`),
  unlike: (id) => API.post(`/resources/${id}/unlike`),
  
  // Admin endpoints
  getPending: (page = 1) => 
    API.get(`/resources/admin/pending?page=${page}&limit=20`),
  approve: (id, notes) => 
    API.post(`/resources/${id}/approve`, { notes }),
  reject: (id, rejectionReason) => 
    API.post(`/resources/${id}/reject`, { rejectionReason }),
  toggleFeatured: (id) => API.post(`/resources/${id}/feature`),
  getStats: () => API.get('/resources/admin/stats')
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
    API.post(`/verifications/${verificationId}/reject`, { rejectionReason, notes }),
  getVerificationHistory: (page = 1, status = null) => {
    const params = { page, limit: 20 };
    if (status) params.status = status;
    return API.get(`/verifications/admin/history`, { params });
  }
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