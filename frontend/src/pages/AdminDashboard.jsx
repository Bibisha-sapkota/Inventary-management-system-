import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ⚠️ FIX: Changed 'logout' to 'clearAuth'
import { clearAuth } from "../utils/auth"; 
import api from "../api/axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch profile");
        // If profile fetch fails, clear auth and redirect
        clearAuth(); 
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    // ⚠️ FIX: Called 'clearAuth()' instead of 'logout()'
    clearAuth(); 
    navigate("/login");
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [1200, 1900, 3000, 5000, 2000, 3000],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: ['Fruits', 'Vegetables', 'Dairy', 'Snacks'],
    datasets: [
      {
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-orange-600">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <button className="w-full text-left py-2.5 px-4 bg-orange-100 text-orange-700 font-semibold border-r-4 border-orange-500">
            Dashboard
          </button>
          <button className="w-full text-left py-2.5 px-4 text-gray-600 hover:bg-gray-50">Manage Products</button>
          <button className="w-full text-left py-2.5 px-4 text-gray-600 hover:bg-gray-50">Manage Users</button>
          <button className="w-full text-left py-2.5 px-4 text-gray-600 hover:bg-gray-50">Reports</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-600">Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold">1,240</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-gray-500">Total Sales</h3>
              <p className="text-2xl font-bold">$45,200</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
              <h3 className="text-gray-500">Orders</h3>
              <p className="text-2xl font-bold">340</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <h3 className="text-gray-500">Low Stock</h3>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Sales</h3>
              <div className="h-64">
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Category Distribution</h3>
              <div className="h-64 flex justify-center">
                 <div className="w-64">
                    <Pie data={pieData} />
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}