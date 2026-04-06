import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './OfficerDashboard.css';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nk_user') || '{}');
  const [cases,   setCases]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('cases');
  const [filter,  setFilter]  = useState('open');
  const [showNew, setShowNew] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', type: 'missing_person', priority: 'medium', district: user.district || '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      const [casesRes, statsRes] = await Promise.all([
        api.get(`/cases?status=${filter}`),
        api.get('/stats/summary'),
      ]);
      setCases(casesRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/cases', newCase);
      setCases(prev => [data, ...prev]);
      setShowNew(false);
      setNewCase({ title: '', type: 'missing_person', priority: 'medium', district: user.district || '', description: '' });
    } catch (err) { alert(err.response?.data?.message || 'Failed to create case'); }
  };

  const priorityColor = (p) => ({ low: 'badge-gray', medium: 'badge-blue', high: 'badge-yellow', critical: 'badge-red' }[p] || 'badge-gray');
  const statusColor   = (s) => ({ open: 'badge-red', under_investigation: 'badge-yellow', resolved: 'badge-green', closed: 'badge-gray' }[s] || 'badge-gray');

  return (
    <div>
      <Navbar />
      <div className="officer-page">
        {/* Sidebar */}
        <aside className="officer-sidebar">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">{user.name?.[0]}</div>
            <div className="sidebar-info">
              <div className="sidebar-name">{user.name}</div>
              <div className="sidebar-badge">{user.badgeNumber || 'Officer'}</div>
              <div className="sidebar-district">📍 {user.district}</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {[['cases','📁 My Cases'],['persons','👤 Persons'],['search','🔍 Search']].map(([t,l]) => (
              <button key={t} className={`snav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{l}</button>
            ))}
          </nav>
          {stats && (
            <div className="sidebar-stats">
              <div className="sstat"><span className="sstat-num" style={{color:'var(--red)'}}>{stats.totalMissing}</span><span>Active Missing</span></div>
              <div className="sstat"><span className="sstat-num" style={{color:'var(--yellow)'}}>{stats.totalUnidentified}</span><span>Unidentified</span></div>
              <div className="sstat"><span className="sstat-num" style={{color:'var(--green)'}}>{stats.missingFound}</span><span>Found</span></div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="officer-main">
          {tab === 'cases' && (
            <>
              <div className="main-header">
                <div>
                  <h1>Cases</h1>
                  <p>{cases.length} {filter} cases</p>
                </div>
                <div className="main-header-actions">
                  <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                    <option value="open">Open</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Case</button>
                </div>
              </div>

              {showNew && (
                <div className="new-case-form">
                  <h3>Create New Case</h3>
                  <form onSubmit={handleCreateCase}>
                    <div className="ncf-grid">
                      <div className="field"><label>Title *</label><input value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} placeholder="Case title" required /></div>
                      <div className="field"><label>Type</label>
                        <select value={newCase.type} onChange={e => setNewCase({...newCase, type: e.target.value})}>
                          <option value="missing_person">Missing Person</option>
                          <option value="unidentified_body">Unidentified Body</option>
                        </select>
                      </div>
                      <div className="field"><label>Priority</label>
                        <select value={newCase.priority} onChange={e => setNewCase({...newCase, priority: e.target.value})}>
                          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="field"><label>District</label><input value={newCase.district} onChange={e => setNewCase({...newCase, district: e.target.value})} /></div>
                      <div className="field full"><label>Description</label><textarea rows={2} value={newCase.description} onChange={e => setNewCase({...newCase, description: e.target.value})} placeholder="Case description" /></div>
                    </div>
                    <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end'}}>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Create Case</button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? <div className="loading">Loading cases...</div> : (
                <div className="cases-list">
                  {cases.map(c => (
                    <div className="case-row" key={c._id} onClick={() => navigate(`/cases/${c._id}`)}>
                      <div className="case-row-left">
                        <div className="case-number">{c.caseNumber}</div>
                        <div className="case-title">{c.title}</div>
                        <div className="case-meta">📍 {c.district} · {new Date(c.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="case-row-right">
                        <span className={`badge ${priorityColor(c.priority)}`}>{c.priority}</span>
                        <span className={`badge ${statusColor(c.status)}`}>{c.status.replace('_',' ')}</span>
                        <span className="case-type-badge">{c.type === 'missing_person' ? '👤 Missing' : '🔍 Unidentified'}</span>
                      </div>
                    </div>
                  ))}
                  {cases.length === 0 && <div className="empty-state">No {filter} cases found</div>}
                </div>
              )}
            </>
          )}

          {tab === 'search' && (
            <div className="main-header">
              <h1>Face Search</h1>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>Open Search →</button>
            </div>
          )}

          {tab === 'persons' && (
            <div className="main-header">
              <h1>Persons Database</h1>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>Search Persons →</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
