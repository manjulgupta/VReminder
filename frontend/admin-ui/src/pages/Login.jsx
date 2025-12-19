import { useState } from 'react';
import api from '../api/client';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/admin/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button>Login</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
