import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RefreshCw, Search } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('Disconnected');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // We need user id for WebSocket connection
    const fetchUserAndOrders = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/auth/profile/'),
          api.get('/orders/')
        ]);
        setUser(profileRes.data);
        setOrders(ordersRes.data.results || ordersRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };
    fetchUserAndOrders();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    // Connect to WebSocket for real-time status updates
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const wsUrl = `${wsBaseUrl}/ws/orders/${user.id}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus('Connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_status_update') {
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === data.order_id) {
            return { ...order, status: data.status };
          }
          return order;
        }));
      }
    };

    ws.onclose = () => {
      setWsStatus('Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Orders</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            WebSocket: 
            <span className={`badge ${wsStatus === 'Connected' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '0.5rem' }}>
              {wsStatus}
            </span>
          </span>
          <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }} onClick={refreshOrders}>
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
                <th>Order ID</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.id}</td>
                  <td>
                    <span className={`badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
