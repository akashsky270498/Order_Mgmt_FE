import api from './api';

const listUsers = () => api.get('/users/');

const getUser = (userId) => api.get(`/users/${userId}/`);

const createUser = (payload) => api.post('/users/', payload);

const updateUser = (userId, payload) => api.patch(`/users/${userId}/`, payload);

const deleteUser = (userId) => api.delete(`/users/${userId}/`);

export default {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
