export const ENV = {
  USE_API: import.meta.env.VITE_USE_API === 'true',
  API_URL: import.meta.env.VITE_API_URL || '/api'
};
