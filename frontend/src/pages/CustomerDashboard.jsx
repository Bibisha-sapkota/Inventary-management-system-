import { useState } from "react";
import { getUser, clearAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

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
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
              activeTab === "history" ? "bg-white/30" : ""
            }`}
          >
            Order History
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
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-400 rounded-lg shadow text-white">
                <h3 className="text-xl font-semibold mb-2">Total Orders</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="p-6 bg-orange-400 rounded-lg shadow text-white">
                <h3 className="text-xl font-semibold mb-2">Pending Orders</h3>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="p-6 bg-blue-500 rounded-lg shadow text-white">
                <h3 className="text-xl font-semibold mb-2">Notifications</h3>
                <p>Check for stock updates, discounts, or alerts.</p>
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
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">001</td>
                    <td className="border px-4 py-2">Delivered</td>
                    <td className="border px-4 py-2">2025-11-20</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">002</td>
                    <td className="border px-4 py-2">Pending</td>
                    <td className="border px-4 py-2">2025-11-22</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">003</td>
                    <td className="border px-4 py-2">Cancelled</td>
                    <td className="border px-4 py-2">2025-11-23</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Order History</h2>
            <ul className="bg-white rounded-lg shadow p-6 list-disc list-inside">
              <li>Order #001 - Delivered</li>
              <li>Order #002 - Pending</li>
              <li>Order #003 - Cancelled</li>
            </ul>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>
            <ul className="bg-white rounded-lg shadow p-6 list-disc list-inside">
              <li>Stock for Item A is low</li>
              <li>Discount on Item B expires tomorrow</li>
              <li>New order received: #004</li>
            </ul>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
            <p className="mb-2">Name: {user?.name}</p>
            <p className="mb-2">Email: {user?.email}</p>
            <button className="mt-3 bg-gradient-to-r from-orange-400 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-500 hover:to-blue-600 transition">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
