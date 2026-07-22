import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

function Admin() {
  const [registrars, setRegistrars] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [tab, setTab] = useState('registrars');
  const [loading, setLoading] = useState(true);
  const [newRegistrar, setNewRegistrar] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'registrars') fetchRegistrars();
    else fetchSwaps();
  }, [tab]);

  const fetchRegistrars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/registrars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrars(response.data);
    } catch (error) {
      setError('Failed to fetch registrars');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSwaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/swaps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSwaps(response.data);
    } catch (error) {
      setError('Failed to fetch swaps');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createRegistrar = async (e) => {
    e.preventDefault();
    if (!newRegistrar.name || !newRegistrar.email || !newRegistrar.password) {
      setError('All fields required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/registrars/create', newRegistrar, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRegistrar({ name: '', email: '', password: '' });
      setError('');
      fetchRegistrars();
      alert('Registrar created successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create registrar');
    }
  };

  const deleteRegistrar = async (registrarId) => {
    if (!window.confirm('Are you sure you want to delete this registrar? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/registrars/${registrarId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRegistrars();
      alert('Registrar deleted');
    } catch (error) {
      setError('Failed to delete registrar');
    }
  };

  const deleteSwap = async (swapId) => {
    if (!window.confirm('Delete this swap?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/swaps/${swapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSwaps();
      alert('Swap deleted');
    } catch (error) {
      setError('Failed to delete swap');
    }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${tab === 'registrars' ? 'active' : ''}`}
          onClick={() => setTab('registrars')}
        >
          Registrars ({registrars.length})
        </button>
        <button
          className={`tab-btn ${tab === 'swaps' ? 'active' : ''}`}
          onClick={() => setTab('swaps')}
        >
          Swaps ({swaps.length})
        </button>
      </div>

      {tab === 'registrars' && (
        <div className="admin-section">
          <section className="create-registrar">
            <h2>Create New Registrar</h2>
            <form onSubmit={createRegistrar}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newRegistrar.name}
                  onChange={(e) => setNewRegistrar({ ...newRegistrar, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newRegistrar.email}
                  onChange={(e) => setNewRegistrar({ ...newRegistrar, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newRegistrar.password}
                  onChange={(e) => setNewRegistrar({ ...newRegistrar, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Registrar</button>
            </form>
          </section>

          <section className="registrars-list">
            <h2>All Registrars</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrars.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.name}</td>
                    <td>{reg.email}</td>
                    <td><span className="role-badge">{reg.role}</span></td>
                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => deleteRegistrar(reg.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === 'swaps' && (
        <div className="admin-section">
          <section className="swaps-list">
            <h2>All Swaps</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Registrar</th>
                  <th>Shifts to Give</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map(swap => (
                  <tr key={swap.id}>
                    <td>{swap.name}</td>
                    <td>{swap.giveShifts?.length || 0}</td>
                    <td><span className={`status-badge ${swap.status}`}>{swap.status}</span></td>
                    <td>{new Date(swap.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => deleteSwap(swap.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}

export default Admin;
