import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SwapBoard from './pages/SwapBoard';
import CreateSwap from './pages/CreateSwap';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.post('/api/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        {user && (
          <nav className="navbar">
            <div className="nav-brand">Shift Swap Platform</div>
            <div className="nav-links">
              <a href="/">Dashboard</a>
              <a href="/board">Swap Board</a>
              <a href="/create">New Swap</a>
              <a href="/messages">Messages</a>
              {user.role === 'admin' && <a href="/admin">Admin</a>}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </nav>
        )}
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/board" element={user ? <SwapBoard user={user} /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreateSwap user={user} /> : <Navigate to="/login" />} />
          <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
