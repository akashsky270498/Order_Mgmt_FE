import api from './api';

const listProducts = () => api.get('/products/');

const getProduct = (productId) => api.get(`/products/${productId}/`);

const createProduct = (payload) => api.post('/products/', payload);

const updateProduct = (productId, payload) => api.patch(`/products/${productId}/`, payload);

const deleteProduct = (productId) => api.delete(`/products/${productId}/`);

export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
