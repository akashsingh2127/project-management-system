import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401s are handled at the UI/Query level usually, but we could broadcast an event
    if (error.response?.status === 401) {
      console.warn('Unauthorized request intercepted.');
    }
    return Promise.reject(error);
  }
);

export default api;
