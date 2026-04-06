import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import PublicPortal from './pages/PublicPortal';
import ReportMissing from './pages/ReportMissing';
import SearchPage from './pages/SearchPage';
import CaseDetail from './pages/CaseDetail';
import './index.css';

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('nk_token');
  const user  = JSON.parse(localStorage.getItem('nk_user') || '{}');
  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const RoleRedirect = () => {
  const user = JSON.parse(localStorage.getItem('nk_user') || '{}');
  if (user.role === 'admin')   return <Navigate to="/admin" />;
  if (user.role === 'officer') return <Navigate to="/officer" />;
  return <Navigate to="/portal" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<PublicPortal />} />
        <Route path="/portal"    element={<PublicPortal />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/search"    element={<SearchPage />} />
        <Route path="/report"    element={<ReportMissing />} />
        <Route path="/dashboard" element={<PrivateRoute><RoleRedirect /></PrivateRoute>} />
        <Route path="/admin"     element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/officer"   element={<PrivateRoute roles={['admin','officer']}><OfficerDashboard /></PrivateRoute>} />
        <Route path="/cases/:id" element={<PrivateRoute roles={['admin','officer']}><CaseDetail /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
