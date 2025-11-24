import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // default customer, admin manually
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
    <div className="max-w-md mx-auto mt-20 p-8 border border-gray-300 rounded-xl shadow-lg 
                    bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50">
      <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">Signup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
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
        <p className="text-sm text-gray-500">
          Admin banna chahanchau bhane Thunder Client use gara
        </p>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-400 to-blue-500 text-white py-2 rounded-md 
                     hover:from-orange-500 hover:to-blue-600 transition font-semibold"
        >
          Create Account
        </button>
      </form>

      {msg && <p className="mt-4 text-center text-red-500">{msg}</p>}
      <p className="text-center mt-6 text-gray-700">
        Already have account?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
