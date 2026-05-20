import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, LogOut, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { path: '/products', label: 'Products', icon: <Package size={20} /> },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Package size={24} color="var(--primary-color)" />
          <span>OMS Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <div className="user-profile">
            <span style={{ fontWeight: 500 }}>{user?.username}</span>
            <div className="avatar">
              <User size={20} />
            </div>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', marginLeft: '1rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
