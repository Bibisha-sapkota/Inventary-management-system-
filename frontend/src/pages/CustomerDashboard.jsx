import { getUser, clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Customer Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => { clearAuth(); navigate('/login'); }}>Logout</button>
    </div>
  );
}