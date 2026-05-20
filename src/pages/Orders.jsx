import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import productService from '../services/productService';
import { getApiErrorMessage, getApiMessage, unwrapApiData, unwrapApiList } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Eye, Plus, RefreshCw, Search, ShoppingCart } from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'INVENTORY_RESERVED', 'PAYMENT_PROCESSING', 'COMPLETED', 'PAYMENT_FAILED', 'CANCELLED', 'OUT_OF_STOCK'];

const Orders = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wsStatus, setWsStatus] = useState('Disconnected');
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [draftItems, setDraftItems] = useState([{ product: '', quantity: 1 }]);

  const isAdmin = user?.role === 'ADMIN';

  const filteredOrders = useMemo(() => (
    orders.filter((order) => {
      const query = search.toLowerCase();
      return order.id?.toLowerCase().includes(query)
        || order.status?.toLowerCase().includes(query)
        || order.items?.some((item) => item.product_name?.toLowerCase().includes(query));
    })
  ), [orders, search]);

  const activeProducts = products.filter((product) => product.is_active && Number(product.stock_quantity) > 0);

  const loadOrders = async ({ showSuccess = false } = {}) => {
    setLoading(true);
    try {
      const response = await orderService.listOrders();
      setOrders(unwrapApiList(response));
      if (showSuccess) {
        toast.success(getApiMessage(response, 'Orders refreshed.'));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load orders.'));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.listProducts();
      setProducts(unwrapApiList(response));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load products for ordering.'));
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;

    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsBaseUrl}/ws/orders/${user.id}/`);

    ws.onopen = () => setWsStatus('Connected');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_status_update') {
        setOrders((current) => current.map((order) => (
          order.id === data.order_id ? { ...order, status: data.status } : order
        )));
        toast.info(`Order ${String(data.order_id).slice(0, 8)} moved to ${data.status}.`);
      }
    };
    ws.onerror = () => setWsStatus('Error');
    ws.onclose = () => setWsStatus('Disconnected');

    return () => ws.close();
  }, [user?.id]);

  const openCreateOrder = () => {
    setDraftItems([{ product: activeProducts[0]?.id || '', quantity: 1 }]);
    setModalMode('create');
  };

  const updateDraftItem = (index, field, value) => {
    setDraftItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const addDraftItem = () => {
    setDraftItems((current) => [...current, { product: activeProducts[0]?.id || '', quantity: 1 }]);
  };

  const removeDraftItem = (index) => {
    setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    const orderItems = draftItems
      .filter((item) => item.product && Number(item.quantity) > 0)
      .map((item) => ({ product: item.product, quantity: Number(item.quantity) }));

    if (!orderItems.length) {
      toast.error('Add at least one product to place an order.');
      return;
    }

    setSaving(true);
    try {
      const response = await orderService.createOrder({ order_items: orderItems });
      toast.success(getApiMessage(response, 'Order placed successfully.'));
      setModalMode(null);
      await Promise.all([loadOrders(), loadProducts()]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to place order.'));
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (order) => {
    setSelectedOrder(order);
    setModalMode('details');
    try {
      const response = await orderService.getOrder(order.id);
      setSelectedOrder(unwrapApiData(response));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load order details.'));
    }
  };

  const updateStatus = async (order, status) => {
    try {
      const response = await orderService.updateOrderStatus(order.id, status);
      const updatedOrder = unwrapApiData(response);
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...updatedOrder } : item));
      toast.success(getApiMessage(response, 'Order status updated successfully.'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update order status.'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Create orders, track reservations, and manage fulfillment status.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateOrder} disabled={!activeProducts.length}>
          <Plus size={18} />
          New Order
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders" />
        </div>
        <div className="toolbar-actions">
          <span className={`badge ${wsStatus === 'Connected' ? 'badge-success' : wsStatus === 'Error' ? 'badge-danger' : 'badge-warning'}`}>
            WebSocket: {wsStatus}
          </span>
          <button className="btn btn-ghost" onClick={() => loadOrders({ showSuccess: true })}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Created</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="muted-cell">Loading orders...</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="stacked-cell">
                      <strong>{order.id?.slice(0, 8)}...</strong>
                      <span>{order.user ? `User ${String(order.user).slice(0, 8)}` : 'Current user'}</span>
                    </div>
                  </td>
                  <td>
                    {isAdmin ? (
                      <select className="status-select" value={order.status} onChange={(event) => updateStatus(order, event.target.value)}>
                        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    ) : (
                      <span className={`badge status-${order.status?.toLowerCase().replaceAll('_', '-')}`}>
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</td>
                  <td>
                    <button className="icon-button" onClick={() => openDetails(order)} aria-label="View order">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredOrders.length === 0 && (
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Place an order or adjust your search."
              action={<button className="btn btn-primary" onClick={openCreateOrder} disabled={!activeProducts.length}><Plus size={18} />New Order</button>}
            />
          )}
        </div>
      </div>

      {modalMode === 'create' && (
        <Modal
          title="Create Order"
          onClose={() => setModalMode(null)}
          footer={(
            <>
              <button className="btn btn-ghost" onClick={() => setModalMode(null)} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={submitOrder} disabled={saving || !activeProducts.length} type="button">
                {saving ? 'Placing...' : 'Place Order'}
              </button>
            </>
          )}
        >
          {activeProducts.length ? (
            <form className="order-form" onSubmit={submitOrder}>
              {draftItems.map((item, index) => (
                <div className="order-item-row" key={`${item.product}-${index}`}>
                  <select className="form-control" value={item.product} onChange={(event) => updateDraftItem(index, 'product', event.target.value)} required>
                    {activeProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${Number(product.price || 0).toFixed(2)} ({product.stock_quantity} left)
                      </option>
                    ))}
                  </select>
                  <input className="form-control qty-input" type="number" min="1" value={item.quantity} onChange={(event) => updateDraftItem(index, 'quantity', event.target.value)} required />
                  <button className="icon-button danger-icon" type="button" onClick={() => removeDraftItem(index)} disabled={draftItems.length === 1}>
                    x
                  </button>
                </div>
              ))}
              <button className="btn btn-ghost" type="button" onClick={addDraftItem}>
                <Plus size={16} />
                Add Item
              </button>
            </form>
          ) : (
            <EmptyState icon={ShoppingCart} title="No active stock" description="Create an active product with stock before placing orders." />
          )}
        </Modal>
      )}

      {modalMode === 'details' && selectedOrder && (
        <Modal title="Order Details" onClose={() => setModalMode(null)}>
          <div className="detail-grid">
            <span>Order ID</span><strong>{selectedOrder.id}</strong>
            <span>Status</span><strong>{selectedOrder.status}</strong>
            <span>Total</span><strong>${Number(selectedOrder.total_amount || 0).toFixed(2)}</strong>
            <span>Created</span><strong>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}</strong>
          </div>
          <div className="line-items">
            <h3>Items</h3>
            {(selectedOrder.items || []).map((item) => (
              <div className="line-item" key={item.id}>
                <span>{item.product_name}</span>
                <strong>{item.quantity} x ${Number(item.price_at_time || 0).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
