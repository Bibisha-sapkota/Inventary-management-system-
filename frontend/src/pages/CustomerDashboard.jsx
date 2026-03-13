import { useState } from "react";
import { getUser, clearAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  // ---------------- PROFILE ----------------
  const [profile, setProfile] = useState({
    photo: null,
    name: user?.name,
    email: user?.email,
    bio: "Customer at Inventory System",
    location: "Nepal",
  });

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    setProfile({
      ...profile,
      photo: URL.createObjectURL(file),
    });
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------- ORDERS ----------------
  const [orders, setOrders] = useState([
    { product: "Item A", status: "Delivered", date: "2025-11-20" },
    { product: "Item B", status: "Pending", date: "2025-11-22" },
    { product: "Item C", status: "Cancelled", date: "2025-11-23" },
  ]);

  // ---------------- NOTIFICATIONS ----------------
  const [notifications] = useState({
    product: ["Low stock alert on Item A"],
    order: ["Your new order has been placed"],
    discount: ["Discount on Item B ends tomorrow"],
    system: ["System maintenance scheduled tonight"],
  });

  // POPUP STATES
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [filterDate, setFilterDate] = useState("");

  const [formData, setFormData] = useState({
    product: "",
    status: "Pending",
    date: "",
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const openAddForm = () => {
    setFormData({ product: "", status: "Pending", date: "" });
    setShowAddForm(true);
  };

  const handleAddOrder = () => {
    setConfirmType("add");
    setShowConfirm(true);
  };

  const confirmAdd = () => {
    setOrders([...orders, formData]);
    closeAll();
  };

  const handleEditOrder = (index) => {
    setSelectedIndex(index);
    setFormData(orders[index]);
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    setConfirmType("edit");
    setShowConfirm(true);
  };

  const confirmEdit = () => {
    const updated = [...orders];
    updated[selectedIndex] = formData;
    setOrders(updated);
    closeAll();
  };

  const handleDeleteOrder = (index) => {
    setSelectedIndex(index);
    setConfirmType("delete");
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setOrders(orders.filter((_, i) => i !== selectedIndex));
    closeAll();
  };

  const closeAll = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowConfirm(false);
    setFormData({ product: "", status: "Pending", date: "" });
  };

  const handleConfirm = () => {
    if (confirmType === "add") confirmAdd();
    if (confirmType === "edit") confirmEdit();
    if (confirmType === "delete") confirmDelete();
  };

  const statusColor = {
    Pending: "bg-red-500 text-white",
    Delivered: "bg-green-500 text-white",
    Completed: "bg-green-600 text-white",
    Cancelled: "bg-yellow-500 text-white",
  };

  const filteredHistory = filterDate
    ? orders.filter((o) => o.date === filterDate)
    : orders;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-orange-400 to-blue-500 text-white flex flex-col">
        <div className="p-6 text-center border-b border-white/20">
          <img
            src={profile.photo || "https://via.placeholder.com/100"}
            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-white"
          />
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm opacity-80">{profile.email}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          {["dashboard", "orders", "history", "notifications", "profile"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
                  activeTab === tab ? "bg-white/30" : ""
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 mt-10 rounded-lg font-semibold bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <Dashboard orders={orders} />
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <Orders
            orders={orders}
            statusColor={statusColor}
            openAddForm={openAddForm}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <History
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            filteredHistory={filteredHistory}
            statusColor={statusColor}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <Notifications notifications={notifications} />
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <ProfileSection
            profile={profile}
            handleProfilePhoto={handleProfilePhoto}
            handleProfileChange={handleProfileChange}
          />
        )}
      </div>

      {/* POPUPS */}
      {showAddForm && (
        <PopupForm
          title="Add Order"
          formData={formData}
          setFormData={setFormData}
          onCancel={closeAll}
          onSubmit={handleAddOrder}
        />
      )}

      {showEditForm && (
        <PopupForm
          title="Edit Order"
          formData={formData}
          setFormData={setFormData}
          onCancel={closeAll}
          onSubmit={handleSaveEdit}
        />
      )}

      {showConfirm && (
        <ConfirmPopup
          message="Are you sure?"
          onYes={handleConfirm}
          onNo={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

/* ========== NEW PROFILE COMPONENT ========== */

function ProfileSection({ profile, handleProfilePhoto, handleProfileChange }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl">
      <h2 className="text-3xl font-bold mb-6">Your Profile</h2>

      <div className="flex items-center gap-6">
        <img
          src={profile.photo || "https://via.placeholder.com/100"}
          className="w-28 h-28 rounded-full border object-cover"
        />

        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg">
          Upload Photo
          <input
            type="file"
            className="hidden"
            onChange={handleProfilePhoto}
          />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        <input
          name="name"
          value={profile.name}
          onChange={handleProfileChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Full Name"
        />

        <input
          name="email"
          value={profile.email}
          onChange={handleProfileChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Email"
        />

        <textarea
          name="bio"
          rows={3}
          value={profile.bio}
          onChange={handleProfileChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Bio"
        />

        <input
          name="location"
          value={profile.location}
          onChange={handleProfileChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Location"
        />

        <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-2 rounded-lg font-semibold">
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ========== REUSABLE COMPONENTS (NO CHANGE) ========== */

function Dashboard({ orders }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 p-3 text-white rounded-lg bg-gradient-to-r from-blue-500 to-orange-500">
        Dashboard Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={orders.length} color="bg-blue-500" />
        <StatCard label="Pending" value={orders.filter(o => o.status === "Pending").length} color="bg-red-500" />
        <StatCard label="Completed" value={orders.filter(o => ["Delivered", "Completed"].includes(o.status)).length} color="bg-green-500" />
        <StatCard label="Cancelled" value={orders.filter(o => o.status === "Cancelled").length} color="bg-yellow-500" />
      </div>
    </div>
  );
}

function Orders({ orders, statusColor, openAddForm, handleEditOrder, handleDeleteOrder }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 p-3 text-white rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
        Manage Orders
      </h2>

      <button
        onClick={openAddForm}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
      >
        + Add Order
      </button>

      <OrderTable
        orders={orders}
        statusColor={statusColor}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}

function History({ filterDate, setFilterDate, filteredHistory, statusColor, handleEditOrder, handleDeleteOrder }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 p-3 text-white rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
        Order History
      </h2>

      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => setFilterDate("")}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear
        </button>
      </div>

      <OrderTable
        orders={filteredHistory}
        statusColor={statusColor}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}

function Notifications({ notifications }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">

        <Category title="Product Notifications" color="text-blue-600" items={notifications.product} />
        <Category title="Order Notifications" color="text-orange-600" items={notifications.order} />
        <Category title="Discount Notifications" color="text-green-600" items={notifications.discount} />
        <Category title="System Notifications" color="text-red-600" items={notifications.system} />
      </div>
    </div>
  );
}

function Category({ title, color, items }) {
  return (
    <div>
      <h3 className={`text-xl font-semibold ${color}`}>{title}</h3>
      {items.length ? (
        <ul className="list-disc list-inside space-y-1">
          {items.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No notifications</p>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} p-6 rounded-lg shadow text-white`}>
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function OrderTable({ orders, statusColor, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{order.product}</td>

              <td className="border px-4 py-2">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </td>

              <td className="border px-4 py-2">{order.date}</td>

              <td className="border px-4 py-2">
                <button
                  onClick={() => onEdit(index)}
                  className="px-3 py-1 bg-orange-500 text-white rounded-lg mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

/* POPUP FORMS (NO CHANGE) */

function PopupForm({ title, formData, setFormData, onCancel, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h3 className="text-xl font-bold mb-4">{title}</h3>

        <input
          type="text"
          placeholder="Product Name"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={formData.product}
          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
        />

        <select
          className="w-full border px-3 py-2 mb-3 rounded"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded">
            Cancel
          </button>

          <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmPopup({ message, onYes, onNo }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 w-80 rounded-lg shadow text-center">
        <p className="text-lg font-semibold mb-4">{message}</p>

        <div className="flex justify-center gap-4">
          <button onClick={onNo} className="px-4 py-2 bg-gray-500 text-white rounded">
            No
          </button>
          <button onClick={onYes} className="px-4 py-2 bg-green-500 text-white rounded">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
