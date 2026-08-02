import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard({ user }) {
  const [swaps, setSwaps] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/swaps/my-swaps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSwaps(response.data);
      
      const active = response.data.filter(s => s.status === 'active').length;
      const completed = response.data.filter(s => s.status === 'completed').length;
      setStats({ active, completed });
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pw.next !== pw.confirm) { setPwErr('New passwords do not match'); return; }
    if (pw.next.length < 6) { setPwErr('New password must be at least 6 characters'); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password',
        { currentPassword: pw.current, newPassword: pw.next },
        { headers: { Authorization: `Bearer ${token}` } });
      setPwMsg('Password updated successfully');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container dashboard">
      <h1>Welcome, {user.name}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.active}</h3>
          <p>Active Swaps</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completed}</h3>
          <p>Completed Swaps</p>
        </div>
      </div>

      <section className="recent-swaps">
        <h2>Your Recent Swaps</h2>
        {swaps.length === 0 ? (
          <p>No swaps yet. <a href="/create">Create one now</a></p>
        ) : (
          <div className="swaps-list">
            {swaps.slice(0, 5).map(swap => (
              <div key={swap.id} className={`swap-item ${swap.status}`}>
                <div className="swap-status-badge">{swap.status}</div>
                <p><strong>Created:</strong> {new Date(swap.created_at).toLocaleDateString('en-GB')}</p>
                <p><strong>Shifts to give:</strong> {swap.giveShifts?.length || 0}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="change-password">
        <h2>Change Password</h2>
        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        <form onSubmit={changePassword} className="password-form">
          <input type="password" placeholder="Current password" value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          <input type="password" placeholder="New password" value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          <input type="password" placeholder="Confirm new password" value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </section>
    </div>
  );
}

export default Dashboard;
