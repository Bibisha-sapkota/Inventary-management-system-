import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser, clearAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const user = getUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setRecentCustomers(res.data.recentCustomers || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-orange-400 to-blue-500 text-white flex flex-col">
        <div className="p-6 text-center border-b border-white/20">
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-sm">{user?.email}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "dashboard" ? "bg-white/30" : ""
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "orders" ? "bg-white/30" : ""
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "products" ? "bg-white/30" : ""
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "customers" ? "bg-white/30" : ""
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "notifications" ? "bg-white/30" : ""
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "profile" ? "bg-white/30" : ""
            }`}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 mt-10 rounded-lg font-semibold bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Dashboard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-400 rounded-lg shadow p-6 text-white text-center">
                <h3 className="text-xl font-semibold">Products</h3>
                <p className="text-3xl font-bold">{stats?.products ?? "..."}</p>
              </div>
              <div className="bg-orange-400 rounded-lg shadow p-6 text-white text-center">
                <h3 className="text-xl font-semibold">Customers</h3>
                <p className="text-3xl font-bold">{stats?.customers ?? "..."}</p>
              </div>
              <div className="bg-blue-500 rounded-lg shadow p-6 text-white text-center">
                <h3 className="text-xl font-semibold">Orders</h3>
                <p className="text-3xl font-bold">{stats?.orders ?? "..."}</p>
              </div>
              <div className="bg-red-500 rounded-lg shadow p-6 text-white text-center">
                <h3 className="text-xl font-semibold">Low Stock</h3>
                <p className="text-3xl font-bold">{stats?.lowStock ?? "..."}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Orders</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length ? (
                    recentOrders.map((order, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{order.id}</td>
                        <td className="border px-4 py-2">{order.customerName}</td>
                        <td className="border px-4 py-2">{order.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center p-4 text-gray-500">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Products</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">Manage your products here.</p>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Customers</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {recentCustomers.length ? (
                <ul className="space-y-2">
                  {recentCustomers.map((c, index) => (
                    <li key={index} className="p-3 border rounded-lg flex justify-between">
                      <span>{c.name}</span>
                      <span className="text-gray-500">{c.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent customers</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <ul className="list-disc list-inside space-y-2">
                <li>Stock for Item A is low</li>
                <li>Discount on Item B expires tomorrow</li>
                <li>New order received</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
            <p className="mb-2">Name: {user?.name}</p>
            <p className="mb-2">Email: {user?.email}</p>
            <p className="mb-2">Role: {user?.role}</p>
            <button className="mt-3 bg-gradient-to-r from-orange-400 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-500 hover:to-blue-600 transition">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
