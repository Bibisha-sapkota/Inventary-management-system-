import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import logo from "../../images/logo.png";

export default function GoogleRoleSelect() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tempToken = searchParams.get('tempToken');

  const handleSelectRole = async (role) => {
    if (!tempToken) {
      setError('Invalid session. Please log in with Google again.');
      return;
    }

    if (role === 'admin') {
      setError('Admin accounts can only be created by the Superadmin. Please contact your supervisor.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google-signup-complete', { tempToken, role });
      if (res.data.requiresOtp) {
        navigate('/verify-login-otp', { state: { sessionToken: res.data.sessionToken } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
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
            
            <h1 className="text-3xl font-extrabold text-[#00966D] tracking-tight">Select Your Role</h1>
            
            {error ? (
              <p className="mt-4 px-4 py-2 rounded-2xl text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-100">{error}</p>
            ) : (
              <p className="text-sm text-slate-500 font-medium mt-1">Please select an account type to continue.</p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSelectRole('customer')}
              disabled={isLoading}
              className="w-full rounded-2xl border-2 border-[#00966D] bg-white py-4 text-sm font-bold text-[#00966D] transition hover:bg-[#00966D] hover:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Continue as Customer'}
            </button>
            <button
              onClick={() => handleSelectRole('admin')}
              disabled={isLoading}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
