import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PublicPortal.css';

export default function PublicPortal() {
  const navigate = useNavigate();
  return (
    <div className="portal">
      <Navbar />
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">Tamil Nadu Police Department</div>
        <h1 className="hero-title">நமது காவலன்<br /><span>Namadhu Kavalan</span></h1>
        <p className="hero-desc">AI-powered missing persons identification system. Help reunite families across Tamil Nadu using advanced facial recognition technology.</p>
        <div className="hero-actions">
          <button className="btn btn-primary hero-btn" onClick={() => navigate('/search')}>🔍 Search Database</button>
          <button className="btn btn-ghost hero-btn-ghost" onClick={() => navigate('/report')}>📋 Report Missing Person</button>
        </div>
        <div className="hero-stats">
          <div className="hstat"><div className="hstat-num">38</div><div className="hstat-label">Districts Covered</div></div>
          <div className="hstat-divider" />
          <div className="hstat"><div className="hstat-num">AI</div><div className="hstat-label">Facial Recognition</div></div>
          <div className="hstat-divider" />
          <div className="hstat"><div className="hstat-num">24/7</div><div className="hstat-label">Active Monitoring</div></div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Three Simple Steps to Find Your Loved One</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon">📋</div>
              <h3>Report</h3>
              <p>File a missing person report with details and photos. Our system securely stores all information.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon">🤖</div>
              <h3>AI Match</h3>
              <p>Our facial recognition AI scans the database and matches against unidentified persons.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon">👨‍👩‍👧</div>
              <h3>Reunite</h3>
              <p>Police officers follow up on matches and coordinate with families for identification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Looking for someone?</h2>
          <p>Upload a photo or search by name, district, or description to find matches in our database.</p>
          <button className="btn btn-primary cta-btn" onClick={() => navigate('/search')}>Start Searching Now →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-emblem">⚖</span>
            <div>
              <div className="footer-name">Namadhu Kavalan</div>
              <div className="footer-dept">Tamil Nadu Police Department</div>
            </div>
          </div>
          <div className="footer-info">
            <div>Emergency: <strong>100</strong></div>
            <div>Missing Persons Helpline: <strong>1094</strong></div>
          </div>
        </div>
        <div className="footer-bottom">© 2024 Tamil Nadu Police. All rights reserved.</div>
      </footer>
    </div>
  );
}
