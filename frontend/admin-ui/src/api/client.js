import axios from 'axios';

// HARD CODED URL::
// const api = axios.create({
//   // baseURL: 'http://72.61.242.19:4000/api',
//   baseURL: 'http://localhost:4000/api',
// });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;