import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('nk_token', data.token);
      localStorage.setItem('nk_user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-emblem">⚖</div>
        <h1>Namadhu Kavalan</h1>
        <p>Tamil Nadu Police — Missing Persons System</p>
      </div>
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-sub">Access the secure portal</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
        <Link to="/" className="auth-link-back">← Back to Public Portal</Link>
      </div>
    </div>
  );
}
