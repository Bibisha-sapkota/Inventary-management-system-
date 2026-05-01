import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveAuth } from '../utils/auth';

export default function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            setStatus('Login failed. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                
                // Save to localStorage
                saveAuth(token, user);
                
                setStatus('Login successful! Redirecting...');

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/customer');
                    }
                }, 1000);

            } catch (err) {
                console.error('Parse error:', err);
                setStatus('Error processing login');
                setTimeout(() => navigate('/login'), 2000);
            }
        } else {
            setStatus('Invalid response. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-green-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                {/* Loading Spinner */}
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                
                {/* Status Message */}
                <h2 className="text-xl font-semibold text-gray-700">{status}</h2>
                
                {/* Google Icon */}
                <div className="mt-4">
                    <svg className="w-8 h-8 mx-auto" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.66 1.22 9.14 3.6l6.8-6.8C35.9 2.5 30.4 0 24 0 14.6 0 6.6 5.38 2.72 13.22l7.9 6.14C12.54 13.14 17.82 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.14 24.5c0-1.6-.14-3.14-.4-4.64H24v9.28h12.5c-.54 2.9-2.14 5.36-4.54 7.04l7 5.44c4.08-3.78 6.18-9.34 6.18-17.12z"/>
                        <path fill="#FBBC05" d="M10.62 28.36c-.5-1.5-.78-3.1-.78-4.86s.28-3.36.78-4.86l-7.9-6.14C.98 15.98 0 19.88 0 24s.98 8.02 2.72 11.5l7.9-6.14z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.9-2.14 15.86-5.78l-7-5.44c-1.94 1.3-4.44 2.06-8.86 2.06-6.18 0-11.46-3.64-13.38-8.86l-7.9 6.14C6.6 42.62 14.6 48 24 48z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}