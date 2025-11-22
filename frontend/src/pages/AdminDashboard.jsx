import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getUser, clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch stats
    api.get('/admin/dashboard')
      .then(res => {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setRecentCustomers(res.data.recentCustomers || []);
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Role: {user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Products</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats?.products ?? '...'}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Customers</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats?.customers ?? '...'}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Orders</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats?.orders ?? '...'}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Low Stock</h3>
          <p className="text-2xl font-bold text-red-500">{stats?.lowStock ?? '...'}</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Add Product
          </button>
          <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
            View Orders
          </button>
          <button className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors">
            Manage Customers
          </button>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {recentOrders.length ? (
          <ul className="space-y-2">
            {recentOrders.map((order, index) => (
              <li key={index} className="p-3 border rounded-lg flex justify-between">
                <span>Order #{order.id}</span>
                <span className="text-gray-500">{order.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent orders</p>
        )}
      </section>

      {/* Recent Customers */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Customers</h2>
        {recentCustomers.length ? (
          <ul className="space-y-2">
            {recentCustomers.map((customer, index) => (
              <li key={index} className="p-3 border rounded-lg flex justify-between">
                <span>{customer.name}</span>
                <span className="text-gray-500">{customer.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent customers</p>
        )}
      </section>

    </div>
  );
}
