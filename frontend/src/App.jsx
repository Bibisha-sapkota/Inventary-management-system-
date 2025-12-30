import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
// import AuthSuccess from './pages/AuthSuccess'; // ⚠️ यो हटाइदिनुस्, अब GoogleSuccess ले काम गर्छ
import GoogleSuccess from './pages/auth/GoogleSuccess'; // ⚠️ Make sure path is correct
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* ⚠️ FIX: Only keep one route for auth-success, pointing to GoogleSuccess */}
                <Route path="/auth-success" element={<GoogleSuccess />} />

                {/* Admin Private Route */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Customer Private Route */}
                <Route
                    path="/customer"
                    element={
                        <PrivateRoute allowedRoles={['customer']}>
                            <CustomerDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;