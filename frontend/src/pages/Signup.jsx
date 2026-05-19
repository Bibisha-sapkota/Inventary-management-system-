import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import logo from "../images/logo.png";

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(form.password)) {
      setError('Password must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }
    if (!agree) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      const res = await api.post('/auth/signup', form);
      if (res.data.requiresOtp) {
        navigate('/verify-login-otp', { state: { sessionToken: res.data.sessionToken } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-sky-50 to-emerald-50 px-4 py-12 font-sans relative">
      <div className="w-full max-w-[460px]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-[0_35px_80px_rgba(15,23,42,0.12)] ring-1 ring-emerald-100">
          
          <div className="absolute inset-x-0 top-0 h-2 bg-[#00966D]"></div>

          <div className="relative text-center mb-10">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="p-2 rounded-2xl bg-white shadow-sm border border-slate-50">
                <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-[#00966D] tracking-tight">Create Account</h1>
            
            {error ? (
              <p className="mt-4 px-4 py-2 rounded-2xl text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-100">{error}</p>
            ) : (
              <p className="text-sm text-slate-500 font-medium mt-1">Join the Stock Inventory System</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50 pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00966D]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Account Type</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50 cursor-pointer"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 transition hover:text-slate-800">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#00966D] focus:ring-[#00966D]"
              />
              <span>I agree to the terms and conditions</span>
            </label>

            <button
              type="submit"
              disabled={!agree}
              className="w-full rounded-2xl bg-[#00966D] py-4 text-sm font-bold text-white transition hover:bg-[#00825e] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-emerald-100"
            >
              Create Account
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <div className="h-px flex-1 bg-slate-100"></div>
            <span>or sign up with</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" />
            Sign up with Google
          </button>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-bold text-[#00966D] hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}