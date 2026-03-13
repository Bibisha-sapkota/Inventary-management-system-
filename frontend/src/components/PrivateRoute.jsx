import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

  return children;
}