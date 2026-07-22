const fs = require('fs');

function createFile(filePath, content) {
  const dir = require('path').dirname(filePath);
  require('fs').mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// CreateSwap.js (large file - will be created as is)
createFile('client/src/pages/CreateSwap.js', `import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateSwap.css';

function CreateSwap({ user }) {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [giveShifts, setGiveShifts] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [preferredTimes, setPreferredTimes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newGiveShift, setNewGiveShift] = useState({ date: '', shiftType: 'PECC' });
  const [newUnavail, setNewUnavail] = useState({ dateStart: '', dateEnd: '', reason: '' });
  const [newPref, setNewPref] = useState({ dateStart: '', dateEnd: '', morning: false, evening: false, night: false });

  const shiftTypes = ['PECC', 'JHH', 'Maitland', 'On Call', 'Back Up'];

  const addGiveShift = () => {
    if (!newGiveShift.date) {
      setError('Please select a date for shift to give');
      return;
    }
    setGiveShifts([...giveShifts, { ...newGiveShift }]);
    setNewGiveShift({ date: '', shiftType: 'PECC' });
  };

  const removeGiveShift = (idx) => {
    setGiveShifts(giveShifts.filter((_, i) => i !== idx));
  };

  const addUnavailable = () => {
    if (!newUnavail.dateStart || !newUnavail.dateEnd) {
      setError('Please select both start and end dates for unavailability');
      return;
    }
    setUnavailableDates([...unavailableDates, { ...newUnavail }]);
    setNewUnavail({ dateStart: '', dateEnd: '', reason: '' });
  };

  const removeUnavailable = (idx) => {
    setUnavailableDates(unavailableDates.filter((_, i) => i !== idx));
  };

  const addPreferred = () => {
    if (!newPref.dateStart || !newPref.dateEnd || (!newPref.morning && !newPref.evening && !newPref.night)) {
      setError('Please select dates and at least one time slot');
      return;
    }
    setPreferredTimes([...preferredTimes, { ...newPref }]);
    setNewPref({ dateStart: '', dateEnd: '', morning: false, evening: false, night: false });
  };

  const removePreferred = (idx) => {
    setPreferredTimes(preferredTimes.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (giveShifts.length === 0) {
      setError('Please add at least one shift to give');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/swaps/create', {
        giveShifts,
        unavailableDates,
        preferredTimes
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });

      alert('Swap created successfully!');
      if (response.data.matches && response.data.matches.length > 0) {
        alert(\`Found \${response.data.matches.length} potential match(es)!\`);
      }
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container create-swap">
      <h1>Create New Shift Swap Request</h1>
      
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-steps">
        <div className={\`step \${formStep >= 1 ? 'active' : ''}\`}>1. Shifts to Give</div>
        <div className={\`step \${formStep >= 2 ? 'active' : ''}\`}>2. Unavailable Times</div>
        <div className={\`step \${formStep >= 3 ? 'active' : ''}\`}>3. Preferred Times</div>
      </div>

      <form onSubmit={handleSubmit}>
        {formStep === 1 && (
          <section className="form-section">
            <h2>Select shifts you want to GIVE AWAY</h2>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newGiveShift.date}
                onChange={(e) => setNewGiveShift({ ...newGiveShift, date: e.target.value })}
                min="2026-08-03"
                max="2027-01-31"
              />
            </div>
            <div className="form-group">
              <label>Shift Type</label>
              <select
                value={newGiveShift.shiftType}
                onChange={(e) => setNewGiveShift({ ...newGiveShift, shiftType: e.target.value })}
              >
                {shiftTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={addGiveShift} className="btn btn-secondary">
              Add Shift
            </button>

            {giveShifts.length > 0 && (
              <div className="added-items">
                <h3>Shifts to Give:</h3>
                {giveShifts.map((shift, idx) => (
                  <div key={idx} className="item-badge">
                    <span>{shift.date} - {shift.shiftType}</span>
                    <button
                      type="button"
                      onClick={() => removeGiveShift(idx)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="step-buttons">
              <button type="button" onClick={() => setFormStep(2)} className="btn btn-primary">
                Next: Unavailable Times
              </button>
            </div>
          </section>
        )}

        {formStep === 2 && (
          <section className="form-section">
            <h2>Mark times when you CANNOT receive shifts</h2>
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={newUnavail.dateStart}
                onChange={(e) => setNewUnavail({ ...newUnavail, dateStart: e.target.value })}
                min="2026-08-03"
                max="2027-01-31"
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={newUnavail.dateEnd}
                onChange={(e) => setNewUnavail({ ...newUnavail, dateEnd: e.target.value })}
                min="2026-08-03"
                max="2027-01-31"
              />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input
                type="text"
                placeholder="e.g., Already working, On leave, Family commitment"
                value={newUnavail.reason}
                onChange={(e) => setNewUnavail({ ...newUnavail, reason: e.target.value })}
              />
            </div>
            <button type="button" onClick={addUnavailable} className="btn btn-secondary">
              Add Unavailability
            </button>

            {unavailableDates.length > 0 && (
              <div className="added-items">
                <h3>Unavailable Periods:</h3>
                {unavailableDates.map((period, idx) => (
                  <div key={idx} className="item-badge">
                    <span>{period.dateStart} to {period.dateEnd} {period.reason && \`(\${period.reason})\`}</span>
                    <button
                      type="button"
                      onClick={() => removeUnavailable(idx)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="step-buttons">
              <button type="button" onClick={() => setFormStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="button" onClick={() => setFormStep(3)} className="btn btn-primary">
                Next: Preferred Times
              </button>
            </div>
          </section>
        )}

        {formStep === 3 && (
          <section className="form-section">
            <h2>Select when you PREFER to receive shifts</h2>
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={newPref.dateStart}
                onChange={(e) => setNewPref({ ...newPref, dateStart: e.target.value })}
                min="2026-08-03"
                max="2027-01-31"
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={newPref.dateEnd}
                onChange={(e) => setNewPref({ ...newPref, dateEnd: e.target.value })}
                min="2026-08-03"
                max="2027-01-31"
              />
            </div>
            <div className="form-group">
              <label>Preferred Time Slots</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newPref.morning}
                    onChange={(e) => setNewPref({ ...newPref, morning: e.target.checked })}
                  />
                  Morning
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newPref.evening}
                    onChange={(e) => setNewPref({ ...newPref, evening: e.target.checked })}
                  />
                  Evening
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newPref.night}
                    onChange={(e) => setNewPref({ ...newPref, night: e.target.checked })}
                  />
                  Night
                </label>
              </div>
            </div>
            <button type="button" onClick={addPreferred} className="btn btn-secondary">
              Add Preferred Time
            </button>

            {preferredTimes.length > 0 && (
              <div className="added-items">
                <h3>Preferred Times to Receive:</h3>
                {preferredTimes.map((time, idx) => {
                  const slots = [time.morning && 'Morning', time.evening && 'Evening', time.night && 'Night']
                    .filter(Boolean).join(', ');
                  return (
                    <div key={idx} className="item-badge">
                      <span>{time.dateStart} to {time.dateEnd} - {slots}</span>
                      <button
                        type="button"
                        onClick={() => removePreferred(idx)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="step-buttons">
              <button type="button" onClick={() => setFormStep(2)} className="btn btn-secondary">
                Back
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Creating...' : 'Create Swap Request'}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}

export default CreateSwap;
`);

// Messages.js
createFile('client/src/pages/Messages.js', `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [selectedRegistrar, setSelectedRegistrar] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrars, setRegistrars] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchRegistrars();
  }, []);

  useEffect(() => {
    if (selectedRegistrar) {
      fetchConversation(selectedRegistrar);
    }
  }, [selectedRegistrar]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/messages/inbox', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/swaps/board', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const uniqueRegistrars = [...new Map(response.data.map(item => [item.registrar_id, item])).values()];
      setRegistrars(uniqueRegistrars);
    } catch (error) {
      console.error('Error fetching registrars:', error);
    }
  };

  const fetchConversation = async (registrarId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(\`/api/messages/conversation/\${registrarId}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRegistrar) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/send', {
        recipientId: selectedRegistrar,
        message: newMessage
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setNewMessage('');
      fetchConversation(selectedRegistrar);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="messages-container">
      <h1>Messages</h1>
      <div className="messages-layout">
        <div className="registrar-list">
          <h2>Registrars</h2>
          {registrars.map(reg => (
            <div
              key={reg.registrar_id}
              className={\`registrar-item \${selectedRegistrar === reg.registrar_id ? 'active' : ''}\`}
              onClick={() => setSelectedRegistrar(reg.registrar_id)}
            >
              <strong>{reg.name}</strong>
              <small>{reg.email}</small>
            </div>
          ))}
        </div>

        <div className="conversation-panel">
          {selectedRegistrar ? (
            <>
              <h2>{registrars.find(r => r.registrar_id === selectedRegistrar)?.name}</h2>
              <div className="messages-list">
                {conversation.map(msg => (
                  <div key={msg.id} className={\`message \${msg.sender_id === user.id ? 'sent' : 'received'}\`}>
                    <div className="message-header">
                      <strong>{msg.sender_name}</strong>
                      <small>{new Date(msg.created_at).toLocaleString()}</small>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!selectedRegistrar}
                />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a registrar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
`);

// Admin.js
createFile('client/src/pages/Admin.js', `import React, { useState, useEffect } from 'react';
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
        headers: { Authorization: \`Bearer \${token}\` }
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
        headers: { Authorization: \`Bearer \${token}\` }
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
        headers: { Authorization: \`Bearer \${token}\` }
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
      await axios.delete(\`/api/admin/registrars/\${registrarId}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
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
      await axios.delete(\`/api/admin/swaps/\${swapId}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
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
          className={\`tab-btn \${tab === 'registrars' ? 'active' : ''}\`}
          onClick={() => setTab('registrars')}
        >
          Registrars ({registrars.length})
        </button>
        <button
          className={\`tab-btn \${tab === 'swaps' ? 'active' : ''}\`}
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
                    <td><span className={\`status-badge \${swap.status}\`}>{swap.status}</span></td>
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
`);

console.log('\\n✅ All client pages created!');
console.log('Next: Create CSS style files...');
