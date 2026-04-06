import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nk_user') || '{}');
  const token = localStorage.getItem('nk_token');

  const handleLogout = () => {
    localStorage.removeItem('nk_token');
    localStorage.removeItem('nk_user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <div className="nav-logo">
          <span className="logo-emblem">⚖</span>
        </div>
        <div className="nav-titles">
          <div className="nav-title-en">Namadhu Kavalan</div>
          <div className="nav-title-ta">நமது காவலன்</div>
        </div>
      </div>
      <div className="nav-links">
        <Link to="/"       className="nav-link">Home</Link>
        <Link to="/search" className="nav-link">Search</Link>
        <Link to="/report" className="nav-link">Report Missing</Link>
      </div>
      <div className="nav-actions">
        {token ? (
          <>
            <Link to="/dashboard" className="nav-user">
              <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span className="nav-username">{user.name}</span>
              <span className={`nav-role ${user.role}`}>{user.role}</span>
            </Link>
            <button className="btn btn-ghost nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
