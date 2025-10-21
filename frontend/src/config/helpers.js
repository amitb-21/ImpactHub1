export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'Just now';
};

// Coordinate helpers for Leaflet (reverse backend coordinates)
export const reverseCoordinates = (coords) => {
  // Backend gives [lng, lat], Leaflet needs [lat, lng]
  if (!coords || coords.length !== 2) return [0, 0];
  return [coords[1], coords[0]];
};

export const formatCoordinates = (lat, lng) => {
  // Convert to GeoJSON format for backend
  return {
    type: 'Point',
    coordinates: [lng, lat] // [longitude, latitude]
  };
};

// Calculate user rank based on points
export const calculateRank = (points) => {
  const ranks = [
    { min: 5000, name: 'Legend', color: '#ef4444' },
    { min: 3000, name: 'Champion', color: '#f59e0b' },
    { min: 1500, name: 'Leader', color: '#8b5cf6' },
    { min: 500, name: 'Contributor', color: '#3b82f6' },
    { min: 0, name: 'Beginner', color: '#10b981' }
  ];

  return ranks.find(rank => points >= rank.min);
};

// Calculate community tier
export const calculateTier = (points) => {
  const tiers = [
    { min: 10000, name: 'Diamond', color: '#b9f2ff' },
    { min: 5000, name: 'Platinum', color: '#e5e4e2' },
    { min: 2500, name: 'Gold', color: '#ffd700' },
    { min: 1000, name: 'Silver', color: '#c0c0c0' },
    { min: 0, name: 'Bronze', color: '#cd7f32' }
  ];

  return tiers.find(tier => points >= tier.min);
};

// Number formatting
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};