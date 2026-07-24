import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/SwapBoard.css';

const COL_WIDTH = 70; // matches .date-header min-width in SwapBoard.css

function SwapBoard({ user }) {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({ start: '2026-08-03', end: '2027-01-31' });
  const [compareMode, setCompareMode] = useState(false);
  const [regA, setRegA] = useState('');
  const [regB, setRegB] = useState('');
  const scrollRef = useRef(null);
  const saveTimer = useRef(null);

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

  // restore last scroll position once the board has rendered
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const saved = parseInt(localStorage.getItem('boardScrollLeft') || '0', 10);
      if (saved > 0) scrollRef.current.scrollLeft = saved;
    }
  }, [loading]);

  const rememberScroll = () => {
    if (!scrollRef.current) return;
    const left = scrollRef.current.scrollLeft;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem('boardScrollLeft', String(left));
    }, 200);
  };

  const scrollByDays = (numDays) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: numDays * COL_WIDTH, behavior: 'smooth' });
    setTimeout(rememberScroll, 400);
  };

  const scrollToStart = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    setTimeout(rememberScroll, 400);
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
    return swap.unavailable?.some(u => {
      const uStart = new Date(u.date_start);
      const uEnd = new Date(u.date_end);
      return date >= uStart && date <= uEnd;
    });
  };

  const isPreferred = (registrarId, date) => {
    const swap = swaps.find(s => s.registrar_id === registrarId);
    if (!swap) return false;
    return swap.preferred?.some(p => {
      const pStart = new Date(p.date_start);
      const pEnd = new Date(p.date_end);
      return date >= pStart && date <= pEnd;
    });
  };

  const registrars = swaps.map(s => ({ id: s.registrar_id, name: s.name }));

  let visibleSwaps = swaps;
  if (compareMode && regA && regB) {
    visibleSwaps = swaps.filter(s => s.registrar_id === regA || s.registrar_id === regB);
  }

  if (loading) return <div className="loading">Loading swap board...</div>;

  return (
    <div className="swap-board-container">
      <h1>Shift Swap Board</h1>

      <div className="board-controls">
        <div className="board-nav">
          <span className="board-nav-label">Jump:</span>
          <button type="button" onClick={() => scrollByDays(-30)} className="btn btn-secondary">◀◀ Month</button>
          <button type="button" onClick={() => scrollByDays(-7)} className="btn btn-secondary">◀ Week</button>
          <button type="button" onClick={scrollToStart} className="btn btn-secondary">Start</button>
          <button type="button" onClick={() => scrollByDays(7)} className="btn btn-secondary">Week ▶</button>
          <button type="button" onClick={() => scrollByDays(30)} className="btn btn-secondary">Month ▶▶</button>
        </div>
        <div className="board-compare">
          <label className="compare-toggle">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
            />
            Compare two only
          </label>
          {compareMode && (
            <>
              <select value={regA} onChange={(e) => setRegA(e.target.value)}>
                <option value="">Registrar A</option>
                {registrars.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select value={regB} onChange={(e) => setRegB(e.target.value)}>
                <option value="">Registrar B</option>
                {registrars.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {(!regA || !regB) && <span className="compare-hint">Pick two registrars</span>}
            </>
          )}
        </div>
      </div>

      <div className="board-legend">
        <div><span className="legend-red">■</span> Shifts to Give</div>
        <div><span className="legend-green">■</span> Preferred Times</div>
        <div><span className="legend-grey">■</span> Unavailable</div>
      </div>

      <div className="board-scroll" ref={scrollRef} onScroll={rememberScroll}>
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
            {visibleSwaps.map(swap => (
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
