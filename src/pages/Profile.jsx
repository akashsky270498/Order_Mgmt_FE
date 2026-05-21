import React, { useState, useContext, useEffect } from 'react';
import { User, Save, Lock, LogOut } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getApiErrorMessage, getApiMessage } from '../services/api';
import userService from '../services/userService';
import authService from '../services/authService';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateProfile(profileForm);
      toast.success(getApiMessage(response, 'Profile updated successfully.'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword(passwordForm);
      toast.success(getApiMessage(response, 'Password changed successfully.'));
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await authService.logout(refresh);
      logout();
      toast.success('Logged out successfully.');
    } catch (err) {
      logout();
      toast.success('Logged out successfully.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings.</p>
        </div>
      </div>

      <div className="card">
        <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'profile' ? '600' : '400',
              color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary-color)' : 'none',
            }}
          >
            <User size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'password' ? '600' : '400',
              color: activeTab === 'password' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'password' ? '2px solid var(--primary-color)' : 'none',
            }}
          >
            <Lock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Password
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={submitProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Email cannot be changed
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-control"
                value={user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Role is assigned by administrator
              </small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '2rem' }}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={submitPasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                name="old_password"
                value={passwordForm.old_password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                Password must be at least 8 characters
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '2rem' }}>
              <Lock size={18} />
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Account Actions</h3>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
