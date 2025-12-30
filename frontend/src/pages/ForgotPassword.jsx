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
    <div className="max-w-md mx-auto mt-20 p-8 border border-gray-300 rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">
        {step === 1 && "Forgot Password"}
        {step === 2 && "Enter OTP"}
        {step === 3 && "New Password"}
      </h2>

      {msg && <p className="text-green-600 text-center mb-4">{msg}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
            Send OTP
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md text-center tracking-widest"
          />
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md">
            Verify OTP
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-md">
            Reset Password
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-gray-500 hover:text-blue-500">
          Back to Login
        </Link>
      </div>
    </div>
  );
}