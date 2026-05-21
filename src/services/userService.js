import api from './api';

const listUsers = () => api.get('/users/');

// Admin - toggle user active/inactive status
const toggleUserStatus = (userId) => api.patch(`/users/${userId}/toggle-status/`);

// User self-profile management
const updateProfile = (payload) => api.patch('/users/profile/update/', payload);

const changePassword = (payload) => api.post('/users/profile/change-password/', payload);

export default {
  listUsers,
  toggleUserStatus,
  updateProfile,
  changePassword,
};
