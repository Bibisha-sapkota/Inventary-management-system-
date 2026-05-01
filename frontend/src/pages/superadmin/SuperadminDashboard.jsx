import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, Package, ShoppingCart, Receipt, Truck, Bell, Settings, LogOut, Trash2, ShieldAlert, TrendingUp, BarChart2, Activity, ChevronRight, Menu, X, FileText, Edit, Ban, CheckCircle, Plus, AlertTriangle, Search, Download, Upload, Image as ImageIcon } from "lucide-react";
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import { getUser, clearAuth } from "../../utils/auth";
import logoImg from "../../images/logo.png";
import CSVImportModal from "../../components/admin/CSVImportModal";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");
const hdr = () => ({ Authorization: `Bearer ${token()}` });

const StatCard = ({ icon: Icon, label, value, sub, color = "emerald", bgClass = "bg-white" }) => (
  <div className={`${bgClass} rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
    <div className={`w-10 h-10 rounded-xl bg-white/50 text-${color}-600 flex items-center justify-center mb-4`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-black tracking-tight">{value}</p>
    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</p>
    {sub && <p className={`text-[10px] font-bold text-${color}-500 mt-1`}>{sub}</p>}
  </div>
);

const PAGE_SIZE = 10;

const Pagination = ({ currentPage, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm border-blue-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

const TableWrap = ({ children }) => (
  <div className="rounded-2xl border border-gray-100 overflow-auto shadow-sm bg-white">
    <table className="w-full text-left">{children}</table>
  </div>
);
const THead = ({ cols }) => (
  <thead><tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
    {cols.map(c => <th key={c} className="px-5 py-3">{c}</th>)}
  </tr></thead>
);

const Badge = ({ status }) => {
  const map = { active: "bg-emerald-100 text-emerald-600", blocked: "bg-rose-100 text-rose-600", paid: "bg-blue-100 text-blue-600", pending: "bg-amber-100 text-amber-600", completed: "bg-emerald-100 text-emerald-600", admin: "bg-purple-100 text-purple-600", superadmin: "bg-indigo-100 text-indigo-600", customer: "bg-gray-100 text-gray-600" };
  const cls = map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cls}`}>{status}</span>;
};

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
  { id: "usermanagement", icon: ShieldCheck, label: "User Management" },
  { id: "products", icon: Package, label: "Products" },
  { id: "orders", icon: ShoppingCart, label: "Orders" },
  { id: "suppliers", icon: Truck, label: "Suppliers" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "settings", icon: Settings, label: "System Settings" },
];

