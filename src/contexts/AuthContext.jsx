import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getApiMessage, unwrapApiData } from '../services/api';
import { useToast } from './ToastContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await authService.profile();
          setUser(unwrapApiData(res));
        } catch (err) {
          console.error('Failed to fetch profile', err);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const tokenData = unwrapApiData(res);
    localStorage.setItem('access_token', tokenData.access);
    localStorage.setItem('refresh_token', tokenData.refresh);
    const profileRes = await authService.profile();
    setUser(unwrapApiData(profileRes));
    toast.success(getApiMessage(res, 'Logged in successfully.'));
    navigate('/');
  };

  const register = async (email, password, firstName, lastName, role) => {
    await authService.register({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role
    });
    toast.success('Account created successfully. Please sign in.');
    navigate('/login');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
