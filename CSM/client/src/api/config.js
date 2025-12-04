import axios from 'axios';

// Determine API base URL based on environment
const HOSTED_FRONTEND = 'csm.defitex2.0.org';
const HOSTED_API = 'https://api-csm.defitex2.0.org';

// In development (Vite), we use the proxy which redirects /api to localhost:5000
// When the app is served from the CSM subdomain, call the hosted API domain.
const getApiBaseUrl = () => {
  const { hostname, pathname } = window.location;

  if (hostname === HOSTED_FRONTEND) {
    return HOSTED_API;
  }

  // Legacy unified deployment (same origin under /csm path)
  if (pathname.startsWith('/csm')) {
    return '/api/csm';
  }

  // Development mode - relative path (proxy handles it)
  return '/api';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiBaseUrl()
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


