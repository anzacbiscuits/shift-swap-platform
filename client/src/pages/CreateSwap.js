import React, { useState } from 'react';
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
  const [newGiveShift, setNewGiveShift] = useState({ date: '', shiftType: 'PECC Day' });
  const [newUnavail, setNewUnavail] = useState({ dateStart: '', dateEnd: '', reason: '' });
  const [newPref, setNewPref] = useState({ dateStart: '', dateEnd: '', shiftTypes: [] });

  const shiftTypes = ['PECC Day', 'PECC Evening', 'JHH Day', 'JHH Evening', 'JHH Evening on call', 'PECC Night', 'JHH Night', 'Back up', 'ECT', 'ECT Back up', 'MHCC 10-4'];

  const addGiveShift = () => {
    if (!newGiveShift.date) {
      setError('Please select a date for shift to give');
      return;
    }
    setGiveShifts([...giveShifts, { ...newGiveShift }]);
    setNewGiveShift({ date: '', shiftType: 'PECC Day' });
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
    if (!newPref.dateStart || !newPref.dateEnd || newPref.shiftTypes.length === 0) {
      setError('Please select dates and at least one shift type you would accept');
      return;
    }
    setPreferredTimes([...preferredTimes, { ...newPref, shiftTypes: [...newPref.shiftTypes] }]);
    setNewPref({ dateStart: '', dateEnd: '', shiftTypes: [] });
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
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Swap created successfully!');
      if (response.data.matches && response.data.matches.length > 0) {
        alert(`Found ${response.data.matches.length} potential match(es)!`);
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
        <div className={`step ${formStep >= 1 ? 'active' : ''}`}>1. Shifts to Give</div>
        <div className={`step ${formStep >= 2 ? 'active' : ''}`}>2. Unavailable Times</div>
        <div className={`step ${formStep >= 3 ? 'active' : ''}`}>3. Preferred Times</div>
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
                    <span>{period.dateStart} to {period.dateEnd} {period.reason && `(${period.reason})`}</span>
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
            <h2>Select shift types you're willing to RECEIVE on chosen dates</h2>
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
              <label>Shift types you are willing to accept</label>
              <div className="checkbox-group">
                {shiftTypes.map(type => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={newPref.shiftTypes.includes(type)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...newPref.shiftTypes, type]
                          : newPref.shiftTypes.filter(t => t !== type);
                        setNewPref({ ...newPref, shiftTypes: next });
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <button type="button" onClick={addPreferred} className="btn btn-secondary">
              Add Preferred Time
            </button>

            {preferredTimes.length > 0 && (
              <div className="added-items">
                <h3>Preferred Times to Receive:</h3>
                {preferredTimes.map((time, idx) => {
                  const slots = (time.shiftTypes || []).join(', ');
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
