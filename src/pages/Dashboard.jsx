import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingCart, Package, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders/'),
          api.get('/products/')
        ]);
        
        setStats({
          totalOrders: ordersRes.data.count || ordersRes.data.length || 0,
          totalProducts: productsRes.data.count || productsRes.data.length || 0,
          recentOrders: (ordersRes.data.results || ordersRes.data).slice(0, 5)
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <Package size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Activity size={24} />
          </div>
          <div className="stat-details">
            <h3>System Status</h3>
            <p style={{ fontSize: '1.25rem', color: '#059669' }}>Healthy</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Orders</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.id.split('-')[0]}...</td>
                  <td>
                    <span className={`badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>${order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No recent orders found
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

export default Dashboard;
