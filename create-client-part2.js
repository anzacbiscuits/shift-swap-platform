const fs = require('fs');

function createFile(filePath, content) {
  const dir = require('path').dirname(filePath);
  require('fs').mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Login.js
createFile('client/src/pages/Login.js', `import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        onLogin(response.data.user, response.data.token);
        navigate('/');
      } else {
        await axios.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setFormData({ name: '', email: '', password: '' });
        setIsLogin(true);
        setError('');
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
            disabled={loading}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
`);

// Dashboard.js
createFile('client/src/pages/Dashboard.js', `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard({ user }) {
  const [swaps, setSwaps] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/swaps/my-swaps', {
        headers: { Authorization: \`Bearer \${token}\` }
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
              <div key={swap.id} className={\`swap-item \${swap.status}\`}>
                <div className="swap-status-badge">{swap.status}</div>
                <p><strong>Created:</strong> {new Date(swap.created_at).toLocaleDateString()}</p>
                <p><strong>Shifts to give:</strong> {swap.giveShifts?.length || 0}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
`);

// SwapBoard.js
createFile('client/src/pages/SwapBoard.js', `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SwapBoard.css';

function SwapBoard({ user }) {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({ start: '2026-08-03', end: '2027-01-31' });

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/swaps/board', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setSwaps(response.data);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = () => {
    const dates = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = generateDates();

  const getShiftForDate = (registrarId, date) => {
    const swap = swaps.find(s => s.registrar_id === registrarId);
    if (!swap) return null;

    const dateStr = date.toISOString().split('T')[0];
    return swap.giveShifts?.find(g => g.date === dateStr);
  };

  const isUnavailable = (registrarId, date) => {
    const swap = swaps.find(s => s.registrar_id === registrarId);
    if (!swap) return false;

    const dateStr = date.toISOString().split('T')[0];
    return swap.unavailable?.some(u => {
      const uStart = new Date(u.date_start);
      const uEnd = new Date(u.date_end);
      return date >= uStart && date <= uEnd;
    });
  };

  const isPreferred = (registrarId, date) => {
    const swap = swaps.find(s => s.registrar_id === registrarId);
    if (!swap) return false;

    const dateStr = date.toISOString().split('T')[0];
    return swap.preferred?.some(p => {
      const pStart = new Date(p.date_start);
      const pEnd = new Date(p.date_end);
      return date >= pStart && date <= pEnd;
    });
  };

  if (loading) return <div className="loading">Loading swap board...</div>;

  return (
    <div className="swap-board-container">
      <h1>Shift Swap Board</h1>
      <div className="board-legend">
        <div><span className="legend-red">■</span> Shifts to Give</div>
        <div><span className="legend-green">■</span> Preferred Times</div>
        <div><span className="legend-grey">■</span> Unavailable</div>
      </div>

      <div className="board-scroll">
        <table className="swap-board">
          <thead>
            <tr>
              <th className="name-column">Registrar</th>
              {dates.map((date, idx) => (
                <th key={idx} className="date-header">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {swaps.map(swap => (
              <tr key={swap.id} className="registrar-row">
                <td className="name-column">
                  <strong>{swap.name}</strong>
                </td>
                {dates.map((date, idx) => {
                  const shift = getShiftForDate(swap.registrar_id, date);
                  const unavail = isUnavailable(swap.registrar_id, date);
                  const pref = isPreferred(swap.registrar_id, date);

                  return (
                    <td key={idx} className="date-cell">
                      {shift && <span className="shift shift-red">{shift.shift_type.substring(0, 3)}</span>}
                      {unavail && <span className="shift shift-unavailable">✕</span>}
                      {pref && !shift && !unavail && <span className="shift shift-green">✓</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SwapBoard;
`);

console.log('\\n✅ Client pages created!');
console.log('Next: Create more pages (CreateSwap, Messages, Admin)...');
