import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from './store';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const register = useStore(state => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#000', color: '#fff' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>INITIALIZE</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>USERNAME</label>
            <input 
              required
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#888' }}>PASSWORD</label>
            <input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#fff', color: '#000', marginTop: '1rem', width: '100%' }}>REGISTER</button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          Registered? <span style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Access System</span>
        </div>
      </div>
    </div>
  );
}