export default function SuperadminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ users: [], products: [], orders: [], invoices: [], suppliers: [], customers: [], notifications: [] });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      darkMode: false, lowStockAlerts: true, emailNotifications: true, lowStockThreshold: 10,
      taxRate: 13, defaultDiscount: 0, privacyMode: false, hideCustomerContacts: false,
      passwordForExports: true, showNotificationDetails: true, automaticBackups: false
    };
  });
  const [pages, setPages] = useState({ usermanagement: 1, products: 1, orders: 1, suppliers: 1 });
  const [loading, setLoading] = useState(true);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "superadmin") { navigate("/login"); return; }
    fetchAll();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch(`${API}/settings`, { headers: hdr() });
    const json = await res.json();
    if (json.success) setSettings(json.data);
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { ...hdr(), 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uR, pR, oR, iR, sR, cR, nR] = await Promise.all([
        fetch(`${API}/auth/users`, { headers: hdr() }),
        fetch(`${API}/products`, { headers: hdr() }),
        fetch(`${API}/orders`, { headers: hdr() }),
        fetch(`${API}/invoices`, { headers: hdr() }),
        fetch(`${API}/suppliers`, { headers: hdr() }),
        fetch(`${API}/customers`, { headers: hdr() }),
        fetch(`${API}/notifications`, { headers: hdr() }),
      ]);
      const [u, p, o, iv, s, c, n] = await Promise.all([uR.json(), pR.json(), oR.json(), iR.json(), sR.json(), cR.json(), nR.json()]);
      setData({
        users: u.data || [],
        products: p.data || [],
        orders: o.data || [],
        invoices: iv.data || [],
        suppliers: s.data || [],
        customers: c.data || [],
        notifications: (n.data || []).map(x => ({ ...x, id: x._id, unread: !x.isRead })),
      });
      setAdmins(u.data?.filter(x => x.role === 'admin' || x.role === 'superadmin') || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRoleChange = async (id, role) => {
    if (!window.confirm(`Change role to ${role}?`)) return;
    await fetch(`${API}/auth/users/${id}/role`, { method: "PUT", headers: { ...hdr(), "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    fetchAll();
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    // Updated to use explicit /status endpoint
    await fetch(`${API}/auth/users/${id}/status`, { method: "PUT", headers: { ...hdr(), "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    fetchAll();
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Delete permanently?")) return;
    await fetch(`${API}/${endpoint}/${id}`, { method: "DELETE", headers: hdr() });
    fetchAll();
  };

  const handleToggleStatus = async (endpoint, id, currentStatus) => {
    const status = currentStatus === 'blocked' ? 'active' : 'blocked';
    if (!window.confirm(`Change status to ${status}?`)) return;
    const finalEndpoint = endpoint === 'auth/users' ? `${endpoint}/${id}/status` : `${endpoint}/${id}`;
    await fetch(`${API}/${finalEndpoint}`, { method: 'PUT', headers: { ...hdr(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const handleStopOrder = async (id) => {
    if (!window.confirm('Stop (cancel) this order?')) return;
    await fetch(`${API}/orders/${id}/status`, { method: 'PUT', headers: { ...hdr(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Cancelled' }) });
    fetchAll();
  };

  const handleMarkInvoicePaid = async (id) => {
    if (!window.confirm('Mark this invoice as paid?')) return;
    await fetch(`${API}/invoices/${id}`, { method: 'PUT', headers: { ...hdr(), 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'paid' }) });
    fetchAll();
  };

  const handleBlockAll = async (type) => {
    if (!window.confirm(`Are you sure you want to block ALL ${type}?`)) return;
    const items = type === 'admins' ? admins : data.customers;
    const endpoint = type === 'admins' ? 'auth/users' : 'customers';
    await Promise.all(items.filter(i => i.status !== 'blocked').map(i => {
      const finalEndpoint = endpoint === 'auth/users' ? `${endpoint}/${i._id}/status` : `${endpoint}/${i._id}`;
      return fetch(`${API}/${finalEndpoint}`, {
        method: "PUT",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: "blocked" })
      });
    }));
    fetchAll();
  };

  const handleGenericEdit = (type, id) => {
    window.alert(`Full ${type} editing interface opens here.\n(Please use the main Admin Panel for complex form editing)`);
  };

  const handleExportProducts = () => {
    const headers = ["Product ID", "Name", "Category", "Buy Price", "MRP", "Stock", "Status"];
    const csvData = data.products.map(p => [
      p._id,
      `"${p.name}"`,
      `"${p.category || 'General'}"`,
      p.purchasePrice || Math.round((p.price || 0) * 0.7),
      p.price,
      p.stock,
      p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'
    ]);
    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = data.invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const lowStock = data.products.filter(p => p.stock <= 10).length;

  const inventoryValue = data.products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const categoriesCount = new Set(data.products.map(p => p.category || 'Uncategorized')).size;
  const categoryStats = Object.values(data.products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = { category: cat, qty: 0, products: 0, value: 0 };
    acc[cat].qty += (p.stock || 0);
    acc[cat].products += 1;
    acc[cat].value += ((p.stock || 0) * (p.price || 0));
    return acc;
  }, {}));

  if (loading) return <div className="h-screen flex items-center justify-center text-sm font-black uppercase tracking-widest text-emerald-600 animate-pulse">Initializing Command Center...</div>;

  const Sidebar = () => (
    <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-[#0B1120] text-gray-300 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src={logoImg} alt="Stock Inventory Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight leading-none text-white">STOCK <br />INVENTORY</h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">Management<br />System</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="text-sm font-black text-white uppercase tracking-wider">Superadmin User</p>
        <p className="text-[11px] opacity-50">{user?.email}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 relative">
        {/* Active Indicator Line */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-md hidden lg:block" style={{ height: '40px', transform: `translateY(${NAV.findIndex(n => n.id === tab) * 44}px)`, transition: 'transform 0.3s ease' }}></div>

        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${tab === id ? "bg-gray-800 text-white" : "hover:bg-gray-800/50 hover:text-white"}`}>
            <Icon size={18} />
            <span className="flex-1 text-left">{label}</span>
            <ChevronRight size={14} className={`opacity-50 ${tab === id ? 'opacity-100' : ''}`} />
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={() => { clearAuth(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-gray-800 text-[11px] font-black uppercase tracking-wider transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">System Overview</h2>
            <p className="text-[10px] uppercase opacity-40 font-bold tracking-widest mt-1">Live Intelligence Dashboard — All Entities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
            <StatCard bgClass="bg-blue-50/50" icon={Users} label="Total Users" value={data.users.length} color="blue" />
            <StatCard bgClass="bg-purple-50/50" icon={ShieldCheck} label="Total Admins" value={admins.length} color="purple" />
            <StatCard bgClass="bg-emerald-50/50" icon={Users} label="Total Customers" value={data.customers.length} color="emerald" />
            <StatCard bgClass="bg-indigo-50/50" icon={Truck} label="Total Suppliers" value={data.suppliers.length} color="indigo" />
            <StatCard bgClass="bg-rose-50/50" icon={Receipt} label="Total Revenue" value={`Rs.${totalRevenue.toLocaleString()}`} color="rose" />
            <StatCard bgClass="bg-teal-50/50" icon={Package} label="Total Products" value={data.products.length} color="teal" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white bg-blue-500 inline-block px-3 py-1 mb-6">Category Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'Uncategorized'] = (acc[p.category || 'Uncategorized'] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'Uncategorized'] = (acc[p.category || 'Uncategorized'] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white bg-blue-500 inline-block px-3 py-1 mb-6">Sales Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={Object.entries(data.invoices.reduce((acc, i) => {
                    const dateObj = new Date(i.date || new Date());
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    const day = dateObj.getDate();
                    const dateStr = `${month} ${day}`;
                    acc[dateStr] = (acc[dateStr] || 0) + (i.totalAmount || 0);
                    return acc;
                  }, {})).map(([date, amount]) => ({ date, amount, originalDate: new Date(date).getTime() })).sort((a, b) => a.originalDate - b.originalDate).slice(-14)}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip formatter={(val) => `Rs.${val}`} contentStyle={{ borderColor: 'transparent', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {data.orders.slice(0, 5).map(o => (
                  <div key={o._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{o.product?.slice(0, 30) || "—"}</p>
                      <p className="text-[10px] opacity-40 font-medium">{o.customerName || "—"}</p>
                    </div>
                    <Badge status={o.status} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Recent Invoices</h3>
              <div className="space-y-3">
                {data.invoices.slice(0, 5).map(i => (
                  <div key={i._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{i.invoiceId || i._id?.slice(-6)}</p>
                      <p className="text-[10px] opacity-40 font-medium">{i.customer?.name || "—"}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600">Rs.{(i.totalAmount || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      case "usermanagement": return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-black mt-1 text-gray-800">{data.users.length + data.customers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 flex items-center justify-center text-blue-500 bg-white shadow-sm"><ShieldCheck size={24} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-gray-500">Active Users</p>
                <p className="text-3xl font-black mt-1 text-gray-800">{[...data.users, ...data.customers].filter(u => u.status !== 'blocked').length}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 flex items-center justify-center text-emerald-500 bg-white shadow-sm"><CheckCircle size={24} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-gray-500">Admin Users</p>
                <p className="text-3xl font-black mt-1 text-gray-800">{data.users.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-purple-500 flex items-center justify-center text-purple-500 bg-white shadow-sm"><ShieldCheck size={24} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-medium text-gray-500">Customers</p>
                <p className="text-3xl font-black mt-1 text-gray-800">{data.customers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 flex items-center justify-center text-emerald-500 bg-white shadow-sm"><ShieldCheck size={24} /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h3 className="font-bold text-gray-800">All Users</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full md:w-72 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    const allUsers = [...data.users.map(u => ({ ...u, _type: 'admin' })), ...data.customers.map(c => ({ ...c, _type: 'customer', role: 'customer' }))];
                    return allUsers.slice((pages.usermanagement - 1) * PAGE_SIZE, pages.usermanagement * PAGE_SIZE).map(u => (
                      <tr key={u._id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${u.role === 'superadmin' ? 'bg-indigo-500' : u.role === 'admin' ? 'bg-blue-500' : 'bg-indigo-400'}`}>
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-800">{u.name}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><span className="text-gray-300">✉</span> {u.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-600' : u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500 flex items-center gap-2"><span className="text-gray-400">📞</span> {u.phone || '+1 234 567 8900'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={u.status || 'active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => u._type === 'admin' ? handleStatusChange(u._id, u.status) : handleToggleStatus('customers', u._id, u.status)}
                              className={`${u.status === 'blocked' ? 'text-emerald-500 hover:text-emerald-700' : 'text-rose-500 hover:text-rose-700'} transition-colors`}
                              title={u.status === 'blocked' ? 'Unblock' : 'Block'}
                            >
                              {u.status === 'blocked' ? <ShieldCheck size={16} strokeWidth={2.5} /> : <Ban size={16} strokeWidth={2.5} />}
                            </button>
                            <button onClick={() => handleGenericEdit(u._type === 'admin' ? 'Admin' : 'Customer', u._id)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit"><Edit size={16} strokeWidth={2} /></button>
                            <button onClick={() => u._type === 'admin' ? handleDelete('auth/users', u._id) : handleDelete('customers', u._id)} className="text-rose-500 hover:text-rose-700 transition-colors" title="Delete"><Trash2 size={16} strokeWidth={2} /></button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pages.usermanagement}
              totalItems={data.users.length + data.customers.length}
              onPageChange={(p) => setPages({ ...pages, usermanagement: p })}
            />
          </div>
        </div>
      );


      case "reports": return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight">System Reports</h2>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
              Export All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard bgClass="bg-blue-50/50" icon={Package} label="Total Products" value={data.products.length} color="blue" />
            <StatCard bgClass="bg-emerald-50/50" icon={Receipt} label="Inventory Value" value={`Rs. ${inventoryValue.toLocaleString()}`} color="emerald" />
            <StatCard bgClass="bg-purple-50/50" icon={BarChart2} label="Total Categories" value={categoriesCount} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white bg-blue-500 inline-block px-3 py-1 mb-6">Category Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'Uncategorized'] = (acc[p.category || 'Uncategorized'] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'Uncategorized'] = (acc[p.category || 'Uncategorized'] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white bg-blue-500 inline-block px-3 py-1 mb-6">Sales Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={Object.entries(data.invoices.reduce((acc, i) => {
                    const dateObj = new Date(i.date || new Date());
                    const month = dateObj.toLocaleString('default', { month: 'short' });
                    const day = dateObj.getDate();
                    const dateStr = `${month} ${day}`;
                    acc[dateStr] = (acc[dateStr] || 0) + (i.totalAmount || 0);
                    return acc;
                  }, {})).map(([date, amount]) => ({ date, amount, originalDate: new Date(date).getTime() })).sort((a, b) => a.originalDate - b.originalDate).slice(-14)}>
                    <defs>
                      <linearGradient id="colorAmountReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip formatter={(val) => `Rs.${val}`} contentStyle={{ borderColor: 'transparent', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmountReport)" activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2"><BarChart2 size={16} className="text-blue-500" /> Top Selling Products</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(data.orders.reduce((acc, o) => {
                    if (o.status !== "Cancelled") {
                      acc[o.product || "Unknown"] = (acc[o.product || "Unknown"] || 0) + (o.totalPrice || 0);
                    }
                    return acc;
                  }, {})).map(([name, sales]) => ({ name: name.length > 12 ? name.substring(0, 12) + '...' : name, sales })).sort((a, b) => b.sales - a.sales).slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip formatter={(val) => `Rs.${val}`} cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderColor: 'transparent', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                      {
                        Object.entries(data.orders).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ec4899', '#14b8a6', '#6366f1'][index % 8]} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2"><ShieldCheck size={16} className="text-purple-500" /> Top Admin Performance</h3>
              <div className="space-y-5 mt-4 overflow-y-auto pr-2" style={{ maxHeight: '280px' }}>
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No admin data available.</p>
                ) : admins.map((admin, idx) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-purple-500'];
                  const color = colors[idx % colors.length];
                  const maxVal = 5200;
                  const value = Math.max(maxVal - (idx * 800), 500);
                  const units = Math.max(400 - (idx * 50), 20);
                  const width = `${(value / maxVal) * 100}%`;

                  return (
                    <div key={admin._id || idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-sm ${color}`}></div>
                          <span className="text-gray-800">{admin.name || 'Unknown Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-black">Rs. {value.toLocaleString()}</span>
                          <span className="text-gray-400 text-[11px] font-medium">({units} tasks)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inventory Breakdown Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase tracking-tight flex items-center gap-2"><Package size={16} className="text-blue-500" /> INVENTORY BREAKDOWN</h3>
              <p className="text-[10px] uppercase font-bold text-gray-400">{new Date().toDateString()}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">CATEGORY</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">QTY</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">PRODUCTS</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">FINANCIAL VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categoryStats.map(stat => (
                    <tr key={stat.category} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-sm text-gray-800">{stat.category}</td>
                      <td className="py-3 px-4 font-black text-sm text-emerald-600">{stat.qty}</td>
                      <td className="py-3 px-4 font-medium text-sm text-gray-500">{stat.products}</td>
                      <td className="py-3 px-4 font-black text-sm text-emerald-600">Rs. {stat.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

      case "notifications": return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Notification Feed</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {data.notifications.length === 0 ? (
              <div className="p-16 text-center opacity-40">
                <Bell className="mx-auto mb-4" size={48} />
                <p className="font-black uppercase text-sm">No notifications</p>
              </div>
            ) : data.notifications.map((n, i) => (
              <div key={n.id} className={`flex items-start gap-4 px-6 py-5 border-b border-gray-50 last:border-0 relative ${n.unread ? "bg-emerald-50/30" : ""}`}>
                {n.unread && <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full" />}
                <div className="flex-1">
                  <p className="font-bold text-sm">{n.title}</p>
                  <p className="text-[11px] opacity-50 mt-0.5">{n.message}</p>
                  <p className="text-[10px] opacity-30 mt-1">{n.date}</p>
                </div>
                {n.unread && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>
      );


      case "products": return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-blue-600">INVENTORY CATALOG</h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">CENTRALIZED SKU MANAGEMENT & LIFECYCLE CONTROL</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Search products by name, category..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 w-64 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button onClick={handleExportProducts} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-gray-200 shadow-sm">
                <Download size={14} /> EXPORT
              </button>
              <button onClick={() => setShowCSVModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm">
                <Upload size={14} /> IMPORT
              </button>
              <button onClick={() => handleGenericEdit('Product', null)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm">
                <Plus size={14} /> NEW SKU
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Batch No</th>
                  <th className="px-6 py-4">Barcode</th>
                  <th className="px-6 py-4 text-rose-500">Buy Price</th>
                  <th className="px-6 py-4 text-emerald-600">MRP</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.products.slice((pages.products - 1) * PAGE_SIZE, pages.products * PAGE_SIZE).map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" /> : <ImageIcon size={20} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-sm text-emerald-600 uppercase tracking-tight">{p.name}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{p.category || 'GENERAL'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black tracking-widest">PRD-{p._id.slice(-3).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black tracking-widest">BATCH-{new Date().getFullYear()}-{p._id.slice(-3).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black tracking-widest">{p.barcode || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-rose-600">Rs. {p.purchasePrice || Math.round((p.price || 0) * 0.7)}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">Rs. {p.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{p.stock}</span>
                        {p.stock === 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black tracking-widest shadow-sm border border-rose-200">OUT OF STOCK</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm shadow-gray-300 border border-gray-300 ${p.stock > 10 ? 'bg-[#9BA3AF]' : p.stock > 0 ? 'bg-[#9BA3AF]' : 'bg-[#9BA3AF]'}`}>
                        {p.stock > 10 ? 'IN-STOCK' : p.stock > 0 ? 'LOW-STOCK' : 'OUT-OF-STOCK'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleGenericEdit('Product', p._id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors border border-transparent hover:border-gray-200" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => handleDelete('products', p._id)} className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors border border-transparent hover:border-rose-100" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={pages.products}
              totalItems={data.products.length}
              onPageChange={(p) => setPages({ ...pages, products: p })}
            />
          </div>
        </div>
      );

      case "suppliers": return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight">Supplier Network</h2>
            <button onClick={() => handleGenericEdit('Supplier', null)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2 shadow-sm"><Plus size={14} /> Add Supplier</button>
          </div>
          <TableWrap>
            <THead cols={["Supplier", "Contact", "Status", "Actions"]} />
            <tbody className="divide-y divide-gray-50">
              {data.suppliers.slice((pages.suppliers - 1) * PAGE_SIZE, pages.suppliers * PAGE_SIZE).map(s => (
                <tr key={s._id} className="hover:bg-gray-50/50 group">
                  <td className="px-5 py-4 font-bold text-sm">{s.name}</td>
                  <td className="px-5 py-4 text-[11px] font-medium text-gray-500">{s.phone || s.email}</td>
                  <td className="px-5 py-4"><Badge status={s.status || 'active'} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleGenericEdit('Supplier', s._id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => handleToggleStatus('suppliers', s._id, s.status)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Block/Unblock"><Ban size={14} /></button>
                      <button onClick={() => handleDelete('suppliers', s._id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination
            currentPage={pages.suppliers}
            totalItems={data.suppliers.length}
            onPageChange={(p) => setPages({ ...pages, suppliers: p })}
          />
        </div>
      );

      case "orders": return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Order Management</h2>
          <TableWrap>
            <THead cols={["Order ID", "Customer", "Total", "Status", "Actions"]} />
            <tbody className="divide-y divide-gray-50">
              {data.orders.slice((pages.orders - 1) * PAGE_SIZE, pages.orders * PAGE_SIZE).map(o => (
                <tr key={o._id} className="hover:bg-gray-50/50 group">
                  <td className="px-5 py-4 font-bold text-sm">{o.orderId || o._id.slice(-6)}</td>
                  <td className="px-5 py-4 text-[11px] font-medium text-gray-500">{o.customer?.name || "Walk-in"}</td>
                  <td className="px-5 py-4 text-sm font-black text-emerald-600">Rs. {o.totalPrice?.toLocaleString()}</td>
                  <td className="px-5 py-4"><Badge status={o.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {o.status !== 'Cancelled' && (
                        <button onClick={() => handleStopOrder(o._id)} className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" title="Stop Order"><Ban size={12} /> Stop</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination
            currentPage={pages.orders}
            totalItems={data.orders.length}
            onPageChange={(p) => setPages({ ...pages, orders: p })}
          />
        </div>
      );


      case "settings": return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Settings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="space-y-6 divide-y divide-gray-50">
              {[
                { key: "darkMode", title: "Dark Mode", desc: "Toggle between light and dark theme", toggle: true },
                { key: "lowStockAlerts", title: "Low Stock Alerts", desc: "Highlight products when stock is below threshold", toggle: true },
                { key: "emailNotifications", title: "Email Notifications", desc: "Receive important alerts via email", toggle: true },
                { key: "lowStockThreshold", title: "Low Stock Threshold", desc: "Products below this stock are considered low stock", val: settings.lowStockThreshold, unit: "units" },
                { key: "taxRate", title: "Tax Rate", desc: "Applied to invoices after discount", val: settings.taxRate, unit: "%" },
                { key: "defaultDiscount", title: "Default Discount", desc: "Used for manual invoices & scanner default", val: settings.defaultDiscount, unit: "%" },
                { key: "privacyMode", title: "Privacy Mode", desc: "Hide sensitive customer and notification details", toggle: true },
                { key: "hideCustomerContacts", title: "Hide Customer Contacts", desc: "Hide customer email and phone from customer list", toggle: true },
                { key: "passwordForExports", title: "Password for Exports", desc: "Ask for password before exporting data", toggle: true },
                { key: "showNotificationDetails", title: "Show Notification Details", desc: "Show full notification messages in the list", toggle: true },
                { key: "automaticBackups", title: "Automatic Backups", desc: "Enable automatic daily backups (visual only)", toggle: true },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center pt-6 first:pt-0">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{s.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{s.desc}</p>
                  </div>
                  {s.toggle ? (
                    <div onClick={() => saveSettings({ ...settings, [s.key]: !settings[s.key] })} className={`w-10 h-5 ${settings[s.key] ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full relative cursor-pointer transition-colors`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all`} style={{ left: settings[s.key] ? '22px' : '2px' }}></div></div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings[s.key]}
                        onChange={(e) => saveSettings({ ...settings, [s.key]: parseFloat(e.target.value) })}
                        className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] font-black uppercase text-gray-400">{s.unit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-50/30 -z-10"></div>
            <h3 className="font-black text-rose-600 flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Danger Zone</h3>
            <p className="text-xs text-rose-500/70 mb-4 font-medium">Permanently delete all your products, orders, invoices, suppliers, and customers. This action cannot be undone and will reset your dashboard stats to zero.</p>
            <button onClick={() => { if (window.confirm('Are you absolutely sure? This cannot be undone.')) alert('Requires Backend Implementation'); }} className="bg-rose-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-sm">Reset All Data To 0</button>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={() => { localStorage.setItem('appSettings', JSON.stringify(settings)); alert('Settings saved successfully!'); }} className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm">Save Changes</button>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Menu size={20} /></button>
            <div>
              <h2 className="font-black uppercase text-sm tracking-tight capitalize">{NAV.find(n => n.id === tab)?.label || "Dashboard"}</h2>
              <p className="text-[9px] uppercase opacity-30 font-bold tracking-widest">Superadmin Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
              <Activity size={14} /> Refresh
            </button>
            <div className="relative cursor-pointer" onClick={() => setTab("notifications")}>
              <Bell size={20} className="text-gray-400 hover:text-gray-700 transition-colors" />
              {data.notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {data.notifications.filter(n => n.unread).length}
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">{renderTab()}</div>
        </main>
      </div>
      {showCSVModal && (
        <CSVImportModal
          onClose={() => setShowCSVModal(false)}
          onImport={(importedData) => {
            alert(`${importedData.length} products processed. In a real app, we would send this to the backend.`);
            setShowCSVModal(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}
