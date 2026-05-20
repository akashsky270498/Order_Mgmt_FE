import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Edit3, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getApiErrorMessage, getApiMessage, unwrapApiList } from '../services/api';
import userService from '../services/userService';

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  role: 'CUSTOMER',
  is_active: true,
  password: '',
};

const Users = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

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

  const openCreate = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedUser(item);
    setForm({
      email: item.email || '',
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      role: item.role || 'CUSTOMER',
      is_active: Boolean(item.is_active),
      password: '',
    });
    setModalOpen(true);
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (selectedUser && !payload.password) {
      delete payload.password;
    }

    try {
      const response = selectedUser
        ? await userService.updateUser(selectedUser.id, payload)
        : await userService.createUser(payload);
      toast.success(getApiMessage(response, selectedUser ? 'User updated successfully.' : 'User created successfully.'));
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save user.'));
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (item) => {
    setSelectedUser(item);
    setConfirmOpen(true);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const response = await userService.deleteUser(selectedUser.id);
      toast.success(getApiMessage(response, 'User deleted successfully.'));
      setConfirmOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage customer and admin accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="muted-cell">Loading users...</td>
                </tr>
              ) : filteredUsers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="stacked-cell">
                      <strong>{item.email}</strong>
                      <span>{[item.first_name, item.last_name].filter(Boolean).join(' ') || 'No name'}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{item.role}</span></td>
                  <td>
                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-button" onClick={() => openEdit(item)} aria-label="Edit user">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-button danger-icon" onClick={() => openDelete(item)} disabled={item.id === user.id} aria-label="Delete user">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="Create a user or adjust the search filter."
              action={<button className="btn btn-primary" onClick={openCreate}><Plus size={18} />Add User</button>}
            />
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={selectedUser ? 'Edit User' : 'Add User'}
          onClose={() => setModalOpen(false)}
          footer={(
            <>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={submitUser} disabled={saving} type="button">
                {saving ? 'Saving...' : 'Save User'}
              </button>
            </>
          )}
        >
          <form className="form-grid" onSubmit={submitUser}>
            <div className="form-group full-span">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{selectedUser ? 'New Password' : 'Password'}</label>
              <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!selectedUser} />
            </div>
            <label className="toggle-row full-span">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
              <span>User account is active</span>
            </label>
          </form>
        </Modal>
      )}

      {confirmOpen && selectedUser && (
        <ConfirmDialog
          title="Delete User"
          message={`Delete ${selectedUser.email}?`}
          confirmLabel="Delete User"
          loading={saving}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={deleteUser}
        />
      )}
    </div>
  );
};

export default Users;
