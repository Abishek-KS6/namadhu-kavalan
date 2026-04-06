import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

const DISTRICTS = ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Vellore','Erode','Tiruppur','Dindigul','Thanjavur','Ranipet','Sivaganga','Virudhunagar','Nagapattinam','Cuddalore','Villupuram','Kancheepuram','Dharmapuri','Krishnagiri','Namakkal','Perambalur','Ariyalur','Karur','Nilgiris','Pudukkottai','Ramanathapuram','Theni','Thoothukudi','Thiruvarur','Kanyakumari','Kallakurichi','Chengalpattu','Tenkasi','Mayiladuthurai'];

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'public', badgeNumber: '', district: '', phone: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      if (form.role === 'officer') {
        setSuccess('Registration submitted! Await admin approval before logging in.');
      } else {
        localStorage.setItem('nk_token', data.token);
        localStorage.setItem('nk_user', JSON.stringify(data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <h2>Create Account</h2>
        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success} <Link to="/login">Login</Link></div>}
        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="field">
              <label>Account Type</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="public">Public / Family Member</option>
                <option value="officer">Police Officer</option>
              </select>
            </div>
            {form.role === 'officer' && (
              <>
                <div className="field">
                  <label>Badge Number</label>
                  <input type="text" value={form.badgeNumber} onChange={e => setForm({...form, badgeNumber: e.target.value})} placeholder="TN-XXXX-XXXXX" required />
                </div>
                <div className="field">
                  <label>District</label>
                  <select value={form.district} onChange={e => setForm({...form, district: e.target.value})} required>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}
        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
