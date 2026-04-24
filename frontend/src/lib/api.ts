import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : undefined);

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required in production.');
}

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
