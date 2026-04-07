import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://namadhu-kavalan-backend.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nk_token');
      localStorage.removeItem('nk_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
