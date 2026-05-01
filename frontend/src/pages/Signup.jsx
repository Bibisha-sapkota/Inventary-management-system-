import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../images/logo.png';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });

  const [agree, setAgree] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    if (!agree) {
      setMsg('Please agree to the terms');
      return;
    }

    try {
      const { confirmPassword, ...signupData } = form;
      await api.post('/auth/signup', signupData);
      setMsg('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-sky-50 to-emerald-50 px-4 py-12 font-sans relative">
      <div className="w-full max-w-[480px]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-[0_35px_80px_rgba(15,23,42,0.12)] ring-1 ring-emerald-100">

          {/* Top Bar - Exact Green from your image */}
          <div className="absolute inset-x-0 top-0 h-2 bg-[#00966D]"></div>

          {/* Logo Section */}
          <div className="relative text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="p-2 rounded-2xl bg-white shadow-sm border border-slate-50">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png';
                  }}
                />
              </div>
            </div>
            {/* Heading - Exact Green from your image */}
            <h1 className="text-3xl font-extrabold text-[#00966D] tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-500 font-medium">Join Stock Inventory today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Role</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50 appearance-none"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l4 4 4-4" /></svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00966D]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00966D]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#00966D] focus:ring-[#00966D]"
              />
              <span>I agree to the terms and conditions</span>
            </label>

            {/* Button - Exact Green from your image */}
            <button
              type="submit"
              disabled={!agree}
              className="w-full rounded-2xl bg-[#00966D] py-4 text-sm font-bold text-white transition hover:bg-[#00825e] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
            >
              Create Account
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <div className="h-px flex-1 bg-slate-100"></div>
            <span>OR</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" />
            Continue with Google
          </button>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#00966D] hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}