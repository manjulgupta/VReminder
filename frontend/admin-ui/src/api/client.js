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

// 2️⃣ React to auth failures
// Force expiry to check if this works:
// Go to browser DevTools → Application → Local Storage; Find token; Corrupt it slightly.
// JWT contains iat (issued at) time and exp (expiration time) so server will reject it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;