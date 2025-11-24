import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { saveAuth } from '../utils/auth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      saveAuth(res.data.token, res.data.user);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 border border-gray-300 rounded-xl shadow-lg bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50">
      <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">Login</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-400 to-blue-500 text-white py-2 rounded-md hover:from-orange-500 hover:to-blue-600 transition font-semibold"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-6 text-gray-700">
        Don't have an account?{' '}
        <a href="/signup" className="text-blue-500 hover:underline">
          Signup
        </a>
      </p>
    </div>
  );
}
