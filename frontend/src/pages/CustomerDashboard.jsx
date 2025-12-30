import { useState } from "react";
import { getUser, clearAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  // PROFILE
  const [profile, setProfile] = useState({
    photo: null,
    name: user?.name,
    email: user?.email,
    bio: "Customer at Inventory System",
    location: "Nepal",
  });

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    setProfile({ ...profile, photo: URL.createObjectURL(file) });
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ORDERS
  const [orders, setOrders] = useState([
    { product: "Item A", status: "Delivered", date: "2025-11-20" },
    { product: "Item B", status: "Pending", date: "2025-11-22" },
    { product: "Item C", status: "Cancelled", date: "2025-11-23" },
  ]);

  // PRODUCTS
  const [products, setProducts] = useState([
    { name: "Item A", price: 100, stock: 50, description: "High-quality item A" },
    { name: "Item B", price: 200, stock: 20, description: "Popular item B" },
    { name: "Item C", price: 150, stock: 10, description: "Limited edition item C" },
  ]);

  // NOTIFICATIONS
  const [notifications] = useState({
    product: ["Low stock alert on Item A"],
    order: ["Your new order has been placed"],
    discount: ["Discount on Item B ends tomorrow"],
    system: ["System maintenance scheduled tonight"],
  });

  // POPUPS
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

  // PRODUCT POPUPS
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductIndex, setEditProductIndex] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    price: 0,
    stock: 0,
    description: "",
  });

  // LOGOUT
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // ORDER ACTIONS
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
    setShowProductForm(false);
    setEditProductIndex(null);
    setProductFormData({ name: "", price: 0, stock: 0, description: "" });
  };

  const handleConfirm = () => {
    if (confirmType === "add") confirmAdd();
    if (confirmType === "edit") confirmEdit();
    if (confirmType === "delete") confirmDelete();
    if (confirmType === "productAdd") confirmProductAdd();
    if (confirmType === "productEdit") confirmProductEdit();
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

  // PRODUCT ACTIONS
  const openAddProductForm = () => {
    setProductFormData({ name: "", price: 0, stock: 0, description: "" });
    setEditProductIndex(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (index) => {
    setProductFormData(products[index]);
    setEditProductIndex(index);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (index) => {
    setEditProductIndex(index);
    setConfirmType("productDelete");
    setShowConfirm(true);
  };

  const confirmProductAdd = () => {
    setProducts([...products, productFormData]);
    closeAll();
  };

  const confirmProductEdit = () => {
    const updated = [...products];
    updated[editProductIndex] = productFormData;
    setProducts(updated);
    closeAll();
  };

  // UI
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-orange-400 to-blue-500 text-white flex flex-col">
        <div className="p-6 text-center border-b border-white/20">
          <img
            src={profile.photo || "https://via.placeholder.com/100"}
            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-white"
            alt="profile"
          />
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm opacity-80">{profile.email}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          {["dashboard", "orders", "products", "history", "notifications", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition ${
                activeTab === tab ? "bg-white/30" : ""
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}

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
        {activeTab === "dashboard" && <Dashboard orders={orders} />}

        {activeTab === "orders" && (
          <Orders
            orders={orders}
            statusColor={statusColor}
            openAddForm={openAddForm}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === "products" && (
          <ProductsSection
            products={products}
            setProducts={setProducts}
            openAddProductForm={openAddProductForm}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            statusColor={statusColor}
          />
        )}

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

        {activeTab === "notifications" && <Notifications notifications={notifications} />}

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

      {showProductForm && (
        <PopupProductForm
          title={editProductIndex === null ? "Add Product" : "Edit Product"}
          productFormData={productFormData}
          setProductFormData={setProductFormData}
          onCancel={closeAll}
          onSubmit={() => {
            setConfirmType(editProductIndex === null ? "productAdd" : "productEdit");
            setShowConfirm(true);
          }}
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

/* ================= HELPER COMPONENTS ================= */

function Dashboard({ orders }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={orders.length} color="bg-blue-500" />
        <StatCard label="Pending" value={orders.filter((o) => o.status === "Pending").length} color="bg-red-500" />
        <StatCard
          label="Completed"
          value={orders.filter((o) => ["Delivered", "Completed"].includes(o.status)).length}
          color="bg-green-500"
        />
        <StatCard label="Cancelled" value={orders.filter((o) => o.status === "Cancelled").length} color="bg-yellow-500" />
      </div>
    </div>
  );
}

function Orders({ orders, statusColor, openAddForm, handleEditOrder, handleDeleteOrder }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage Orders</h2>
      <button onClick={openAddForm} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
        + Add Order
      </button>
      <OrderTable orders={orders} statusColor={statusColor} onEdit={handleEditOrder} onDelete={handleDeleteOrder} />
    </div>
  );
}

function History({ filterDate, setFilterDate, filteredHistory, statusColor, handleEditOrder, handleDeleteOrder }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Order History</h2>

      <div className="mb-4 flex gap-4">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border px-3 py-2 rounded" />
        <button onClick={() => setFilterDate("")} className="px-4 py-2 bg-gray-500 text-white rounded">
          Clear
        </button>
      </div>

      <OrderTable orders={filteredHistory} statusColor={statusColor} onEdit={handleEditOrder} onDelete={handleDeleteOrder} />
    </div>
  );
}

function Notifications({ notifications }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Notifications</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <Category title="Product Notifications" items={notifications.product} />
        <Category title="Order Notifications" items={notifications.order} />
        <Category title="Discount Notifications" items={notifications.discount} />
        <Category title="System Notifications" items={notifications.system} />
      </div>
    </div>
  );
}

function ProfileSection({ profile, handleProfilePhoto, handleProfileChange }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl">
      <h2 className="text-3xl font-bold mb-6">Your Profile</h2>
      <div className="flex items-center gap-6">
        <img src={profile.photo || "https://via.placeholder.com/100"} className="w-28 h-28 rounded-full border object-cover" alt="profile" />
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg">
          Upload Photo
          <input type="file" className="hidden" onChange={handleProfilePhoto} />
        </label>
      </div>
      <div className="mt-6 space-y-4">
        <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
        <input name="email" value={profile.email} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
        <textarea name="bio" rows={3} value={profile.bio} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
        <input name="location" value={profile.location} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
      </div>
    </div>
  );
}

function ProductsSection({ products, setProducts, openAddProductForm, handleEditProduct, handleDeleteProduct }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Product Management</h2>
      <button onClick={openAddProductForm} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
        + Add Product
      </button>
      <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
    </div>
  );
}

