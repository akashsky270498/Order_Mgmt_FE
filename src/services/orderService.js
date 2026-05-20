import api from './api';

const listOrders = () => api.get('/orders/');

const getOrder = (orderId) => api.get(`/orders/${orderId}/`);

const createOrder = (payload) => api.post('/orders/', payload);

const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status/`, { status });

export default {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
};
