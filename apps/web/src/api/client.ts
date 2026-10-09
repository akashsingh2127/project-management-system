import axios from 'axios';

let resolvedBaseURL = import.meta.env.VITE_API_URL || '/api';
if (resolvedBaseURL !== '/api') {
  resolvedBaseURL = resolvedBaseURL.replace(/\/$/, ''); // remove trailing slash
  if (!resolvedBaseURL.endsWith('/api')) {
    resolvedBaseURL = `${resolvedBaseURL}/api`;
  }
}

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenProvider: (() => Promise<string | undefined>) | null = null;

export const setTokenProvider = (provider: () => Promise<string | undefined>) => {
  tokenProvider = provider;
};

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to get token for request', e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('unauthorized_api_error'));
    }
    return Promise.reject(error);
  }
);

// Retained for manual overrides if ever needed
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;
