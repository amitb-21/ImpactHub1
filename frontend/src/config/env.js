export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050',
  ENV: import.meta.env.VITE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.VITE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.VITE_ENV === 'development'
};

export default config;