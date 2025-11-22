import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // default customer, admin chai manually
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', form);
      setMsg('Account created! Now login gara');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc' }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
          style={{ width: '100%', margin: '10px 0', padding: 10 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
          style={{ width: '100%', margin: '10px 0', padding: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required
          style={{ width: '100%', margin: '10px 0', padding: 10 }}
        />
        <p style={{color: 'gray'}}>Admin banna chahanchau bhane Thunder Client use gara</p>
        <button type="submit" style={{ padding: '10px 20px', width: '100%' }}>
          Create Account
        </button>
      </form>
      {msg && <p style={{marginTop: 10, textAlign: 'center'}}>{msg}</p>}
      <p style={{textAlign: 'center', marginTop: 20}}>
        Already have account? <a href="/login">Login</a>
      </p>
    </div>
  );
}