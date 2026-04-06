import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './ReportMissing.css';

const DISTRICTS = ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Vellore','Erode','Tiruppur','Dindigul','Thanjavur','Ranipet','Kancheepuram','Dharmapuri','Krishnagiri','Namakkal','Karur','Nilgiris','Pudukkottai','Ramanathapuram','Theni','Thoothukudi','Kanyakumari','Chengalpattu','Tenkasi','Mayiladuthurai'];

export default function ReportMissing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('nk_token');
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ name: '', age: '', gender: '', district: '', address: '', lastSeenDate: '', lastSeenPlace: '', identifyingMarks: '', bloodGroup: '', phone: '', description: '' });
  const [photo,   setPhoto]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  if (!token) return (
    <div><Navbar />
      <div className="report-page">
        <div className="login-required">
          <div className="lr-icon">🔒</div>
          <h2>Login Required</h2>
          <p>You must be logged in to report a missing person.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Continue</button>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const personRes = await api.post('/persons', { ...form, type: 'missing' });
      const personId  = personRes.data._id;
      if (photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        await api.post(`/persons/${personId}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSuccess(`Report submitted successfully! Case ID: ${personId}`);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div><Navbar />
      <div className="report-page">
        <div className="report-header">
          <h1>Report a Missing Person</h1>
          <p>All information is kept confidential and shared only with police authorities.</p>
        </div>

        <div className="report-steps">
          {[1,2,3].map(s => (
            <div key={s} className={`rstep ${step >= s ? 'active' : ''}`}>
              <div className="rstep-num">{step > s ? '✓' : s}</div>
              <div className="rstep-label">{s === 1 ? 'Person Details' : s === 2 ? 'Photo & Submit' : 'Confirmation'}</div>
            </div>
          ))}
        </div>

        {error && <div className="report-error">{error}</div>}

        {step === 1 && (
          <div className="report-card">
            <h2>Personal Information</h2>
            <div className="report-grid">
              <div className="field"><label>Full Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name of missing person" required /></div>
              <div className="field"><label>Age</label><input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" /></div>
              <div className="field"><label>Gender</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div className="field"><label>District *</label>
                <select value={form.district} onChange={e => setForm({...form, district: e.target.value})} required>
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="field"><label>Last Seen Date</label><input type="date" value={form.lastSeenDate} onChange={e => setForm({...form, lastSeenDate: e.target.value})} /></div>
              <div className="field"><label>Last Seen Place</label><input value={form.lastSeenPlace} onChange={e => setForm({...form, lastSeenPlace: e.target.value})} placeholder="Last known location" /></div>
              <div className="field"><label>Blood Group</label>
                <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}>
                  <option value="">Unknown</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="field"><label>Contact Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="field full"><label>Identifying Marks</label><input value={form.identifyingMarks} onChange={e => setForm({...form, identifyingMarks: e.target.value})} placeholder="Scars, tattoos, birthmarks, etc." /></div>
              <div className="field full"><label>Address</label><textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Home address" /></div>
            </div>
            <button className="btn btn-primary" onClick={() => { if (!form.name || !form.district) return setError('Name and district are required'); setError(''); setStep(2); }}>Next: Add Photo →</button>
          </div>
        )}

        {step === 2 && (
          <div className="report-card">
            <h2>Upload Photo</h2>
            <p className="step-desc">A clear face photo helps our AI match the person against the database.</p>
            <div className="photo-upload-area">
              {preview ? (
                <div className="photo-preview">
                  <img src={preview} alt="Preview" />
                  <button className="btn btn-ghost" onClick={() => { setPhoto(null); setPreview(null); }}>Change Photo</button>
                </div>
              ) : (
                <label className="photo-upload-label">
                  <div style={{ fontSize: '3rem' }}>📷</div>
                  <div style={{ fontWeight: 600 }}>Click to upload photo</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>JPG or PNG, max 10MB</div>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f) { setPhoto(f); setPreview(URL.createObjectURL(f)); } }} hidden />
                </label>
              )}
            </div>
            <div className="report-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : '✓ Submit Report'}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="report-card success-card">
            <div className="success-icon">✅</div>
            <h2>Report Submitted Successfully</h2>
            <p>{success}</p>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: '0.5rem' }}>A police officer will review your report and contact you within 24 hours.</p>
            <div className="report-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => navigate('/search')}>Search Database</button>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
