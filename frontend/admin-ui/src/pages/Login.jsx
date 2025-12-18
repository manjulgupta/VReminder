import { useState } from 'react';
import client from '../api/client';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await client.post('/admin/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Network/CORS error');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Admin Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
