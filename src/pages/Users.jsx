import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, Users as UsersIcon, ToggleRight } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getApiErrorMessage, getApiMessage, unwrapApiList } from '../services/api';
import userService from '../services/userService';

const Users = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => (
    users.filter((item) => {
      const query = search.toLowerCase();
      return item.email?.toLowerCase().includes(query)
        || item.first_name?.toLowerCase().includes(query)
        || item.last_name?.toLowerCase().includes(query)
        || item.role?.toLowerCase().includes(query);
    })
  ), [users, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.listUsers();
      setUsers(unwrapApiList(response));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [user?.role]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const openToggleConfirm = (item) => {
    setSelectedUser(item);
    setConfirmOpen(true);
  };

  const toggleUserStatus = async () => {
    if (!selectedUser) return;
    setToggling(true);
    try {
      const response = await userService.toggleUserStatus(selectedUser.id);
      toast.success(getApiMessage(response, `User ${selectedUser.is_active ? 'deactivated' : 'activated'} successfully.`));
      setConfirmOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to toggle user status.'));
    } finally {
      setToggling(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage user accounts - activate or deactivate users.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users by email or name" />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="muted-cell">Loading users...</td>
                </tr>
              ) : filteredUsers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{[item.first_name, item.last_name].filter(Boolean).join(' ') || 'No name'}</strong>
                  </td>
                  <td>{item.email}</td>
                  <td><span className="badge badge-info">{item.role}</span></td>
                  <td>
                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <button 
                      className={`btn ${item.is_active ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => openToggleConfirm(item)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      <ToggleRight size={16} />
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="Adjust the search filter to find users."
            />
          )}
        </div>
      </div>

      {confirmOpen && selectedUser && (
        <ConfirmDialog
          title={`${selectedUser.is_active ? 'Deactivate' : 'Activate'} User`}
          message={`${selectedUser.is_active ? 'Deactivate' : 'Activate'} ${selectedUser.email}? ${selectedUser.is_active ? 'They will not be able to login.' : 'They will be able to login again.'}`}
          confirmLabel={selectedUser.is_active ? 'Deactivate' : 'Activate'}
          loading={toggling}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={toggleUserStatus}
        />
      )}
    </div>
  );
};

export default Users;
