import api from './api';

const login = (email, password) => api.post('/auth/login/', { email, password });

const register = (payload) => api.post('/auth/register/', payload);

const refreshToken = (refresh) => api.post('/auth/refresh/', { refresh });

const logout = (refresh) => api.post('/auth/logout/', { refresh });

const profile = () => api.get('/auth/profile/');

export default {
  login,
  register,
  refreshToken,
  logout,
  profile,
};
