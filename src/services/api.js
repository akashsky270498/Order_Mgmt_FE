import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const unwrapApiData = (response) => {
  const payload = response?.data?.data ?? response?.data;
  return Array.isArray(payload) && payload.length === 1 ? payload[0] : payload;
};

export const unwrapApiList = (response) => {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload)) {
    if (payload.length === 1 && Array.isArray(payload[0]?.results)) {
      return payload[0].results;
    }
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return payload ? [payload] : [];
};

export const getApiMeta = (response) => response?.data?.meta ?? {};

export const getApiMessage = (response, fallback = 'Request completed successfully.') => (
  response?.data?.msg || fallback
);

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (!data) {
    return error?.message || fallback;
  }

  if (data.msg) return data.msg;
  if (data.detail) return data.detail;

  const payload = Array.isArray(data.data) ? data.data[0] : data.data;
  if (payload && typeof payload === 'object') {
    const firstKey = Object.keys(payload)[0];
    const firstValue = payload[firstKey];
    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return fallback;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes('/auth/login/')
      || originalRequest?.url?.includes('/auth/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        const tokenData = unwrapApiData(res);
        localStorage.setItem('access_token', tokenData.access);
        originalRequest.headers.Authorization = `Bearer ${tokenData.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
