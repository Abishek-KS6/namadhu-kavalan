import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './SearchPage.css';

export default function SearchPage() {
  const navigate = useNavigate();
  const [tab,       setTab]       = useState('text'); // text | face
  const [query,     setQuery]     = useState('');
  const [filters,   setFilters]   = useState({ type: '', district: '', gender: '' });
  const [photo,     setPhoto]     = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleTextSearch = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setResults(null);
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const { data } = await api.get(`/search/text?${params}`);
      setResults(data);
    } catch (err) { setError('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleFaceSearch = async (e) => {
    e.preventDefault();
    if (!photo) return setError('Please upload a photo');
    const token = localStorage.getItem('nk_token');
    if (!token) return navigate('/login');
    setLoading(true); setError(''); setResults(null);
    try {
      const fd = new FormData();
      fd.append('photo', photo);
      fd.append('searchType', filters.type || 'all');
      const { data } = await api.post('/search/face', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Face search failed');
    } finally { setLoading(false); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const statusColor = (status) => status === 'active' ? 'badge-red' : status === 'found' ? 'badge-green' : 'badge-gray';

  return (
    <div>
      <Navbar />
      <div className="search-page">
        <div className="search-header">
          <h1>Search Missing Persons</h1>
          <p>Search by name, description, or upload a photo for AI-powered face matching</p>
        </div>

        <div className="search-tabs">
          <button className={`stab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>🔍 Text Search</button>
          <button className={`stab ${tab === 'face' ? 'active' : ''}`} onClick={() => setTab('face')}>🤖 Face Search (AI)</button>
        </div>

        <div className="search-box">
          {tab === 'text' ? (
            <form onSubmit={handleTextSearch} className="search-form">
              <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, location, identifying marks..." />
              <div className="search-filters">
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                  <option value="">All Types</option>
                  <option value="missing">Missing Persons</option>
                  <option value="unidentified">Unidentified Bodies</option>
                </select>
                <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}>
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select value={filters.district} onChange={e => setFilters({...filters, district: e.target.value})}>
                  <option value="">All Districts</option>
                  {['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Vellore','Erode'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
            </form>
          ) : (
            <form onSubmit={handleFaceSearch} className="search-form">
              <div className="face-upload-area">
                {preview ? (
                  <div className="face-preview">
                    <img src={preview} alt="Search" />
                    <button type="button" className="btn btn-ghost" onClick={() => { setPhoto(null); setPreview(null); }}>Remove</button>
                  </div>
                ) : (
                  <label className="face-upload-label">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Upload a clear face photo</div>
                    <div className="upload-sub">JPG, PNG up to 10MB</div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                  </label>
                )}
              </div>
              <div className="search-filters">
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                  <option value="all">Search All</option>
                  <option value="missing">Missing Persons Only</option>
                  <option value="unidentified">Unidentified Only</option>
                </select>
              </div>
              <div className="face-search-note">⚠️ Face search requires login. Results are AI-generated and should be verified by police.</div>
              <button type="submit" className="btn btn-primary" disabled={loading || !photo}>{loading ? 'AI Searching...' : '🤖 Search with AI'}</button>
            </form>
          )}
        </div>

        {error && <div className="search-error">{error}</div>}

        {results && (
          <div className="results-section">
            <div className="results-header">
              {tab === 'face'
                ? <h3>{results.totalMatches} face match{results.totalMatches !== 1 ? 'es' : ''} found</h3>
                : <h3>{results.count} result{results.count !== 1 ? 's' : ''} found</h3>
              }
            </div>
            <div className="results-grid">
              {tab === 'text' && results.results?.map(p => (
                <div className="person-card" key={p._id}>
                  <div className="pc-photo">{p.primaryPhoto ? <img src={p.primaryPhoto} alt={p.name} /> : <div className="pc-no-photo">👤</div>}</div>
                  <div className="pc-info">
                    <div className="pc-name">{p.name}</div>
                    <div className="pc-meta">{p.age ? `${p.age} yrs` : 'Age unknown'} · {p.gender || 'Unknown'}</div>
                    <div className="pc-meta">📍 {p.district || 'Unknown district'}</div>
                    <div className="pc-badges">
                      <span className={`badge ${p.type === 'missing' ? 'badge-red' : 'badge-yellow'}`}>{p.type}</span>
                      <span className={`badge ${statusColor(p.status)}`}>{p.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tab === 'face' && results.matches?.map((m, i) => (
                <div className="person-card" key={i}>
                  <div className="pc-photo">{m.person?.primaryPhoto ? <img src={m.person.primaryPhoto} alt={m.person.name} /> : <div className="pc-no-photo">👤</div>}</div>
                  <div className="pc-info">
                    <div className="pc-name">{m.person?.name}</div>
                    <div className="pc-match-score">
                      <span className={`badge ${m.confidence === 'HIGH' ? 'badge-green' : m.confidence === 'MEDIUM' ? 'badge-yellow' : 'badge-gray'}`}>
                        {m.confidence} — {(m.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="pc-meta">📍 {m.person?.district}</div>
                    <div className="pc-badges">
                      <span className={`badge ${m.personType === 'missing' ? 'badge-red' : 'badge-yellow'}`}>{m.personType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {((tab === 'text' && results.count === 0) || (tab === 'face' && results.totalMatches === 0)) && (
              <div className="no-results">No matches found. Try different search terms or contact your local police station.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
