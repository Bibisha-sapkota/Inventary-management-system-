import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setMsg('OTP Verified! Set new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Step 3: Reset Password (THE FIX IS HERE)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // ⚠️ FIX: Sending Email + OTP + NewPassword together
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      setMsg('Password Reset Successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-600 via-red-500 to-green-500" />

          <div className="p-8">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-green-600 text-white shadow-md' :
                      step > s ? 'bg-green-500 text-white' :
                        'bg-gray-100 text-gray-400'
                    }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "New Password"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 && "Enter your email to receive a reset code"}
                {step === 2 && `Code sent to ${email}`}
                {step === 3 && "Choose a strong new password"}
              </p>
            </div>

            {msg && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                {msg}
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md">
                  Send Reset Code
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">6-Digit Code</label>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-center tracking-[0.5em] font-bold text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  />
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md">
                  Verify Code
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md">
                  Reset Password
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-green-600 font-medium transition flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </div>
      </div>
    </div>
  );
}