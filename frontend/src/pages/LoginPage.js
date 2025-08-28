import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 关键：相对路径，交给 setupProxy.js 转发到 http://localhost:3000
      const res = await axios.post('/api/auth/login', { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      localStorage.setItem('token', res.data.token);
      setError('');
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Login failed';
      setError(msg);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit}
        style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400 }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Sign in</h2>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '.5rem' }}>Username</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            required style={{ width: '100%', padding: '.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '.5rem' }}>Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required style={{ width: '100%', padding: '.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '.75rem', background: '#0070f3', color: '#fff',
          border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