/* TABLES + POPUPS BELOW */

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} p-6 rounded-lg shadow text-white`}>
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function Category({ title, items }) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {items.length ? <ul className="list-disc list-inside space-y-1">{items.map((msg, i) => <li key={i}>{msg}</li>)}</ul> : <p className="text-gray-500">No notifications</p>}
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
          {orders.map((o, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{i + 1}</td>
              <td className="border px-4 py-2">{o.product}</td>
              <td className="border px-4 py-2">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColor[o.status]}`}>{o.status}</span>
              </td>
              <td className="border px-4 py-2">{o.date}</td>
              <td className="border px-4 py-2">
                <button onClick={() => onEdit(i)} className="px-3 py-1 bg-orange-500 text-white rounded-lg mr-2">
                  Edit
                </button>
                <button onClick={() => onDelete(i)} className="px-3 py-1 bg-red-500 text-white rounded-lg">
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

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{i + 1}</td>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.price}</td>
              <td className="border px-4 py-2">{p.stock}</td>
              <td className="border px-4 py-2">{p.description}</td>
              <td className="border px-4 py-2">
                <button onClick={() => onEdit(i)} className="px-3 py-1 bg-orange-500 text-white rounded-lg mr-2">
                  Edit
                </button>
                <button onClick={() => onDelete(i)} className="px-3 py-1 bg-red-500 text-white rounded-lg">
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

/* POPUPS */

function PopupForm({ title, formData, setFormData, onCancel, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <input type="text" placeholder="Product Name" className="w-full border px-3 py-2 mb-3 rounded" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
        <select className="w-full border px-3 py-2 mb-3 rounded" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="date" className="w-full border px-3 py-2 mb-3 rounded" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded">
            Cancel
          </button>
          <button onClick={onSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function PopupProductForm({ title, productFormData, setProductFormData, onCancel, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow w-96">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <input type="text" placeholder="Product Name" className="w-full border px-3 py-2 mb-2 rounded" value={productFormData.name} onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })} />
        <input type="number" placeholder="Price" className="w-full border px-3 py-2 mb-2 rounded" value={productFormData.price} onChange={(e) => setProductFormData({ ...productFormData, price: parseInt(e.target.value || 0) })} />
        <input type="number" placeholder="Stock" className="w-full border px-3 py-2 mb-2 rounded" value={productFormData.stock} onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value || 0) })} />
        <textarea placeholder="Description" className="w-full border px-3 py-2 mb-2 rounded" value={productFormData.description} onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}></textarea>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded">
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
      <div className="bg-white p-6 rounded w-80 shadow-lg text-center">
        <p className="mb-6">{message}</p>
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
