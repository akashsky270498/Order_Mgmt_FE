import React, { useEffect, useState } from 'react';
import orderService from '../services/orderService';
import productService from '../services/productService';
import { getApiErrorMessage, getApiMeta, unwrapApiList } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Activity, Package, ShoppingCart, WalletCards } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
    revenue: 0
  });
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          orderService.listOrders(),
          productService.listProducts()
        ]);
        
        const orders = unwrapApiList(ordersRes);
        const products = unwrapApiList(productsRes);
        const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

        setStats({
          totalOrders: getApiMeta(ordersRes).count || orders.length,
          totalProducts: getApiMeta(productsRes).count || products.length,
          recentOrders: orders.slice(0, 5),
          revenue
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        toast.error(getApiErrorMessage(err, 'Failed to load dashboard.'));
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
          <div className="stat-icon warning-icon">
            <WalletCards size={24} />
          </div>
          <div className="stat-details">
            <h3>Order Value</h3>
            <p>${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="status-strip">
        <Activity size={18} />
        <span>System status</span>
        <strong>Healthy</strong>
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
                    <span className={`badge status-${order.status.toLowerCase().replaceAll('_', '-')}`}>
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
