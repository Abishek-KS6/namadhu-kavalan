import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './CaseDetail.css';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [note,     setNote]     = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get(`/cases/${id}`)
      .then(r => setCaseData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const addActivity = async () => {
    if (!note.trim()) return;
    try {
      await api.post(`/cases/${id}/activity`, { action: 'Note added', note });
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data);
      setNote('');
    } catch (err) { alert('Failed to add note'); }
  };

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/cases/${id}`, { status });
      setCaseData(data);
    } catch (err) { alert('Failed to update status'); }
  };

  if (loading) return <div><Navbar /><div style={{padding:'2rem',textAlign:'center',color:'var(--muted)'}}>Loading case...</div></div>;
  if (!caseData) return <div><Navbar /><div style={{padding:'2rem',textAlign:'center',color:'var(--red)'}}>Case not found</div></div>;

  return (
    <div>
      <Navbar />
      <div className="case-detail-page">
        <div className="cd-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <div className="cd-case-num">{caseData.caseNumber}</div>
            <h1 className="cd-title">{caseData.title}</h1>
          </div>
          <div className="cd-actions">
            {caseData.status === 'open' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus('under_investigation')}>Mark Investigating</button>}
            {caseData.status === 'under_investigation' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus('resolved')}>Mark Resolved</button>}
          </div>
        </div>

        <div className="cd-grid">
          <div className="cd-info-card">
            <h3>Case Details</h3>
            <div className="cd-info-rows">
              <div className="cd-info-row"><span>Status</span><span className={`badge ${caseData.status === 'resolved' ? 'badge-green' : caseData.status === 'open' ? 'badge-red' : 'badge-yellow'}`}>{caseData.status.replace('_',' ')}</span></div>
              <div className="cd-info-row"><span>Priority</span><span className={`badge ${caseData.priority === 'critical' ? 'badge-red' : caseData.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{caseData.priority}</span></div>
              <div className="cd-info-row"><span>Type</span><span>{caseData.type.replace('_',' ')}</span></div>
              <div className="cd-info-row"><span>District</span><span>{caseData.district}</span></div>
              <div className="cd-info-row"><span>Assigned To</span><span>{caseData.assignedTo?.name || 'Unassigned'}</span></div>
              <div className="cd-info-row"><span>Reported By</span><span>{caseData.reportedBy?.name}</span></div>
              <div className="cd-info-row"><span>Created</span><span>{new Date(caseData.createdAt).toLocaleDateString()}</span></div>
            </div>
            {caseData.description && <div className="cd-desc"><strong>Description:</strong><p>{caseData.description}</p></div>}
          </div>

          <div className="cd-activity-card">
            <h3>Activity Log</h3>
            <div className="activity-list">
              {caseData.activities?.slice().reverse().map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-action">{a.action}</div>
                  {a.note && <div className="activity-note">{a.note}</div>}
                  <div className="activity-time">{new Date(a.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="add-note">
              <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note or update..." className="note-input" />
              <button className="btn btn-primary btn-sm" onClick={addActivity}>Add Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
