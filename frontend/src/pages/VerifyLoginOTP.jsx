import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { saveAuth } from '../utils/auth';
import logo from "../images/logo.png";

export default function VerifyLoginOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const sessionToken = searchParams.get('session') || location.state?.sessionToken;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP is required');
      return;
    }
    if (!sessionToken) {
      setError('Invalid session. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-login-otp', { sessionToken, otp });

      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      };

      saveAuth(res.data.token, userData);

      if (res.data.role === 'superadmin') {
        navigate('/superadmin');
      } else if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-extrabold text-[#00966D] tracking-tight">Verify Login</h1>
            {error ? (
              <p className="mt-4 px-4 py-2 rounded-2xl text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-100">{error}</p>
            ) : (
              <p className="text-sm text-slate-500 font-medium mt-2">Enter the OTP sent to your email</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">One-Time Password (OTP)</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full text-center tracking-widest text-lg rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-800 outline-none transition focus:border-[#00966D] focus:ring-4 focus:ring-emerald-50"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-2xl bg-[#00966D] py-4 text-sm font-bold text-white transition hover:bg-[#00825e] shadow-lg shadow-emerald-100 disabled:opacity-70"
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
