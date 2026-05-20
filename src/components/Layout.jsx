import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, LogOut, Moon, Package, ShoppingCart, Sun, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
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
            <div className="user-copy">
              <span>{user?.first_name || user?.email}</span>
              <small>{user?.role}</small>
            </div>
            <div className="avatar">
              <User size={20} />
            </div>
            <button onClick={toggleTheme} className="icon-button" aria-label="Toggle dark mode" title="Toggle dark mode">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="btn btn-danger compact-btn">
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
