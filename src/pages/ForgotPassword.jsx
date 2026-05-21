import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, ArrowLeft } from 'lucide-react';
import { getApiErrorMessage, getApiMessage } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import userService from '../services/userService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.forgotPassword({ email });
      toast.success(getApiMessage(response, 'Password reset link sent to your email.'));
      setSubmitted(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send reset link.'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Mail size={48} />
          </div>
          <h2 className="auth-title">Check Your Email</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and click the link to reset your password.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Package size={48} />
        </div>
        <h2 className="auth-title">Forgot Password?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <Mail size={20} />
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Remember your password? <Link to="/login" style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--primary-color)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
