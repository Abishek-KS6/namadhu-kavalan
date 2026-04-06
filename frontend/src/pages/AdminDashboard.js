import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nk_user') || '{}');
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [tab,   setTab]   = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, casesRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/cases'),
        ]);
        setStats(statsRes.data);
        setCases(casesRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nk_token');
    localStorage.removeItem('nk_user');
    navigate('/login');
  };

  return (
    <div>
      <Navbar />
      <div className="admin-page">
        <aside className="admin-sidebar">
          <div className="admin-profile">
            <div className="admin-avatar">{user.name?.[0]}</div>
            <div>
              <div className="admin-name">{user.name}</div>
              <span className="badge badge-blue">Admin</span>
            </div>
          </div>
          <nav className="admin-nav">
            {[['overview','📊 Overview'],['cases','📁 All Cases'],['officers','👮 Officers']].map(([t,l]) => (
              <button key={t} className={`anav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{l}</button>
            ))}
          </nav>
          <button className="btn btn-ghost" style={{marginTop:'auto',fontSize:12}} onClick={handleLogout}>Logout</button>
        </aside>

        <main className="admin-main">
          {tab === 'overview' && stats && (
            <>
              <h1 className="admin-title">System Overview</h1>
              <div className="stats-grid">
                {[
                  { label: 'Active Missing', value: stats.totalMissing, color: '#c81e1e', bg: '#fef2f2' },
                  { label: 'Unidentified', value: stats.totalUnidentified, color: '#92400e', bg: '#fffbeb' },
                  { label: 'Total Cases', value: stats.totalCases, color: '#1a56db', bg: '#eff6ff' },
                  { label: 'Resolved Cases', value: stats.resolvedCases, color: '#057a55', bg: '#f0fdf4' },
                  { label: 'Active Officers', value: stats.totalOfficers, color: '#5b21b6', bg: '#f5f3ff' },
                  { label: 'Found Persons', value: stats.missingFound, color: '#057a55', bg: '#f0fdf4' },
                ].map((s, i) => (
                  <div className="stat-card" key={i} style={{ borderLeft: `3px solid ${s.color}` }}>
                    <div className="stat-value" style={{ color: s.color }}>{s.value ?? '—'}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h2 className="section-title">Recent Cases</h2>
              <div className="cases-table">
                <div className="table-header">
                  <span>Case Number</span><span>Title</span><span>District</span><span>Status</span><span>Priority</span>
                </div>
                {stats.recentCases?.map(c => (
                  <div className="table-row" key={c._id} onClick={() => navigate(`/cases/${c._id}`)}>
                    <span className="mono">{c.caseNumber}</span>
                    <span>{c.title}</span>
                    <span>{c.district}</span>
                    <span><span className={`badge ${c.status === 'open' ? 'badge-red' : c.status === 'resolved' ? 'badge-green' : 'badge-yellow'}`}>{c.status}</span></span>
                    <span><span className={`badge ${c.priority === 'critical' ? 'badge-red' : c.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{c.priority}</span></span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'cases' && (
            <>
              <h1 className="admin-title">All Cases</h1>
              <div className="cases-table">
                <div className="table-header">
                  <span>Case Number</span><span>Title</span><span>District</span><span>Status</span><span>Type</span>
                </div>
                {cases.map(c => (
                  <div className="table-row" key={c._id} onClick={() => navigate(`/cases/${c._id}`)}>
                    <span className="mono">{c.caseNumber}</span>
                    <span>{c.title}</span>
                    <span>{c.district}</span>
                    <span><span className={`badge ${c.status === 'open' ? 'badge-red' : c.status === 'resolved' ? 'badge-green' : 'badge-yellow'}`}>{c.status.replace('_',' ')}</span></span>
                    <span className="type-cell">{c.type === 'missing_person' ? '👤 Missing' : '🔍 Unidentified'}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'officers' && (
            <div>
              <h1 className="admin-title">Officer Management</h1>
              <p style={{color:'var(--text2)',fontSize:13}}>Officer approval and management coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
