import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveAuth } from '../../utils/auth'; // ⚠️ Check path: ../../utils/auth is correct here because inside auth folder
import api from '../../api/axios';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');
    const isNew = searchParams.get('isNew') === 'true';

    if (token && userString) {
      const user = JSON.parse(decodeURIComponent(userString));
      saveAuth(token, user);

      if (isNew) {
        setShowRoleSelection(true);
        setLoading(false);
      } else {
        if (user.role === 'admin') navigate('/admin');
        else navigate('/customer');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      await api.put('/auth/update-role', { role });

      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.role = role;
      localStorage.setItem('user', JSON.stringify(storedUser));

      if (role === 'admin') navigate('/admin');
      else navigate('/customer');
      
    } catch (error) {
      alert("Failed to update role. Please login again.");
      navigate('/login');
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold text-orange-600">Processing Login...</div>;

  if (showRoleSelection) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-lg bg-white text-center">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Welcome! 🎉</h2>
        <p className="text-gray-600 mb-8">Please select your account type:</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleRoleSelect('customer')}
            className="w-full p-4 border-2 border-green-100 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex items-center justify-between group"
          >
            <span className="font-semibold text-gray-700 group-hover:text-green-600">I am a Customer</span>
            <span className="text-2xl">🛒</span>
          </button>

          <button 
            onClick={() => handleRoleSelect('admin')}
            className="w-full p-4 border-2 border-orange-100 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition flex items-center justify-between group"
          >
            <span className="font-semibold text-gray-700 group-hover:text-orange-600">I am an Admin</span>
            <span className="text-2xl">👔</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}