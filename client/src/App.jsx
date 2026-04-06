import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useStore from './store';
import Login from './Login';
import Register from './Register';

const subjects = ['SQL', 'OS', 'CN', 'OOPS', 'Backend', 'Custom...'];

function Dashboard() {
  const { entries, stats, loading, fetchEntries, fetchStats, saveEntry, user, logout } = useStore();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const todayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', weekday: 'short' }).format(new Date()).replace(',', ' -');

  const [form, setForm] = useState({
    date: today,
    dayLabel: todayLabel,
    plannedDsa: '',
    plannedSubject: '',
    plannedTopic: '',
    dsaWork: '',
    subject: 'None',
    customSubject: '', // UI only state
    topic: '',
    dsaDone: false,
    subjectDone: false,
    timeSpent: 0,
    notes: ''
  });

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  // Update form if entry for today exists
  useEffect(() => {
    const todayEntry = entries.find(e => e.date === today);
    if (todayEntry) {
      const isStandardSubject = subjects.includes(todayEntry.subject);
      setForm(prev => ({ 
        ...prev, 
        ...todayEntry,
        subject: isStandardSubject ? todayEntry.subject : 'Custom...',
        customSubject: isStandardSubject ? '' : todayEntry.subject
      }));
    }
  }, [entries, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = form.subject === 'Custom...' ? form.customSubject : form.subject;
    const payload = { ...form, subject: finalSubject };
    delete payload.customSubject; // Clean up UI-only state
    await saveEntry(payload);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>Progress Tracker</h1>
          <p style={{ color: '#888', fontWeight: 600 }}>MONOCHROME | STRATEGIC | DISCIPLINED</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{todayLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#888' }}>{user?.username}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>LOGOUT</button>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-3" style={{ marginBottom: '4rem' }}>
        <div className="card">
          <h4>Current Streak</h4>
          <p style={{ fontSize: '3rem', fontWeight: 900 }}>{stats.currentStreak}D</p>
        </div>
        <div className="card">
          <h4>Longest Streak</h4>
          <p style={{ fontSize: '3rem', fontWeight: 900 }}>{stats.longestStreak}D</p>
        </div>
        <div className="card">
          <h4>Weekly Completion</h4>
          <p style={{ fontSize: '3rem', fontWeight: 900 }}>{stats.weeklyCompletion}%</p>
        </div>
      </section>

      {/* DAILY ENTRY FORM (PLAN + LOG) */}
      <section className="card" style={{ backgroundColor: '#000', color: '#fff', padding: '3rem', transition: 'all 0.3s ease' }}>
        <form onSubmit={handleSubmit}>
          
          {/* DAILY PLAN */}
          <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #333' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>1. DAILY PLAN</h2>
            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>PLANNED DSA</label>
                <input 
                  name="plannedDsa" 
                  value={form.plannedDsa} 
                  onChange={handleChange} 
                  style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                  placeholder="e.g. Graph Algorithms"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>PLANNED SUBJECT</label>
                <input 
                  name="plannedSubject" 
                  value={form.plannedSubject} 
                  onChange={handleChange}
                  style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                  placeholder="e.g. Operating Systems"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>PLANNED TOPIC</label>
                <input 
                  name="plannedTopic" 
                  value={form.plannedTopic} 
                  onChange={handleChange}
                  style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                  placeholder="e.g. Deadlocks"
                />
              </div>
            </div>
          </div>

          {/* DAILY LOG */}
          <h2 style={{ marginBottom: '2rem', color: '#fff' }}>2. EXECUTION LOG</h2>
          <div className="grid" style={{ gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>DSA WORK (e.g. LC 121, LC 20)</label>
              <input 
                name="dsaWork" 
                value={form.dsaWork} 
                onChange={handleChange} 
                style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                placeholder="List actually completed problems..."
              />
            </div>

            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>CORE SUBJECT</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    name="subject" 
                    value={form.subject} 
                    onChange={handleChange}
                    style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333', flex: 1 }}
                  >
                    <option value="None">None</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {form.subject === 'Custom...' && (
                    <input 
                      name="customSubject" 
                      value={form.customSubject} 
                      onChange={handleChange}
                      style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333', flex: 1 }}
                      placeholder="Type subject..."
                    />
                  )}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>TOPIC DONE</label>
                <input 
                  name="topic" 
                  value={form.topic} 
                  onChange={handleChange}
                  style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                  placeholder="What did you actually study?"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>HOURS SPENT</label>
                <input 
                  type="number" 
                  name="timeSpent" 
                  value={form.timeSpent} 
                  onChange={handleChange}
                  min="0" step="0.5"
                  style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', margin: '1rem 0' }}>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="dsaDone" 
                  checked={form.dsaDone} 
                  onChange={handleChange} 
                />
                <span className="checkmark"></span>
                <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>DSA COMPLETED</span>
              </label>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="subjectDone" 
                  checked={form.subjectDone} 
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>SUBJECT COMPLETED</span>
              </label>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>NOTES / REFLECTION</label>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleChange}
                rows="3"
                style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
              />
            </div>

            <button type="submit" style={{ backgroundColor: '#fff', color: '#000', marginTop: '1rem' }}>
              SAVE TO SATELLITE
            </button>
          </div>
        </form>
      </section>

      {/* REFINED HEATMAP */}
      <section className="card">
        <h2 style={{ marginBottom: '2rem' }}>ACTIVITY HEATMAP</h2>
        <div className="heatmap-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {[...Array(91)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (90 - i));
            const dateStr = date.toISOString().split('T')[0];
            const entry = entries.find(e => e.date === dateStr);
            
            let statusClass = 'empty';
            let tooltipContent = 'No Data';

            if (entry) {
                if (entry.dsaDone && entry.subjectDone) {
                  statusClass = 'full';
                  tooltipContent = `${entry.dsaWork || 'DSA'} & ${entry.subject || 'Subject'}`;
                } else if (entry.dsaDone || entry.subjectDone) {
                  statusClass = 'partial';
                  tooltipContent = entry.dsaDone ? (entry.dsaWork || 'DSA') : (entry.subject || 'Subject');
                } else {
                  tooltipContent = 'Logged, but not completed';
                }
            }

            return (
              <div 
                key={i} 
                className={`heatmap-cell ${statusClass}`}
                data-tooltip={`${dateStr} // ${tooltipContent}`}
              />
            );
          })}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#555' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div className="heatmap-cell empty" style={{ pointerEvents: 'none' }} /> EMPTY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div className="heatmap-cell partial" style={{ pointerEvents: 'none' }} /> PARTIAL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div className="heatmap-cell full" style={{ pointerEvents: 'none' }} /> FULL
          </div>
        </div>
      </section>

      {/* REFINED HISTORY TABLE */}
      <section>
        <h2 style={{ marginBottom: '2rem' }}>RECENT OPERATIONS</h2>
        <div className="table-responsive">
          <table className="sleek-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Planned Phase Focus</th>
                <th>Executed DSA</th>
                <th>Executed Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 10).map((e) => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 600, color: '#000' }}>{e.dayLabel}</td>
                  <td>
                    {e.plannedDsa || e.plannedSubject ? 
                      <span style={{color: '#555'}}>{e.plannedDsa ? e.plannedDsa : ''} {e.plannedDsa && e.plannedSubject ? '|' : ''} {e.plannedSubject ? e.plannedSubject : ''}</span> 
                      : '-'}
                  </td>
                  <td>{e.dsaWork || '-'}</td>
                  <td>{e.subject !== 'None' ? e.subject : '-'}</td>
                  <td>
                    {e.dsaDone && e.subjectDone ? (
                      <span className="badge full">VERIFIED</span>
                    ) : (e.dsaDone || e.subjectDone ? (
                      <span className="badge partial">PARTIAL</span>
                    ) : (
                      <span className="badge empty">NULL</span>
                    ))}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>NO OPERATIONS LOGGED</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const { initAuth, fetchUser, isAuthenticated } = useStore();
  const [initFinished, setInitFinished] = useState(false);

  useEffect(() => {
    initAuth();
    if (useStore.getState().token) {
      fetchUser().finally(() => setInitFinished(true));
    } else {
      setInitFinished(true);
    }
  }, []);

  if (!initFinished) return null;

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
}
