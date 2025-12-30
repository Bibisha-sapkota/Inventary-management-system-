import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // Default role
  });

  const [agree, setAgree] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.includes('@')) {
      setMsg('Email must contain @');
      return;
    }
    if (form.password.length < 6) {
      setMsg('Password must be at least 6 characters long');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    if (!agree) {
      setMsg('You must agree to the terms and conditions');
      return;
    }

    try {
      const { confirmPassword, ...signupData } = form;
      
      // Sending role to backend
      await api.post('/auth/signup', signupData);

      setMsg('Account created successfully! Redirecting to Login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-gray-300 rounded-xl shadow-lg bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50">
      
      {/* Top Illustration */}
      <div className="flex justify-center mb-6">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEf_d4R8Y895KQoMuyl5mm_cq1P7eSXnWCQA&s" alt="Signup" className="w-32 h-32 object-contain rounded-full bg-white p-2 shadow-sm"/>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">Grocery Stock Inventory</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none" />

        <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none" />

        {/* Role Selection */}
        <div className="relative">
          <label className="text-xs text-gray-500 ml-1">Select Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border rounded-md bg-white cursor-pointer focus:ring-2 focus:ring-orange-400 outline-none">
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2 border rounded-md pr-12 focus:ring-2 focus:ring-orange-400 outline-none" />
          <img src={showPassword ? 'https://cdn-icons-png.flaticon.com/128/2767/2767194.png' : 'https://cdn-icons-png.flaticon.com/128/2767/2767146.png'} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 w-5 h-5 cursor-pointer opacity-70 hover:opacity-100" />
        </div>

        <div className="relative">
          <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required className="w-full px-4 py-2 border rounded-md pr-12 focus:ring-2 focus:ring-orange-400 outline-none" />
          <img src={showConfirmPassword ? 'https://cdn-icons-png.flaticon.com/128/2767/2767194.png' : 'https://cdn-icons-png.flaticon.com/128/2767/2767146.png'} alt="toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 w-5 h-5 cursor-pointer opacity-70 hover:opacity-100" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mr-2 cursor-pointer" />
          <label className="text-sm text-gray-600">I agree to the terms and conditions</label>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-orange-400 to-blue-500 text-white py-2 rounded-md font-semibold hover:shadow-lg transition">Create Account</button>
      </form>

      {msg && <p className="mt-4 text-center text-red-500 text-sm font-semibold">{msg}</p>}

      <div className="flex items-center my-6"><hr className="flex-1 border-gray-300" /><span className="px-2 text-gray-500 text-sm">OR</span><hr className="flex-1 border-gray-300" /></div>

      {/* ⚠️ Fixed Google Button with SVG */}
      <button onClick={handleGoogleLogin} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition shadow-sm">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
      </button>

      <p className="text-center mt-6 text-gray-700">Already have an account? <Link to="/login" className="text-blue-500 hover:underline font-medium">Login</Link></p>
    </div>
  );
}