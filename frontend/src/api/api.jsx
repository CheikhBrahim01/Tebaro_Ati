import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Add token to headers for authenticated requests
API.interceptors.request.use((config) => {
  // List of endpoints that don't need authentication
  const publicEndpoints = [
    '/users/signup/',
    '/users/login/',
    '/users/verify-otp/',
    '/users/password-reset-request/'
  ];

  // Check if the current endpoint needs authentication
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    config.url.includes(endpoint)
  );

  if (!isPublicEndpoint) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

export default API;