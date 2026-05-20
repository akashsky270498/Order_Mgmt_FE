import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import productService from '../services/productService';
import { getApiErrorMessage, getApiMessage, unwrapApiData, unwrapApiList } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Edit3, Eye, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock_quantity: 0,
  is_active: true,
};

const Products = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = user?.role === 'ADMIN';

  const filteredProducts = useMemo(() => (
    products.filter((product) => {
      const query = search.toLowerCase();
      return product.name?.toLowerCase().includes(query)
        || product.description?.toLowerCase().includes(query);
    })
  ), [products, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.listProducts();
      setProducts(unwrapApiList(response));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setSelectedProduct(null);
    setModalMode('form');
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity ?? 0,
      is_active: Boolean(product.is_active),
    });
    setModalMode('form');
  };

  const openDetails = async (product) => {
    setSelectedProduct(product);
    setModalMode('details');
    try {
      const response = await productService.getProduct(product.id);
      setSelectedProduct(unwrapApiData(response));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load product details.'));
    }
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    };

    try {
      const response = selectedProduct
        ? await productService.updateProduct(selectedProduct.id, payload)
        : await productService.createProduct(payload);
      toast.success(getApiMessage(response, selectedProduct ? 'Product updated successfully.' : 'Product created successfully.'));
      setModalMode(null);
      await loadProducts();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save product.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await productService.deleteProduct(product.id);
      toast.success(getApiMessage(response, 'Product deleted successfully.'));
      await loadProducts();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete product.'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage catalog availability, pricing, and stock.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
          />
        </div>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="muted-cell">Loading products...</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="stacked-cell">
                      <strong>{product.name}</strong>
                      <span>{product.description || 'No description'}</span>
                    </div>
                  </td>
                  <td>${Number(product.price || 0).toFixed(2)}</td>
                  <td>{product.stock_quantity}</td>
                  <td>
                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{product.updated_at ? new Date(product.updated_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" onClick={() => openDetails(product)} aria-label="View product">
                        <Eye size={16} />
                      </button>
                      {isAdmin && (
                        <>
                          <button className="icon-button" onClick={() => openEdit(product)} aria-label="Edit product">
                            <Edit3 size={16} />
                          </button>
                          <button className="icon-button danger-icon" onClick={() => deleteProduct(product)} aria-label="Delete product">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredProducts.length === 0 && (
            <EmptyState
              icon={PackageOpen}
              title="No products found"
              description="Create a product or adjust the search filter."
              action={isAdmin ? <button className="btn btn-primary" onClick={openCreate}><Plus size={18} />Add Product</button> : null}
            />
          )}
        </div>
      </div>

      {modalMode === 'form' && (
        <Modal
          title={selectedProduct ? 'Edit Product' : 'Add Product'}
          onClose={() => setModalMode(null)}
          footer={(
            <>
              <button className="btn btn-ghost" onClick={() => setModalMode(null)} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={submitProduct} disabled={saving} type="button">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </>
          )}
        >
          <form className="form-grid" onSubmit={submitProduct}>
            <div className="form-group full-span">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="form-group full-span">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Price</label>
              <input className="form-control" type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input className="form-control" type="number" min="0" value={form.stock_quantity} onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })} required />
            </div>
            <label className="toggle-row full-span">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
              <span>Product is active</span>
            </label>
          </form>
        </Modal>
      )}

      {modalMode === 'details' && selectedProduct && (
        <Modal title="Product Details" onClose={() => setModalMode(null)}>
          <div className="detail-grid">
            <span>Name</span><strong>{selectedProduct.name}</strong>
            <span>Description</span><strong>{selectedProduct.description || 'No description'}</strong>
            <span>Price</span><strong>${Number(selectedProduct.price || 0).toFixed(2)}</strong>
            <span>Stock</span><strong>{selectedProduct.stock_quantity}</strong>
            <span>Status</span><strong>{selectedProduct.is_active ? 'Active' : 'Inactive'}</strong>
            <span>Created</span><strong>{selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleString() : '-'}</strong>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Products;
