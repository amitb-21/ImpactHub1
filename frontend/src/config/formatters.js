// Format points display
export const formatPoints = (points) => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value, total) => {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// Format capacity
export const formatCapacity = (registered, total) => {
  if (!total) return `${registered} registered`;
  return `${registered}/${total} (${formatPercentage(registered, total)})`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
