import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import api from './api/axios';

function App() {
  // Render's free tier stops an idle instance. Pinging health as soon as the
  // app loads starts it waking up while the visitor reads the page, so the
  // first login or signup does not pay the full cold-start cost.
  useEffect(() => {
    api.get('/health', { timeout: 90000 }).catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/workspace/:documentId" 
        element={
          <PrivateRoute>
            <Workspace />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
