import React, { useState, useEffect } from 'react';
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
        headers: { Authorization: `Bearer ${token}` }
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
