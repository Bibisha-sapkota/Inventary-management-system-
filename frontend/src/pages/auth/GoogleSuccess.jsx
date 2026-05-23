import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveAuth } from '../../utils/auth';
import axios from 'axios';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showRestriction, setShowRestriction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const isNew = searchParams.get('isNew') === 'true';

    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user profile from API using the token
    const fetchUser = async () => {
      try {
        const res = await axios.get('https://inventory-backend-u3bi.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;
        const userData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };

        saveAuth(token, userData);

        if (isNew && user.role !== 'superadmin' && user.role !== 'admin') {
          setLoading(false);
          setShowRestriction(true);
        } else {
          if (user.role === 'superadmin') navigate('/superadmin');
          else if (user.role === 'admin') navigate('/admin');
          else navigate('/customer');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [searchParams, navigate]);

  if (loading) return <div className="text-center mt-20 font-bold text-orange-600">Processing Login...</div>;

  if (showRestriction) {
    return (
      <div className="fixed inset-0 bg-[#0B1120] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative mb-10 inline-block">
            <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>

          <h2 className="text-4xl font-black text-[#1e293b] tracking-tighter mb-4">Registration Restricted</h2>
          <p className="text-[#64748b] text-base font-medium leading-relaxed mb-10 max-w-[340px] mx-auto">
            Self-registration is currently <span className="text-rose-600 font-black">disabled</span>. Access is only permitted for accounts pre-created by the System Superadmin.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="w-full py-5 bg-[#0B1120] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-[#1e293b] transition-all shadow-2xl active:scale-95 group"
          >
            Return to Login
          </button>

          <p className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#cbd5e1] flex items-center justify-center gap-2">
            System Security Enforcement V2.4
          </p>
        </div>
      </div>
    );
  }

  return null;
}