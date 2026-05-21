import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { QRCodeCanvas } from "qrcode.react";
import { LayoutDashboard, Users, ShieldCheck, Package, ShoppingCart, Receipt, Truck, Bell, Settings, LogOut, Trash2, ShieldAlert, TrendingUp, BarChart2, RotateCw, ChevronRight, ChevronDown, Menu, X, FileText, Edit, Ban, CheckCircle, Plus, AlertTriangle, Search, Download, Upload, Image as ImageIcon, Phone, Mail, ShoppingBag, Scan, Activity, ArrowRight, Eye, EyeOff, Printer, User, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../api/axios";
import { getUser, clearAuth } from "../../utils/auth";
import logoImg from "../../images/logo.png";
import CSVImportModal from "../../components/admin/CSVImportModal";
import ManualInvoiceModal from "../../components/admin/modals/ManualInvoiceModal";
import BarcodeScannerInvoiceModal from "../../components/admin/BarcodeScannerInvoiceModal";
import SupplierFormModal from "../../components/admin/modals/SupplierFormModal";
import ProductFormModal from "../../components/admin/modals/ProductFormModal";
import OrderFormModal from "../../components/admin/modals/OrderFormModal";
import CustomerFormModal from "../../components/admin/modals/CustomerFormModal";
import ExchangeFormModal from "../../components/admin/modals/ExchangeFormModal";
import { handlePreviewInvoice, handleDownloadInvoice, handlePrintInvoice } from "../../components/admin/InvoiceUtils";
import { Pagination } from "../../components/admin/AdminUI";
import SuppliersTab from "../../components/admin/SuppliersTab";
import NotificationsTab from "../../components/admin/NotificationsTab";
import ExchangesTab from "../../components/admin/ExchangesTab";
import HistoryTab from "../../components/admin/HistoryTab";
import BannerManagement from "./BannerManagement";
import ProfileTab from "../../components/admin/ProfileTab";
import Header from "../../components/admin/Header";
import { StatCard, QuickActionBtn } from "../../components/admin/AdminUI";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");
const hdr = () => ({ Authorization: `Bearer ${token()}` });

const StatCardLocal = ({ icon: Icon, label, value, sub, color = "emerald", trend }) => {
  const colors = {
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-100",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-100",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-100",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-100",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-100",
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-100",
    teal: "from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-100",
  };
  const c = colors[color] || colors.emerald;

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 group ${c.split(' ').pop()}`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity ${c.split(' ').slice(0, 2).join(' ')}`}></div>

      <div className="flex items-start justify-between relative z-10">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${c.split(' ').slice(0, 2).join(' ')}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-3xl font-black tracking-tighter text-gray-900 mb-1">{value}</p>
        <p className="text-[11px] font-bold uppercase opacity-50 tracking-widest text-gray-500">{label}</p>
        {sub && <p className="text-[10px] font-black text-gray-400 mt-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          {sub}
        </p>}
      </div>
    </div>
  );
};

const PAGE_SIZE = 10;



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
  { id: "invoices", icon: Receipt, label: "Invoices" },
  { id: "suppliers", icon: Truck, label: "Suppliers" },
  { id: "exchanges", icon: RotateCw, label: "Exchanges" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "promotions", icon: ImageIcon, label: "Banner Promotion" },
  { id: "activityhistory", icon: Activity, label: "Activity History" },
  { id: "settings", icon: Settings, label: "System Settings" },
];

export default function SuperadminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ users: [], products: [], orders: [], invoices: [], suppliers: [], customers: [], notifications: [], exchanges: [], historyLogs: [] });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      darkMode: false, lowStockAlerts: true, emailNotifications: true, lowStockThreshold: 10,
      taxRate: 13, defaultDiscount: 0, privacyMode: false, hideCustomerContacts: false,
      passwordForExports: true, showNotificationDetails: true, automaticBackups: false
    };
  });
  const [pages, setPages] = useState({ usermanagement: 1, products: 1, orders: 1, invoices: 1, suppliers: 1, notifications: 1, exchanges: 1, activityhistory: 1 });
  const [selectedSupplierForLots, setSelectedSupplierForLots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "", role: "admin", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("all"); // "all", "admin", "customer"
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showScannerInvoice, setShowScannerInvoice] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [supplierFormData, setSupplierFormData] = useState({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "Regular", status: "Active", amountPaid: 0 });
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({ name: "", sno: "", productId: "", batchNo: "", barcode: "", category: "General", buyingPrice: 0, price: 0, stock: 0, maxStock: 100, expiryDate: "", status: "Active", image: "", supplier: "", supplierName: "" });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({ sno: "", customer: "", email: "", phone: "", product: "", amount: 0, status: "Pending", date: new Date().toISOString().split('T')[0], quantity: 1 });
  // Sidebar expand states
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
  const [invoicesMenuOpen, setInvoicesMenuOpen] = useState(false);
  const [suppliersMenuOpen, setSuppliersMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [exchangesMenuOpen, setExchangesMenuOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    sno: "", date: new Date().toISOString().split('T')[0], customer: "", membershipId: "", customerEmail: "", items: [{ product: "", productId: "", batchNo: "", qty: 1, price: 0 }], paymentMethod: "Cash"
  });
  const [reportPeriod, setReportPeriod] = useState('Daily');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({ name: "", email: "", phone: "", address: "", status: "active" });
  const [editOrderId, setEditOrderId] = useState(null);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeFormData, setExchangeFormData] = useState({ type: "customer", customerName: "", returnedProductId: "", newProductId: "", quantity: 1, reason: "", restocked: true });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  const [profile, setProfile] = useState(() => {
    const u = getUser();
    return {
      name: u?.name || 'Superadmin',
      email: u?.email || '',
      phone: u?.phone || '',
      photo: u?.avatar || '',
      role: u?.role || 'superadmin',
      location: u?.location || ''
    };
  });
  const profilePhotoInputRef = useRef(null);

  const cardClass = settings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100";
  const labelClass = `block text-xs font-black uppercase tracking-widest mb-2 ${settings.darkMode ? "text-gray-400" : "text-gray-400"}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border font-bold ${settings.darkMode ? "bg-gray-900 border-gray-700 text-white focus:border-emerald-500" : "bg-gray-50 border-gray-100 focus:border-emerald-500"}`;

  // Header states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("US English");

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "superadmin") { navigate("/login"); return; }
    fetchAll();
    fetchSettings();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('esewa_success')) {
      alert('✅ eSewa Payment Successful!');
      const targetTab = params.get('tab') || 'invoices';
      setTab(targetTab);
      navigate('/superadmin', { replace: true });
    }
    if (params.get('esewa_failure')) {
      alert('❌ eSewa Payment Failed!');
      const targetTab = params.get('tab') || 'invoices';
      setTab(targetTab);
      navigate('/superadmin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [settings.darkMode]);

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
      const endpoints = {
        users: `${API}/auth/users`,
        products: `${API}/products?limit=1000`,
        orders: `${API}/orders`,
        invoices: `${API}/invoices`,
        suppliers: `${API}/suppliers`,
        customers: `${API}/customers`,
        notifications: `${API}/notifications`,
        exchanges: `${API}/exchanges`,
        history: `${API}/history`
      };

      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          try {
            const res = await fetch(url, { headers: hdr() });
            if (res.status === 401) {
              clearAuth();
              window.location.href = '/login';
              return { key, data: [] };
            }
            if (!res.ok) return { key, data: [] };
            const json = await res.json();
            return { key, data: json.data || [] };
          } catch (e) {
            console.error(`Error fetching ${key}:`, e);
            return { key, data: [] };
          }
        })
      );

      const newData = results.reduce((acc, curr) => {
        acc[curr.key] = curr.data;
        return acc;
      }, {});

      setData({
        ...newData,
        notifications: (newData.notifications || []).map(x => ({ ...x, id: x._id, unread: !x.isRead })),
        historyLogs: newData.history || []
      });

      setAdmins((newData.users || []).filter(x => x.role === 'admin' || x.role === 'superadmin'));

      // Calculate totals
      const revenue = (newData.invoices || []).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const invValue = (newData.products || []).reduce((sum, prod) => sum + ((prod.stock || 0) * (prod.price || 0)), 0);
      const catCount = new Set((newData.products || []).map(prod => prod.category).filter(Boolean)).size;

      setTotalRevenue(revenue);
      setInventoryValue(invValue);
      setCategoriesCount(catCount);
      setLowStock((newData.products || []).filter(p => p.stock <= 10).length);

    } catch (e) {
      console.error("Superadmin Global Fetch Error:", e);
    }
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

  const handleAddUser = async (e) => {
    if (e) e.preventDefault();
    if (!userFormData.name || !userFormData.email || !userFormData.password || !userFormData.phone) {
      alert("Please fill name, email, password, and phone number.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(userFormData.password)) {
      alert("Password must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/users`, {
        method: "POST",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify(userFormData)
      });
      if (res.status === 401) {
        clearAuth();
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowAddUserModal(false);
        setUserFormData({ name: "", email: "", password: "", role: "admin", phone: "" });
        fetchAll();
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      alert("Network Error");
    }
    setIsSubmitting(false);
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

  const handleNotificationClick = async (notif) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    }));

    if (notif.unread) {
      try {
        await fetch(`${API}/notifications/${notif.id}`, {
          method: "PUT",
          headers: hdr()
        });
      } catch (err) { console.error("Error marking notification read:", err); }
    }

    if (tab !== "notifications") {
      setTab("notifications");
    }
    setShowNotificationDropdown(false);
  };

  const handleMarkAllNotificationsRead = async () => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, unread: false }))
    }));
    try {
      await fetch(`${API}/notifications/mark-all-read`, {
        method: "PUT",
        headers: hdr()
      });
    } catch (err) { console.error("Error marking all notifications read:", err); }
  };

  const handleSaveInvoice = async () => {
    if (!invoiceFormData.customer.trim()) { alert("Customer Name Required!"); return; }
    setIsSubmittingInvoice(true);
    const subtotal = invoiceFormData.items.reduce((s, i) => s + (i.qty * i.price), 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    try {
      const res = await fetch(`${API}/invoices`, {
        method: "POST",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoiceFormData.sno,
          date: invoiceFormData.date,
          customer: invoiceFormData.customer,
          membershipId: invoiceFormData.membershipId,
          customerEmail: invoiceFormData.customerEmail,
          itemsList: invoiceFormData.items,
          subtotal: subtotal,
          tax: tax,
          discount: 0,
          totalAmount: total,
          paymentMethod: invoiceFormData.paymentMethod,
          paymentStatus: "paid",
          taxRate: 13,
          discountRate: 0
        })
      });
      if (res.ok) {
        const json = await res.json();
        const createdInvoice = json.data || {};
        alert("Invoice generated successfully!");
        setShowInvoiceForm(false);
        fetchAll();
        setTab("invoices");

        if (invoiceFormData.paymentMethod === 'eSewa') {
          initiateEsewaPayment(createdInvoice.invoiceId || invoiceFormData.sno, subtotal, 0, tax, total);
        } else if (invoiceFormData.paymentMethod === 'Khalti') {
          initiateKhaltiPayment(createdInvoice.invoiceId || invoiceFormData.sno, total);
        }
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to save"));
      }
    } catch (err) { alert("Network Error"); }
    finally { setIsSubmittingInvoice(false); }
  };

  const handleSaveScannerInvoice = async (invoiceData) => {
    setIsSubmittingInvoice(true);
    try {
      const res = await fetch(`${API}/invoices`, {
        method: "POST",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify({
          date: invoiceData.date,
          customer: invoiceData.customer,
          membershipId: invoiceData.membershipId,
          customerEmail: invoiceData.customerEmail,
          itemsList: invoiceData.items.map(item => ({
            product: item.product,
            productId: item.productId,
            qty: item.qty,
            price: item.price
          })),
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          discount: invoiceData.discount,
          totalAmount: invoiceData.grandTotal,
          paymentMethod: invoiceData.paymentMethod,
          taxRate: invoiceData.taxRate,
          discountRate: invoiceData.discountRate,
          sourceOrderId: invoiceData.sourceOrderId,
          paymentStatus: "paid"
        })
      });

      if (res.ok) {
        const json = await res.json();
        const createdInvoice = json.data || {};
        alert("Invoice created successfully!");
        setShowScannerInvoice(false);
        fetchAll();
        setTab("invoices");

        if (invoiceData.paymentMethod === 'eSewa') {
          initiateEsewaPayment(createdInvoice.invoiceId || Date.now(), invoiceData.subtotal, invoiceData.discount, invoiceData.tax, invoiceData.grandTotal);
        } else if (invoiceData.paymentMethod === 'Khalti') {
          initiateKhaltiPayment(createdInvoice.invoiceId || Date.now(), invoiceData.grandTotal);
        }
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to save invoice"));
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      const url = editSupplierId ? `${API}/suppliers/${editSupplierId}` : `${API}/suppliers`;
      const method = editSupplierId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify(supplierFormData)
      });
      if (res.ok) {
        alert("Supplier saved globally!");
        setShowSupplierForm(false);
        setEditSupplierId(null);
        setSupplierFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "Regular", status: "Active", amountPaid: 0 });
        fetchAll();
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to save supplier"));
      }
    } catch (err) { alert("Network Error"); }
  };

  const handleSaveCustomer = async () => {
    try {
      const url = editCustomerId ? `${API}/customers/${editCustomerId}` : `${API}/customers`;
      const method = editCustomerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify(customerFormData)
      });
      if (res.ok) {
        alert("Customer profile updated globally!");
        setShowCustomerModal(false);
        setEditCustomerId(null);
        setCustomerFormData({ name: "", email: "", phone: "", address: "", status: "active" });
        fetchAll();
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to save customer"));
      }
    } catch (err) { alert("Network Error"); }
  };

  const initiateEsewaPayment = (invoiceId, subtotal, discount, tax, grandTotal) => {
    const taxableAmount = (subtotal - discount).toFixed(2);
    const taxAmt = tax.toFixed(2);
    const totalAmt = grandTotal.toFixed(2);
    const uuid = invoiceId + "-" + Date.now();
    const secret = '8gBm/:&EnhH.1/q';
    const productCode = 'EPAYTEST';
    const message = `total_amount=${totalAmt},transaction_uuid=${uuid},product_code=${productCode}`;
    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

    const fields = {
      amount: taxableAmount,
      tax_amount: taxAmt,
      total_amount: totalAmt,
      transaction_uuid: uuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: window.location.origin + '/superadmin?tab=invoices&esewa_success=true',
      failure_url: window.location.origin + '/superadmin?tab=invoices&esewa_failure=true',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature
    };

    for (const key in fields) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', fields[key]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const initiateKhaltiPayment = (invoiceId, grandTotal) => {
    const loadKhalti = () => {
      return new Promise((resolve) => {
        if (window.KhaltiCheckout) return resolve();
        const script = document.createElement("script");
        script.src = "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadKhalti().then(() => {
      const config = {
        publicKey: "test_public_key_6d757813cc1941faafbd9ef30523b9fd",
        productIdentity: `${invoiceId}-${Date.now()}`,
        productName: "Invoice " + invoiceId,
        productUrl: window.location.origin,
        paymentPreference: ["KHALTI"],
        eventHandler: {
          onSuccess(payload) { alert("Payment successful!"); },
          onError(error) { alert("Payment Error!"); },
          onClose() { console.log('Khalti widget closed'); }
        }
      };
      const checkout = new window.KhaltiCheckout(config);
      checkout.show({ amount: Math.round(Number(grandTotal || 0) * 100) });
    });
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
    if (type === 'Supplier') {
      const found = data.suppliers.find(s => s._id === id);
      if (found) {
        setSupplierFormData({
          name: found.name,
          contactPerson: found.contactPerson || "",
          email: found.email,
          phone: found.phone,
          address: found.address || "",
          category: found.category || "Regular",
          status: found.status || "Active",
          amountPaid: found.amountPaid || 0
        });
        setEditSupplierId(id);
      } else {
        setSupplierFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "Regular", status: "Active", amountPaid: 0 });
        setEditSupplierId(null);
      }
      setShowSupplierForm(true);
      return;
    }

    if (type === 'Product') {
      const found = id ? data.products.find(p => p._id === id) : null;
      if (found) {
        setProductFormData({
          _id: found._id,
          name: found.name || "",
          sno: found.sno || "",
          productId: found.productId || "",
          batchNo: found.batchNo || "",
          barcode: found.barcode || "",
          category: found.category || "General",
          buyingPrice: found.buyingPrice || found.purchasePrice || 0,
          price: found.price || 0,
          stock: found.stock || 0,
          maxStock: found.maxStock || 100,
          expiryDate: found.expiryDate ? found.expiryDate.substring(0, 10) : "",
          status: found.status || "Active",
          image: found.image || "",
          supplier: found.supplier || "",
          supplierName: found.supplierName || ""
        });
      } else {
        setProductFormData({ name: "", sno: "", productId: "", batchNo: "", barcode: "", category: "General", buyingPrice: 0, price: 0, stock: 0, maxStock: 100, expiryDate: "", status: "Active", image: "", supplier: "", supplierName: "" });
      }
      setShowProductForm(true);
      return;
    }

    if (type === 'Customer' || type === 'Admin') {
      const found = type === 'Admin' 
        ? data.users.find(u => u._id === id)
        : data.customers.find(c => c._id === id);
      
      if (type === 'Admin' && found) {
        setUserFormData({ name: found.name, email: found.email, password: "", role: found.role, phone: found.phone || "" });
        setShowAddUserModal(true);
      } else if (found) {
        setCustomerFormData({ name: found.name, email: found.email, phone: found.phone, address: found.address || "", status: found.status || "active" });
        setEditCustomerId(id);
        setShowCustomerModal(true);
      }
      return;
    }

    if (type === 'Order') {
      const found = data.orders.find(o => o._id === id);
      if (found) {
        setOrderFormData({
          _id: found._id,
          sno: found.orderId || found.sno,
          customer: found.customerName || found.customer?.name || "",
          email: found.email || found.customer?.email || "",
          phone: found.phone || found.customer?.phone || "",
          product: found.product,
          amount: found.totalPrice || found.amount || 0,
          status: found.status || "Pending",
          date: found.date ? found.date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setEditOrderId(id);
      } else {
        setOrderFormData({ sno: "", customer: "", email: "", phone: "", product: "", amount: 0, status: "Pending", date: new Date().toISOString().split('T')[0] });
        setEditOrderId(null);
      }
      setShowOrderForm(true);
      return;
    }
  };

  const handleSaveOrder = async () => {
    if (!orderFormData.customer?.trim()) { alert("Customer Name is required!"); return; }
    if (!orderFormData.product?.trim()) { alert("Product / Description is required!"); return; }
    try {
      const isEdit = !!orderFormData._id;
      const url = isEdit ? `${API}/orders/${orderFormData._id}` : `${API}/orders`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderFormData.sno || `ORD-${Date.now().toString().slice(-6)}`,
          customerName: orderFormData.customer,
          email: orderFormData.email,
          phone: orderFormData.phone,
          product: orderFormData.product,
          totalPrice: Number(orderFormData.amount) || 0,
          status: orderFormData.status,
          date: orderFormData.date,
          quantity: Number(orderFormData.quantity) || 1
        })
      });
      const json = await res.json();
      if (res.ok) {
        alert(isEdit ? "Order updated successfully!" : "Order created successfully!");
        setShowOrderForm(false);
        setEditOrderId(null);
        setOrderFormData({ sno: "", customer: "", email: "", phone: "", product: "", amount: 0, status: "Pending", date: new Date().toISOString().split('T')[0], quantity: 1 });
        fetchAll();
      } else {
        alert("Error: " + (json.message || "Failed to save order"));
      }
    } catch (err) {
      alert("Network Error: " + err.message);
    }
  };

  const handleSaveProduct = async () => {
    if (!productFormData.name?.trim()) { alert("Product Name is required!"); return; }
    if (productFormData.price <= 0) { alert("Selling Price must be greater than 0!"); return; }
    try {
      const isEdit = !!productFormData._id;
      const url = isEdit ? `${API}/products/${productFormData._id}` : `${API}/products`;
      const method = isEdit ? "PUT" : "POST";
      const body = {
        name: productFormData.name,
        sno: productFormData.sno,
        productId: productFormData.productId,
        batchNo: productFormData.batchNo,
        barcode: productFormData.barcode,
        category: productFormData.category,
        buyingPrice: productFormData.buyingPrice,
        purchasePrice: productFormData.buyingPrice,
        price: productFormData.price,
        stock: productFormData.stock,
        maxStock: productFormData.maxStock,
        expiryDate: productFormData.expiryDate || null,
        status: productFormData.status,
        image: productFormData.image,
        supplier: productFormData.supplier || null,
        supplierName: productFormData.supplierName
      };
      const res = await fetch(url, {
        method,
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (res.ok) {
        alert(isEdit ? "Product updated successfully!" : "Product added successfully!");
        setShowProductForm(false);
        setProductFormData({ name: "", sno: "", productId: "", batchNo: "", barcode: "", category: "General", buyingPrice: 0, price: 0, stock: 0, maxStock: 100, expiryDate: "", status: "Active", image: "", supplier: "", supplierName: "" });
        fetchAll();
      } else {
        alert("Error: " + (json.message || "Failed to save product"));
      }
    } catch (err) {
      alert("Network Error: " + err.message);
    }
  };

  const handleSaveExchange = async () => {
    if (!exchangeFormData.returnedProductId) {
      alert("Please select a Returned Product.");
      return;
    }
    if (!exchangeFormData.reason) {
      alert("Please select a Reason for Exchange.");
      return;
    }
    if (!exchangeFormData.billNumber) {
      alert("Bill number is required.");
      return;
    }

    try {
      if (exchangeFormData.exchangeId) {
         await fetch(`${API}/exchanges/${exchangeFormData.exchangeId}`, {
           method: 'DELETE',
           headers: hdr()
         });
      }

      const dataToSend = { ...exchangeFormData };
      delete dataToSend.exchangeId;

      const res = await fetch(`${API}/exchanges`, {
        method: "POST",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      if (res.ok) {
        alert("Exchange logged successfully!");
        setShowExchangeForm(false);
        setExchangeFormData({ type: "customer", customerName: "", supplierName: "", returnedProductId: "", newProductId: "", quantity: 1, reason: "", restocked: true, amountToPay: 0, amountToRefund: 0, purchaseDate: "", batchNo: "", billNumber: "", membershipId: "" });
        fetchAll();
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to save exchange"));
      }
    } catch (err) { alert("Network Error: " + err.message); }
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

  const handleExportAllReports = () => {
    // 1. Category Performance
    const categoryData = Object.values(data.products.reduce((acc, p) => {
      const cat = p.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = { category: cat, products: 0, stock: 0, value: 0, sales: 0 };
      acc[cat].products += 1;
      acc[cat].stock += (p.stock || 0);
      acc[cat].value += ((p.stock || 0) * (p.price || 0));
      return acc;
    }, {}));

    data.orders.forEach(o => {
      if (o.status !== "Cancelled") {
        const product = data.products.find(p => p._id === o.productId);
        if (product) {
          const cat = product.category || "Uncategorized";
          const catData = categoryData.find(c => c.category === cat);
          if (catData) catData.sales += (o.totalPrice || 0);
        }
      }
    });

    const catHeaders = ["CATEGORY", "PRODUCTS", "TOTAL STOCK", "INVENTORY VALUE", "SALES REVENUE"];
    const catRows = categoryData.map(c => [c.category, c.products, c.stock, c.value, c.sales]);

    // 2. Admin Performance
    const adminPerformance = data.users.map(admin => {
      const adminOrders = data.orders.filter(o => o.user === admin._id && o.status !== 'Cancelled');
      const rev = adminOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      return { name: admin.name, revenue: rev, orders: adminOrders.length };
    }).sort((a, b) => b.revenue - a.revenue);

    const adminHeaders = ["ADMIN NAME", "REVENUE GENERATED", "TOTAL ORDERS"];
    const adminRows = adminPerformance.map(a => [a.name, a.revenue, a.orders]);

    // 3. Top Products
    const productSales = Object.entries(data.orders.reduce((acc, o) => {
      if (o.status !== "Cancelled" && o.product) {
        acc[o.product] = (acc[o.product] || 0) + (o.totalPrice || 0);
      }
      return acc;
    }, {})).map(([name, sales]) => [name, sales]).sort((a, b) => b[1] - a[1]).slice(0, 20);

    const prodHeaders = ["PRODUCT NAME", "TOTAL SALES"];

    // Combine all into one CSV with sections
    let csvContent = "SYSTEM PERFORMANCE REPORT\n";
    csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;

    csvContent += "SECTION 1: CATEGORY PERFORMANCE\n";
    csvContent += catHeaders.join(",") + "\n";
    csvContent += catRows.map(r => r.join(",")).join("\n") + "\n\n";

    csvContent += "SECTION 2: ADMIN PERFORMANCE\n";
    csvContent += adminHeaders.join(",") + "\n";
    csvContent += adminRows.map(r => r.join(",")).join("\n") + "\n\n";

    csvContent += "SECTION 3: TOP SELLING PRODUCTS\n";
    csvContent += prodHeaders.join(",") + "\n";
    csvContent += productSales.map(r => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `system_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryStats = Object.values(data.products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = { category: cat, qty: 0, products: 0, value: 0 };
    acc[cat].qty += (p.stock || 0);
    acc[cat].products += 1;
    acc[cat].value += ((p.stock || 0) * (p.price || 0));
    return acc;
  }, {}));

  if (loading) return <div className="h-screen flex items-center justify-center text-sm font-black uppercase tracking-widest text-emerald-600 animate-pulse">Initializing Command Center...</div>;

  const Sidebar = () => {
    const navItemClass = (ids) => {
      const isActive = Array.isArray(ids) ? ids.includes(tab) : tab === ids;
      return `flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${isActive
          ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`;
    };
    return (
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-72 bg-[#0B1120] text-gray-300 flex flex-col transition-all duration-500 shadow-[20px_0_60px_rgba(0,0,0,0.2)] border-r border-[#1e293b] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
        {/* Logo + User */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-8 group cursor-pointer" onClick={() => { setTab("dashboard"); setSidebarOpen(false); }}>
            <div className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_5px_15px_rgba(255,255,255,0.1)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none text-white">STOCK <br />INVENTORY</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2">Superadmin Portal</p>
            </div>
          </div>
          <div 
            className="mt-2 px-1 translate-x-1 cursor-pointer hover:opacity-80 transition-all"
            onClick={() => { setTab("profile"); setSidebarOpen(false); }}
          >
            <p className="font-black text-sm uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Superadmin</p>
            <p className="text-[10px] font-bold opacity-50 truncate text-gray-300">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <ul className="space-y-1.5">
            {/* Overview */}
            <li>
              <button onClick={() => { setTab("dashboard"); setSidebarOpen(false); }} className={navItemClass("dashboard")}>
                <span className="flex items-center gap-3"><LayoutDashboard size={20} /><span>Overview</span></span>
                {tab === "dashboard" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>

            {/* Products */}
            <li>
              <button onClick={() => setProductsMenuOpen(!productsMenuOpen)} className={navItemClass("products")}>
                <span className="flex items-center gap-3"><Package size={20} /><span>Products</span></span>
                {productsMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {productsMenuOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li><button onClick={() => { setTab("products"); setSidebarOpen(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left ${tab === "products" ? "text-white bg-white/5" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}><span className={`w-1.5 h-1.5 rounded-full ${tab === "products" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-40"}`} />Product List</button></li>
                  <li><button onClick={() => { setTab("products"); setShowProductForm(true); setSidebarOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Add Product</button></li>
                </ul>
              )}
            </li>

            {/* User Management */}
            <li>
              <button onClick={() => { setTab("usermanagement"); setSidebarOpen(false); }} className={navItemClass("usermanagement")}>
                <span className="flex items-center gap-3"><ShieldCheck size={20} /><span>User Management</span></span>
                {tab === "usermanagement" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>



            {/* Orders */}
            <li>
              <button onClick={() => setOrdersMenuOpen(!ordersMenuOpen)} className={navItemClass("orders")}>
                <span className="flex items-center gap-3"><ShoppingCart size={20} /><span>Orders</span></span>
                {ordersMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {ordersMenuOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li><button onClick={() => { setTab("orders"); setSidebarOpen(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left ${tab === "orders" ? "text-white bg-white/5" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}><span className={`w-1.5 h-1.5 rounded-full ${tab === "orders" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-40"}`} />Order Ledger</button></li>
                  <li><button onClick={() => { setTab("orders"); setShowOrderForm(true); setSidebarOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Create Order</button></li>
                </ul>
              )}
            </li>

            {/* Invoices */}
            <li>
              <button onClick={() => setInvoicesMenuOpen(!invoicesMenuOpen)} className={navItemClass("invoices")}>
                <span className="flex items-center gap-3"><Receipt size={20} /><span>Invoices</span></span>
                {invoicesMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {invoicesMenuOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li><button onClick={() => { setTab("invoices"); setSidebarOpen(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left ${tab === "invoices" ? "text-white bg-white/5" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}><span className={`w-1.5 h-1.5 rounded-full ${tab === "invoices" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-40"}`} />Financial Ledger</button></li>
                  <li><button onClick={async () => { 
                    setTab("invoices"); 
                    let nextId = "";
                    try {
                      const res = await fetch(`${API}/invoices/next-id`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                      const json = await res.json();
                      if (json.success) nextId = json.nextId;
                    } catch (e) { console.error("Error fetching next ID:", e); }
                    setInvoiceFormData(prev => ({ ...prev, sno: nextId, date: new Date().toISOString().split("T")[0] }));
                    setShowInvoiceForm(true); 
                    setSidebarOpen(false); 
                  }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Manual Invoice</button></li>
                  <li><button onClick={() => { setTab("invoices"); setShowScannerInvoice(true); setSidebarOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Barcode Scanner</button></li>
                </ul>
              )}
            </li>

            {/* Suppliers */}
             <li>
              <button onClick={() => setSuppliersMenuOpen(!suppliersMenuOpen)} className={navItemClass("suppliers")}>
                <span className="flex items-center gap-3"><Truck size={20} /><span>Suppliers</span></span>
                {suppliersMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {suppliersMenuOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li><button onClick={() => { setTab("suppliers"); setSidebarOpen(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left ${tab === "suppliers" ? "text-white bg-white/5" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}><span className={`w-1.5 h-1.5 rounded-full ${tab === "suppliers" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-40"}`} />Supplier Network</button></li>
                  <li><button onClick={() => { setTab("suppliers"); setShowSupplierForm(true); setSidebarOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Add Supplier</button></li>
                </ul>
              )}
            </li>

            {/* Exchanges */}
            <li>
              <button onClick={() => setExchangesMenuOpen(!exchangesMenuOpen)} className={navItemClass("exchanges")}>
                <span className="flex items-center gap-3"><RotateCw size={20} /><span>Exchanges</span></span>
                {exchangesMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {exchangesMenuOpen && (
                <ul className="mt-1 ml-6 space-y-1">
                  <li><button onClick={() => { setTab("exchanges"); setSidebarOpen(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left ${tab === "exchanges" ? "text-white bg-white/5" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}><span className={`w-1.5 h-1.5 rounded-full ${tab === "exchanges" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-40"}`} />Exchange History</button></li>
                  <li><button onClick={() => { setTab("exchanges"); setExchangeFormData({ type: "customer", customerName: "", returnedProductId: "", newProductId: "", quantity: 1, reason: "", restocked: true }); setShowExchangeForm(true); setSidebarOpen(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide w-full text-left text-slate-500 hover:bg-white/5 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />Log Exchange</button></li>
                </ul>
              )}
            </li>

            {/* Reports */}
            <li>
              <button onClick={() => { setTab("reports"); setSidebarOpen(false); }} className={navItemClass("reports")}>
                <span className="flex items-center gap-3"><FileText size={20} /><span>Reports</span></span>
                {tab === "reports" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>

            {/* Notifications */}
            <li>
              <button onClick={() => { setTab("notifications"); setSidebarOpen(false); }} className={navItemClass("notifications")}>
                <span className="flex items-center gap-3"><Bell size={20} /><span>Notifications</span></span>
                {tab === "notifications" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>

            {/* Banner Promotion */}
            <li>
              <button onClick={() => { setTab("promotions"); setSidebarOpen(false); }} className={navItemClass("promotions")}>
                <span className="flex items-center gap-3"><ImageIcon size={20} /><span>Banner Promotion</span></span>
                {tab === "promotions" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>

            {/* Settings */}
            <li>
              <button onClick={() => { setTab("settings"); setSidebarOpen(false); }} className={navItemClass("settings")}>
                <span className="flex items-center gap-3"><Settings size={20} /><span>System Settings</span></span>
                {tab === "settings" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
            </li>
          </ul>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => { clearAuth(); navigate("/login"); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-lg text-sm font-semibold transition-all"
          >
            <LogOut size={18} /> Sign Out System
          </button>
        </div>
      </aside>
    );
  };

  const renderTab = () => {
    const user = getUser();
    const recentProducts = [...data.products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    switch (tab) {
      case "dashboard": return (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 uppercase">WELCOME BACK, <span className="text-emerald-600">SUPERADMIN!</span></h1>
              <p className="text-gray-500 text-sm font-medium opacity-90">Here's what's happening with the system today.</p>
            </div>
          </div>

          {/* First Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Total Users" value={data.users.length} gradient="bg-blue-50" icon={<Users size={24} />} />
            <StatCard label="Total Admins" value={admins.length} gradient="bg-purple-50" icon={<ShieldCheck size={24} />} />
            <StatCard label="Total Orders" value={data.orders.length} gradient="bg-indigo-50" icon={<ShoppingCart size={24} />} />
          </div>

          {/* Second Row: 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <StatCard label="Total Products" value={data.products.length} gradient="bg-teal-50" icon={<Package size={24} />} />
            <StatCard label="Total Invoices" value={data.invoices.length} gradient="bg-amber-50" icon={<Receipt size={24} />} />
            <StatCard label="Total Low Stock Items" value={data.products.filter(p => p.stock <= 10 && p.stock > 0).length} gradient="bg-rose-50" icon={<AlertTriangle size={24} className="text-rose-500" />} />
            <StatCard label="Total Suppliers" value={data.suppliers.length} gradient="bg-blue-50" icon={<Truck size={24} />} />
          </div>

          {/* Third Row: Financials */}
          {(() => {
            const totalInventory = data.products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.buyingPrice) || Number(p.price) || 0)), 0);
            const totalSales = data.invoices.reduce((acc, inv) => {
              if (!inv.itemsList) return acc;
              return acc + inv.itemsList.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.price) || 0)), 0);
            }, 0);
            const totalCost = data.invoices.reduce((acc, inv) => {
              if (!inv.itemsList) return acc;
              return acc + inv.itemsList.reduce((sum, item) => {
                const product = data.products.find(p => p.name === item.product);
                const buyPrice = product ? (Number(product.buyingPrice) || Number(product.price) || 0) : (Number(item.price) || 0);
                return sum + ((Number(item.qty) || 0) * buyPrice);
              }, 0);
            }, 0);
            const totalProfit = totalSales - totalCost;
            return (
              <>
                {/* First Financial Row (4 cards) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <StatCard label="Total Inventory (Buy)" value={`Rs.${totalInventory.toLocaleString()}`} gradient="bg-emerald-50" icon={<DollarSign size={24} className="text-emerald-600" />} />
                  <StatCard label="Total Sales (Sell)" value={`Rs.${totalSales.toLocaleString()}`} gradient="bg-blue-50" icon={<TrendingUp size={24} className="text-blue-600" />} />
                  <StatCard label="Total Cost" value={`Rs.${totalCost.toLocaleString()}`} gradient="bg-teal-50" icon={<CheckCircle size={24} className="text-teal-600" />} />
                  <StatCard label="Total Profit" value={`Rs.${totalProfit.toLocaleString()}`} gradient="bg-purple-50" icon={<Activity size={24} className="text-purple-600" />} />
                </div>

              </>
            );
          })()}

          {/* Recently Added Products (Global) */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1 uppercase">Recently Added Products</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest SKU updates across the system</p>
              </div>
              <button
                onClick={() => setTab("products")}
                className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 border border-blue-100 uppercase tracking-widest"
              >
                View Global Catalog <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {recentProducts.length === 0 ? (
                <div className="bg-gray-50 rounded-[2rem] p-10 text-center w-full border border-dashed border-gray-200">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products registered yet</p>
                </div>
              ) : (
                recentProducts.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    onClick={() => {
                      setProductFormData({ ...p });
                      setShowProductForm(true);
                    }}
                    className="bg-white min-w-[200px] p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition-all flex flex-col items-center text-center cursor-pointer group relative"
                  >
                    <div className="relative w-24 h-24 mb-4 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-blue-600" size={24} />
                      </div>
                    </div>
                    <div className="w-full">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{p.category || "General"}</p>
                      <h4 className="font-bold text-sm text-gray-900 truncate w-full mb-1 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                      <p className={`text-[10px] font-bold mb-3 ${p.stock < 10 ? "text-rose-500" : "text-gray-500"}`}>Stock: {p.stock}</p>
                      <p className="text-sm font-black text-blue-600">Rs. {p.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Operations */}
          <div>
            <h3 className="text-xl font-black tracking-tight text-gray-900 mb-6 uppercase">System Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <QuickActionBtn
                icon={<Plus size={20} />}
                label="Add Product"
                onClick={() => setShowProductForm(true)}
                darkMode={settings.darkMode}
              />
              <QuickActionBtn
                icon={<ShieldCheck size={20} />}
                label="Add Admin"
                onClick={() => setShowAddUserModal(true)}
                darkMode={settings.darkMode}
              />
              <QuickActionBtn
                icon={<Scan size={20} />}
                label="Scan Invoice"
                onClick={() => setShowScannerInvoice(true)}
                darkMode={settings.darkMode}
              />
              <QuickActionBtn
                icon={<FileText size={20} />}
                label="Reports"
                onClick={() => setTab("reports")}
                darkMode={settings.darkMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 overflow-hidden relative group">
              <h3 className="text-xl font-black tracking-tight text-gray-900 mb-2">Category Distribution</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Stock volume by department</p>

              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'General'] = (acc[p.category || 'General'] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(data.products.reduce((acc, p) => { acc[p.category || 'General'] = (acc[p.category || 'General'] || 0) + 1; return acc; }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'][index % 6]} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 overflow-hidden relative group">
              <h3 className="text-xl font-black tracking-tight text-gray-900 mb-2">Revenue & Order Trend</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Global financial performance</p>

              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={(() => {
                    const groups = {};
                    const now = new Date();
                    
                    // 1. Pre-seed last 12 periods
                    for (let i = 11; i >= 0; i--) {
                      const d = new Date(now);
                      let key = '';
                      let sortVal = 0;
                      if (reportPeriod === 'Yearly') {
                        d.setFullYear(now.getFullYear() - i);
                        key = d.getFullYear().toString();
                        sortVal = new Date(d.getFullYear(), 0, 1).getTime();
                      } else if (reportPeriod === 'Monthly') {
                        d.setMonth(now.getMonth() - i);
                        key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        sortVal = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
                      } else if (reportPeriod === 'Daily') {
                        d.setDate(now.getDate() - i);
                        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        sortVal = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                      } else if (reportPeriod === 'Weekly') {
                        d.setDate(now.getDate() - (i * 7));
                        const first = new Date(d.getFullYear(), 0, 1);
                        const days = Math.floor((d - first) / (24 * 60 * 60 * 1000));
                        const week = Math.ceil((d.getDay() + 1 + days) / 7);
                        key = `W${week} ${d.getFullYear()}`;
                        sortVal = new Date(d.getFullYear(), 0, 1).getTime() + (week * 7 * 24 * 60 * 60 * 1000);
                      }
                      groups[key] = { date: key, amount: 0, orders: 0, sortVal };
                    }

                    // 2. Aggregate actual data
                    data.invoices.forEach(i => {
                      const d = new Date(i.date || i.createdAt);
                      let key = '';
                      if (reportPeriod === 'Yearly') key = d.getFullYear().toString();
                      else if (reportPeriod === 'Monthly') key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      else if (reportPeriod === 'Daily') key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      else if (reportPeriod === 'Weekly') {
                        const first = new Date(d.getFullYear(), 0, 1);
                        const days = Math.floor((d - first) / (24 * 60 * 60 * 1000));
                        const week = Math.ceil((d.getDay() + 1 + days) / 7);
                        key = `W${week} ${d.getFullYear()}`;
                      }
                      if (groups[key]) {
                        groups[key].amount += (i.totalAmount || 0);
                        groups[key].orders += 1;
                      }
                    });
                    return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
                  })()}>
                    <defs>
                      <linearGradient id="colorRevGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="50%" stopColor="#10b981" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600', fill: "#94a3b8" }} dy={10} />
                    <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: "#94a3b8" }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <YAxis yAxisId="orders" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                        padding: '12px 16px' 
                      }}
                      itemStyle={{
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                      labelStyle={{
                        color: "#4b5563",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px"
                      }}
                      formatter={(val, name) => name === 'Orders' ? [val, name] : [`Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Area 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="amount" 
                      name="Revenue ($)"
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRevGreen)" 
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      yAxisId="orders"
                      type="monotone" 
                      dataKey="orders" 
                      name="Orders"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 5, fill: '#3b82f6' }} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900">Recent Orders</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Latest system-wide orders</p>
                </div>
                <button onClick={() => setTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">View All</button>
              </div>
              <div className="space-y-4">
                {data.orders.slice(0, 6).map((o, idx) => (
                  <div key={o._id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">{o.product?.slice(0, 40) || "—"}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{o.customerName || "Walk-in Customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">Rs.{o.totalPrice?.toLocaleString()}</p>
                      <Badge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1">Recent Invoices</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Billing History</p>
                </div>
                <button onClick={() => setTab('invoices')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all">View Ledger</button>
              </div>
              <div className="space-y-4">
                {data.invoices.slice(0, 6).map((inv, idx) => (
                  <div key={inv._id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Receipt size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">{inv.customerName || inv.customer || "Walk-in Customer"}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{inv.invoiceNo || inv.sno || "#INV-" + inv._id?.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">Rs.{inv.totalAmount?.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-gray-400">{new Date(inv.date || inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {data.invoices.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-10">No recent invoices found.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      );

      case "usermanagement": return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900">User <span className="text-indigo-600">Infrastructure</span></h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Unified Personnel & Access Control</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBlockAll('admins')}
                className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
              >
                Block All Operators
              </button>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                <button
                  onClick={() => { setUserFormData({ ...userFormData, role: 'admin' }); setShowAddUserModal(true); }}
                  className="px-5 py-2.5 bg-[#0B1120] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
                >
                  <Plus size={14} /> New Admin
                </button>
                <button
                  onClick={() => { setUserFormData({ ...userFormData, role: 'customer' }); setShowAddUserModal(true); }}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Plus size={14} /> New Customer
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setUserTypeFilter('all')} className="cursor-pointer">
              <StatCard label="Total Users" value={data.users.length + data.customers.length} gradient={userTypeFilter === 'all' ? "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10" : "bg-white"} icon={<LayoutDashboard size={24} className="text-blue-600" />} />
            </div>
            <div onClick={() => setUserTypeFilter('customer')} className="cursor-pointer">
              {data.customers?.length > 0 && <StatCard label="Total Customers" value={data.customers.length} gradient={userTypeFilter === 'customer' ? "bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10" : "bg-white"} icon={<Users size={24} className="text-emerald-600" />} />}
            </div>
            <div onClick={() => setUserTypeFilter('admin')} className="cursor-pointer">
              <StatCard label="Total Admins" value={admins.length} gradient={userTypeFilter === 'admin' ? "bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-500/10" : "bg-white"} icon={<ShieldCheck size={24} className="text-indigo-600" />} />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 w-80 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all placeholder:text-gray-300"
                  />
                </div>
                <div className="h-10 w-px bg-gray-200 hidden lg:block"></div>
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                  {['all', 'admin', 'customer'].map(t => (
                    <button
                      key={t}
                      onClick={() => setUserTypeFilter(t)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userTypeFilter === t ? 'bg-[#0B1120] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing {userTypeFilter} results for system-wide search</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-400">
                    <th className="px-8 py-6">User Profile</th>
                    <th className="px-8 py-6">Account Category</th>
                    <th className="px-8 py-6">Communication Details</th>
                    <th className="px-8 py-6">Provisioned On</th>
                    <th className="px-8 py-6">System Status</th>
                    <th className="px-8 py-6 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    const adminsMapped = data.users.map(u => ({ ...u, type: 'admin' }));
                    const customersMapped = data.customers.map(c => ({ ...c, type: 'customer' }));
                    const allUsers = [...adminsMapped, ...customersMapped];

                    const filtered = allUsers.filter(u => {
                      const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = userTypeFilter === 'all' || u.type === userTypeFilter;
                      return matchesSearch && matchesFilter;
                    });

                    const paginated = filtered.slice((pages.usermanagement - 1) * PAGE_SIZE, pages.usermanagement * PAGE_SIZE);

                    if (paginated.length === 0) return <tr><td colSpan="6" className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-4 opacity-20"><Users size={64} /><p className="font-black uppercase tracking-[0.3em] text-sm">No personnel found in current grid</p></div></td></tr>;

                    return paginated.map(u => (
                      <tr key={`${u.type}-${u._id}`} className="hover:bg-gray-50/80 group transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-transform group-hover:scale-110 ${u.type === 'admin' ? (u.role === 'superadmin' ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600') : 'bg-gradient-to-tr from-emerald-500 to-teal-500'}`}>
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-base text-gray-900 tracking-tight">{u.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${u.type === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{u.type}</span>
                                {u.role === 'superadmin' && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">ROOT</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-gray-700 uppercase tracking-widest">{u.role || u.type}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Permissions Level: {u.role === 'superadmin' ? 'Master' : u.type === 'admin' ? 'Operational' : 'Standard'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Mail size={12} className="text-gray-300" /> {u.email || 'N/A'}</p>
                            <p className="text-[11px] font-bold text-gray-400 flex items-center gap-2"><Phone size={12} className="text-gray-300" /> {u.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-8 py-6">
                          <Badge status={u.status || 'active'} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => {
                                if (u.type === 'admin') handleStatusChange(u._id, u.status);
                                else handleToggleStatus('customers', u._id, u.status);
                              }}
                              className={`p-2.5 rounded-xl border ${u.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'} transition-all`}
                              title={u.status === 'blocked' ? 'Authorize Access' : 'Terminate Access'}
                            >
                              {u.status === 'blocked' ? <ShieldCheck size={18} /> : <Ban size={18} />}
                            </button>
                            <button onClick={() => handleGenericEdit(u.type === 'admin' ? 'Admin' : 'Customer', u._id)} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-indigo-600 transition-all" title="Manage Identity"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(u.type === 'admin' ? 'auth/users' : 'customers', u._id)} className="p-2.5 rounded-xl bg-rose-50 text-rose-400 border border-rose-100 hover:bg-rose-100 hover:text-rose-600 transition-all" title="Purge Record"><Trash2 size={18} /></button>
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
              totalItems={(() => {
                const adminsMapped = data.users.map(u => ({ ...u, type: 'admin' }));
                const customersMapped = data.customers.map(c => ({ ...c, type: 'customer' }));
                const allUsers = [...adminsMapped, ...customersMapped];
                return allUsers.filter(u => {
                  const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = userTypeFilter === 'all' || u.type === userTypeFilter;
                  return matchesSearch && matchesFilter;
                }).length;
              })()}
              onPageChange={(p) => setPages({ ...pages, usermanagement: p })}
            />
          </div>
        </div>
      );


      case "reports": return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Advanced System Reports</h2>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Analysis Period</label>
                <div
                  className="px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer flex items-center gap-3 bg-gray-50 min-w-[160px] justify-between"
                  onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                >
                  <span className="text-sm font-bold text-gray-800">{reportPeriod}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                {periodDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden">
                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(p => (
                      <div
                        key={p}
                        className={`px-4 py-3 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors ${reportPeriod === p ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'}`}
                        onClick={() => { setReportPeriod(p); setPeriodDropdownOpen(false); }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5">
                <button 
                  onClick={handleExportAllReports}
                  className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                >
                  Export All Reports
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Products" value={data.products.length} gradient="bg-blue-50" icon={<Package size={24} />} />
            <StatCard label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} gradient="bg-rose-50" icon={<Receipt size={24} />} />
            <StatCard label="Categories" value={categoriesCount} gradient="bg-purple-50" icon={<BarChart2 size={24} />} />
          </div>

          {/* Category-wise Report */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2"><BarChart2 size={16} className="text-green-500" /> Category-wise Performance Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">CATEGORY</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">PRODUCTS</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">TOTAL STOCK</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">INVENTORY VALUE</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">SALES REVENUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    const categoryData = Object.values(data.products.reduce((acc, p) => {
                      const cat = p.category || "Uncategorized";
                      if (!acc[cat]) acc[cat] = { category: cat, products: 0, stock: 0, value: 0, sales: 0 };
                      acc[cat].products += 1;
                      acc[cat].stock += (p.stock || 0);
                      acc[cat].value += ((p.stock || 0) * (p.price || 0));
                      return acc;
                    }, {}));

                    // Add sales data
                    data.orders.forEach(o => {
                      if (o.status !== "Cancelled") {
                        const product = data.products.find(p => p._id === o.productId);
                        if (product) {
                          const cat = product.category || "Uncategorized";
                          const catData = categoryData.find(c => c.category === cat);
                          if (catData) catData.sales += (o.totalPrice || 0);
                        }
                      }
                    });

                    return categoryData.sort((a, b) => b.value - a.value);
                  })().map(stat => (
                    <tr key={stat.category} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-sm text-gray-800">{stat.category}</td>
                      <td className="py-3 px-4 font-black text-sm text-blue-600">{stat.products}</td>
                      <td className="py-3 px-4 font-medium text-sm text-gray-600">{stat.stock}</td>
                      <td className="py-3 px-4 font-black text-sm text-emerald-600">Rs. {stat.value.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-sm text-purple-600">Rs. {stat.sales.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2"><ShieldCheck size={16} className="text-purple-500" /> Top Admin Performance</h3>
              <div className="space-y-5 mt-4 overflow-y-auto pr-2" style={{ maxHeight: '320px' }}>
                {(() => {
                  // Calculate admin performance based on orders and revenue
                  const adminPerformance = data.users.map(admin => {
                    const adminOrders = data.orders.filter(o => o.user === admin._id && o.status !== 'Cancelled');
                    const totalRevenue = adminOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                    const orderCount = adminOrders.length;
                    return { ...admin, revenue: totalRevenue, orders: orderCount };
                  }).sort((a, b) => b.revenue - a.revenue);

                  return adminPerformance.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No admin performance data available.</p>
                  ) : adminPerformance.slice(0, 5).map((admin, idx) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-purple-500'];
                    const color = colors[idx % colors.length];
                    const maxVal = Math.max(...adminPerformance.map(a => a.revenue)) || 10000;
                    const width = `${(admin.revenue / maxVal) * 100}%`;

                    return (
                      <div key={admin._id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-sm ${color}`}></div>
                            <span className="text-gray-800">{admin.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-black">Rs. {admin.revenue.toLocaleString()}</span>
                            <span className="text-gray-400 text-[11px] font-medium">({admin.orders} orders)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black uppercase tracking-tight mb-6 flex items-center gap-2"><Package size={16} className="text-blue-500" /> Top Selling Products</h3>
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '320px' }}>
                {(() => {
                  const productSales = Object.entries(data.orders.reduce((acc, o) => {
                    if (o.status !== "Cancelled" && o.product) {
                      acc[o.product] = (acc[o.product] || 0) + (o.totalPrice || 0);
                    }
                    return acc;
                  }, {})).map(([productName, sales]) => ({ name: productName, sales }))
                    .sort((a, b) => b.sales - a.sales).slice(0, 8);

                  return productSales.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No sales data available.</p>
                  ) : productSales.map((product, idx) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];
                    const color = colors[idx % colors.length];
                    const maxVal = Math.max(...productSales.map(p => p.sales)) || 10000;
                    const width = `${(product.sales / maxVal) * 100}%`;

                    return (
                      <div key={product.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-sm ${color}`}></div>
                            <span className="text-gray-800">{product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}</span>
                          </div>
                          <span className="text-gray-900 font-black">Rs. {product.sales.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* SALES ANALYSIS AREA CHART - dynamic by period */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8">SALES ANALYSIS</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(() => {
                    const groups = {};
                    const now = new Date();
                    
                    // 1. Pre-seed last 15 periods
                    for (let i = 14; i >= 0; i--) {
                      const d = new Date(now);
                      let key = '';
                      let sortVal = 0;
                      if (reportPeriod === 'Yearly') {
                        d.setFullYear(now.getFullYear() - i);
                        key = d.getFullYear().toString();
                        sortVal = new Date(d.getFullYear(), 0, 1).getTime();
                      } else if (reportPeriod === 'Monthly') {
                        d.setMonth(now.getMonth() - i);
                        key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        sortVal = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
                      } else if (reportPeriod === 'Daily') {
                        d.setDate(now.getDate() - i);
                        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        sortVal = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                      } else if (reportPeriod === 'Weekly') {
                        d.setDate(now.getDate() - (i * 7));
                        const first = new Date(d.getFullYear(), 0, 1);
                        const days = Math.floor((d - first) / (24 * 60 * 60 * 1000));
                        const week = Math.ceil((d.getDay() + 1 + days) / 7);
                        key = `W${week} ${d.getFullYear()}`;
                        sortVal = new Date(d.getFullYear(), 0, 1).getTime() + (week * 7 * 24 * 60 * 60 * 1000);
                      }
                      groups[key] = { label: key, Revenue: 0, sortVal };
                    }

                    // 2. Aggregate actual data
                    data.invoices.forEach(i => {
                      const date = new Date(i.date || i.createdAt);
                      let key = '';
                      if (reportPeriod === 'Yearly') key = date.getFullYear().toString();
                      else if (reportPeriod === 'Monthly') key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      else if (reportPeriod === 'Daily') key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      else if (reportPeriod === 'Weekly') {
                        const first = new Date(date.getFullYear(), 0, 1);
                        const days = Math.floor((date - first) / (24 * 60 * 60 * 1000));
                        const week = Math.ceil((date.getDay() + 1 + days) / 7);
                        key = `W${week} ${date.getFullYear()}`;
                      }
                      if (groups[key]) groups[key].Revenue += (i.totalAmount || 0);
                    });
                    return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
                  })()}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="superSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => v >= 1000 ? (v/1000).toFixed(0)+'k' : v} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                      padding: '12px' 
                    }}
                    itemStyle={{
                      color: "#10b981",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                    labelStyle={{
                      color: "#4b5563",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "4px"
                    }}
                    formatter={(val) => [`Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Revenue"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#superSalesGrad)" 
                    name="Revenue" 
                    strokeWidth={3.5} 
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SALES OVERVIEW BAR + CATEGORY PIE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview Bar Chart - dynamic by period */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-900">Sales Overview</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-gray-100 text-gray-500">{reportPeriod}</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const groups = {};
                      if (reportPeriod === 'Daily') DAY_ORDER.forEach(d => { groups[d] = { name: d, Sales: 0, Revenue: 0 }; });

                      const getGroupData = (date) => {
                        if (reportPeriod === 'Daily') return { key: DAY_MAP[date.getDay()], sortVal: DAY_ORDER.indexOf(DAY_MAP[date.getDay()]) };
                        if (reportPeriod === 'Weekly') {
                          const first = new Date(date.getFullYear(), 0, 1);
                          const days = Math.floor((date - first) / (24 * 60 * 60 * 1000));
                          const week = Math.ceil((date.getDay() + 1 + days) / 7);
                          return { key: `W${week}`, sortVal: week };
                        }
                        if (reportPeriod === 'Monthly') return { key: date.toLocaleDateString('en-US', { month: 'short' }), sortVal: date.getMonth() };
                        return { key: date.getFullYear().toString(), sortVal: date.getFullYear() };
                      };
                      const cutoff = new Date();
                      if (reportPeriod === 'Daily') cutoff.setDate(cutoff.getDate() - 7);
                      else if (reportPeriod === 'Weekly') cutoff.setDate(cutoff.getDate() - 56);
                      else if (reportPeriod === 'Monthly') cutoff.setMonth(cutoff.getMonth() - 12);
                      else cutoff.setFullYear(cutoff.getFullYear() - 5);

                      data.invoices.forEach(i => {
                        const date = new Date(i.date || i.createdAt);
                        if (date < cutoff) return;
                        const { key, sortVal } = getGroupData(date);
                        if (!groups[key]) groups[key] = { name: key, Sales: 0, Revenue: 0, sortVal };
                        groups[key].Revenue += (i.totalAmount || 0);
                      });
                      data.orders.forEach(o => {
                        if (o.status === 'Cancelled') return;
                        const date = new Date(o.date || o.createdAt);
                        if (date < cutoff) return;
                        const { key, sortVal } = getGroupData(date);
                        if (!groups[key]) groups[key] = { name: key, Sales: 0, Revenue: 0, sortVal };
                        groups[key].Sales += 1;
                      });
                      if (reportPeriod === 'Daily') return DAY_ORDER.map(d => groups[d]);
                      return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
                    })()}
                    barCategoryGap="20%" barGap={4} margin={{ top: 10, right: 50, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis yAxisId="rev" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v >= 1000 ? (v/1000).toFixed(0)+'k' : v} />
                    <YAxis yAxisId="sal" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(val, name) => name === 'Revenue (Rs)' ? [`Rs ${val.toLocaleString()}`, 'Revenue'] : [val, 'Sales']}
                    />
                    <Bar yAxisId="rev" dataKey="Revenue" fill="#10b981" name="Revenue (Rs)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar yAxisId="sal" dataKey="Sales" fill="#3b82f6" name="Sales" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by Category Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-900 mb-1">Revenue by Category</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Live revenue share per category</p>
              <div className="h-72 flex items-center justify-center">
                {(() => {
                  const cats = {};
                  data.invoices.forEach(inv => {
                    const items = inv.itemsList || inv.items || [];
                    items.forEach(item => {
                      const product = data.products.find(p => p._id === item.productId || (item.productId && p.productId === item.productId) || p.name === item.product);
                      const cat = product?.category || 'General';
                      if (!cats[cat]) cats[cat] = { name: cat, value: 0, products: new Set() };
                      cats[cat].value += (item.qty * (item.price || 0));
                      if (product) cats[cat].products.add(product._id || product.productId);
                    });
                  });
                  const catData = Object.values(cats).filter(c => c.value > 0).map(c => ({ ...c, productCount: c.products.size })).sort((a, b) => b.value - a.value).slice(0, 8);
                  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
                  const RADIAN = Math.PI / 180;
                  const renderLabel = ({ cx, cy, midAngle, outerRadius, name, percent, index }) => {
                    if ((percent * 100) < 4) return null;
                    const r = outerRadius + 22;
                    const x = cx + r * Math.cos(-midAngle * RADIAN);
                    const y = cy + r * Math.sin(-midAngle * RADIAN);
                    return <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="700">{name} {(percent * 100).toFixed(0)}%</text>;
                  };
                  return catData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={catData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderLabel}>
                          {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip
                          formatter={(val, name, props) => [`Rs ${val.toLocaleString()} (${props.payload.productCount} items)`, props.payload.name]}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb' }}
                        />
                        <Legend
                          formatter={(value, entry) => <span style={{ color: entry.color, fontSize: '11px', fontWeight: 700 }}>{value}</span>}
                          wrapperStyle={{ paddingTop: '16px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs font-bold text-gray-400">No revenue data available.</p>;
                })()}
              </div>
            </div>
          </div>
        </div>
      );

      case "notifications": return (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Notification Feed</h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-gray-900">System Intelligence Feed</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">Clear All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {(() => {
                const paginated = data.notifications.slice((pages.notifications - 1) * PAGE_SIZE, pages.notifications * PAGE_SIZE);
                if (paginated.length === 0) return (
                  <div className="p-20 text-center text-gray-400">
                    <Bell className="mx-auto mb-6 opacity-20" size={64} />
                    <p className="font-black uppercase tracking-[0.2em] text-sm">No new intelligence signals</p>
                  </div>
                );
                return paginated.map((n) => (
                  <div key={n.id} className={`group flex items-start gap-6 px-8 py-6 transition-all hover:bg-gray-50 relative ${n.unread ? "bg-blue-50/20" : ""}`}>
                    {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full shadow-[0_0_10px_#3b82f6]" />}
                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${n.unread ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
                      <ShieldAlert size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className={`text-sm font-black transition-colors ${n.unread ? 'text-blue-600' : 'text-gray-900'}`}>{n.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{n.date}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-2xl">{n.message}</p>
                    </div>
                    {n.unread && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 animate-pulse shadow-[0_0_10px_#3b82f6]" />}
                  </div>
                ));
              })()}
            </div>
            <Pagination
              currentPage={pages.notifications}
              totalItems={data.notifications.length}
              onPageChange={(p) => setPages({ ...pages, notifications: p })}
            />
          </div>
        </div>
      );
      case "exchanges": return (
        <ExchangesTab
          exchanges={data.exchanges}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          darkMode={settings.darkMode}
          cardClass={cardClass}
          setShowExchangeForm={() => setShowExchangeForm(true)}
          setExchangeFormData={setExchangeFormData}
          handleDeleteExchange={(id) => handleDelete('exchanges', id)}
          triggerToast={(msg) => alert(msg)}
          currentPage={pages.exchanges}
          onPageChange={(p) => setPages({ ...pages, exchanges: p })}
        />
      );
      case "activityhistory": return (
        <HistoryTab
          historyLogs={data.historyLogs}
          historySearch={searchTerm}
          setHistorySearch={setSearchTerm}
          historyFilter="all"
          setHistoryFilter={() => { }}
          fetchHistoryLogs={fetchAll}
          groupLogsByDate={(logs) => {
            const groups = {};
            logs.forEach(log => {
              const date = new Date(log.createdAt || log.date).toLocaleDateString();
              if (!groups[date]) groups[date] = [];
              groups[date].push(log);
            });
            return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
          }}
          loading={loading}
          darkMode={settings.darkMode}
          cardClass="bg-white"
          currentPage={pages.activityhistory}
          onPageChange={(p) => setPages({ ...pages, activityhistory: p })}
        />
      );


      case "products": return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900">Global <span className="text-emerald-600">Inventory</span></h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Centralized SKU Lifecycle Management</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExportProducts} className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all group">
                <Download size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => setShowCSVModal(true)} className="px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                <Upload size={16} /> Bulk Import
              </button>
              <button onClick={() => handleGenericEdit('Product', null)} className="px-6 py-3.5 bg-[#0B1120] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-900/20 flex items-center gap-2">
                <Plus size={16} /> Create SKU
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4 text-rose-500">Buy Price</th>
                  <th className="px-6 py-4 text-emerald-600">MRP</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const filtered = (data.products || []).filter(p =>
                    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  const paginated = filtered.slice((pages.products - 1) * PAGE_SIZE, pages.products * PAGE_SIZE);

                  if (paginated.length === 0) return <tr><td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">No products found in system</td></tr>;

                  return paginated.map(p => {
                    const owner = admins.find(a => a._id === p.createdBy);
                    return (
                      <tr key={p._id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300">
                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" /> : <ImageIcon size={20} />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-sm text-emerald-600 uppercase tracking-tight">{p.name || "Unnamed"}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{p.category || 'GENERAL'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-700">{owner?.name || "System"}</span>
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">{owner?.role || "Global"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-rose-600">Rs. {p.buyingPrice || p.purchasePrice || Math.round((p.price || 0) * 0.7)}</td>
                        <td className="px-6 py-4 text-sm font-black text-emerald-600">Rs. {p.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{p.stock}</span>
                            {p.stock === 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black tracking-widest shadow-sm border border-rose-200">OUT OF STOCK</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm shadow-gray-300 border border-gray-300 ${p.stock > 100 ? 'bg-indigo-500' : p.stock >= 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                            {p.stock > 100 ? 'HIGH-STOCK' : p.stock >= 10 ? 'IN-STOCK' : p.stock > 0 ? 'LOW-STOCK' : 'OUT-OF-STOCK'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleGenericEdit('Product', p._id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors border border-transparent hover:border-gray-200" title="Edit"><Edit size={14} /></button>
                            <button onClick={() => handleDelete('products', p._id)} className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors border border-transparent hover:border-rose-100" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={pages.products}
              totalItems={(data.products || []).filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase())).length}
              onPageChange={(p) => setPages({ ...pages, products: p })}
            />
          </div>
        </div>
      );

      case "suppliers": return (
        <SuppliersTab
          suppliers={data.suppliers || []}
          products={data.products || []}
          invoices={data.invoices || []}
          fetchData={fetchAll}
          selectedSupplierForLots={selectedSupplierForLots}
          setSelectedSupplierForLots={setSelectedSupplierForLots}
          setSupplierFormData={setSupplierFormData}
          setEditSupplierId={setEditSupplierId}
          setShowSupplierForm={setShowSupplierForm}
          darkMode={settings.darkMode}
          cardClass={cardClass}
          currentPage={pages.suppliers || 1}
          onPageChange={(p) => setPages(prev => ({ ...prev, suppliers: p }))}
          handleDeleteSupplier={(id) => handleDelete('suppliers', id)}
          handleUpdateSupplierStatus={(id, status) => handleToggleStatus('suppliers', id, status)}
          openLotForm={() => {}}
          handleDeleteLot={() => {}}
          handleEditProduct={(p) => {
            const idx = data.products.findIndex(prod => prod._id === p._id);
            if (idx !== -1) {
              setProductFormData({ ...data.products[idx] });
              setShowProductForm(true);
            }
          }}
          userRole="superadmin"
        />
      );
      case "orders": return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900">Order <span className="text-blue-600">Ledger</span></h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Global Transaction & Fulfillment Tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleGenericEdit('Order', null)} className="px-6 py-3.5 bg-[#0B1120] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-900/20 flex items-center gap-2">
                <Plus size={16} /> Create Order
              </button>
              <button onClick={() => setTab('dashboard')} className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all group hidden md:block">
                <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500">
                  <th className="px-8 py-6">Transaction ID</th>
                  <th className="px-8 py-6">Customer Context</th>
                  <th className="px-8 py-6">Fulfillment</th>
                  <th className="px-8 py-6">Gross Amount</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const filtered = (data.orders || []).filter(o =>
                    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o._id.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  const paginated = filtered.slice((pages.orders - 1) * PAGE_SIZE, pages.orders * PAGE_SIZE);

                  if (paginated.length === 0) return <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">No matching orders found</td></tr>;

                  return paginated.map(o => {
                    const owner = admins.find(a => a._id === (o.user || o.createdBy));
                    return (
                      <tr key={o._id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                              <ShoppingBag size={18} />
                            </div>
                            <div>
                              <div className="font-black text-xs text-gray-800 uppercase tracking-wider">#{o.orderId || o._id.slice(-6).toUpperCase()}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-xs text-gray-700">{o.customer?.name || o.customerName || "Walk-in Customer"}</div>
                            {o.status === 'Invoiced' && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-200">
                                Done
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">{o.customer?.email || "No email"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-700">{owner?.name || "Global Store"}</span>
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">{owner?.role || "System"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-emerald-600">Rs. {o.totalPrice?.toLocaleString() || o.total?.toLocaleString() || 0}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {o.status !== 'Cancelled' && (
                              <button onClick={() => handleStopOrder(o._id)} className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest border border-rose-100 transition-colors" title="Cancel Order">
                                <Ban size={12} /> Stop
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (o.status !== 'Invoiced') {
                                  setSelectedOrderForInvoice(o);
                                  setTab("invoices");
                                  setShowScannerInvoice(true);
                                }
                              }}
                              disabled={o.status === 'Invoiced'}
                              className={`p-2 rounded-xl transition-colors border border-transparent ${o.status === 'Invoiced' ? 'text-emerald-500 bg-emerald-50' : 'hover:bg-gray-100 text-gray-700 hover:border-gray-200'}`}
                              title={o.status === 'Invoiced' ? "Invoice Generated" : "Generate Invoice"}
                            >
                              {o.status === 'Invoiced' ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={pages.orders}
              totalItems={(data.orders || []).filter(o => o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())).length}
              onPageChange={(p) => setPages({ ...pages, orders: p })}
            />
          </div>
        </div>
      );

      case "invoices": {
        // Superadmin should see total calculations for all invoices, not just their own
        const allInvoices = data.invoices || [];

        return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900">Financial <span className="text-emerald-600">Ledger</span></h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Global Revenue & Billing Oversight</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowScannerInvoice(true)}
                className="px-6 py-3.5 bg-[#0B1120] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-900/20 flex items-center gap-2"
              >
                <Scan size={16} /> Barcode Scan
              </button>
              <button
                onClick={async () => {
                  let nextId = "";
                  try {
                    const res = await fetch(`${API}/invoices/next-id`, { headers: hdr() });
                    const json = await res.json();
                    if (json.success) nextId = json.nextId;
                  } catch (e) { console.error("Error fetching next ID:", e); }

                  setInvoiceFormData({
                    sno: nextId,
                    date: new Date().toISOString().split('T')[0],
                    customer: "",
                    membershipId: "",
                    items: [{ product: "", productId: "", batchNo: "", qty: 1, price: 0 }],
                    paymentMethod: "Cash"
                  });
                  setShowInvoiceForm(true);
                }}
                className="px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2"
              >
                <Plus size={16} /> Manual
              </button>
              <button onClick={fetchAll} className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all group hidden md:block">
                <RotateCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs uppercase font-semibold opacity-70">
                Total Invoices
              </p>
              <p className="text-2xl font-bold mt-1">
                {allInvoices.length}
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs uppercase font-semibold opacity-70">
                Total Revenue
              </p>
              <p className="text-2xl font-bold mt-1">
                Rs.{" "}
                {allInvoices
                  .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount || inv.amount || 0)), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs uppercase font-semibold opacity-70">
                Avg. Invoice
              </p>
              <p className="text-2xl font-bold mt-1">
                Rs.{" "}
                {allInvoices.length
                  ? (
                    allInvoices.reduce(
                      (sum, inv) => sum + (parseFloat(inv.totalAmount || inv.amount || 0)),
                      0
                    ) / allInvoices.length
                  ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500">
                  <th className="px-8 py-6">Invoice Identifier</th>
                  <th className="px-8 py-6">Customer Context</th>
                  <th className="px-8 py-6">Admin Source</th>
                  <th className="px-8 py-6">Net Amount</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const filtered = (data.invoices || []).filter(iv => {
                    return (
                      iv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      iv.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      iv._id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  });
                  const paginated = filtered.slice((pages.invoices - 1) * PAGE_SIZE, pages.invoices * PAGE_SIZE);

                  if (paginated.length === 0) return <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">No transaction records found</td></tr>;

                  return paginated.map(iv => {
                    const owner = admins.find(a => a._id === (iv.user || iv.createdBy));
                    return (
                      <tr key={iv._id} className="hover:bg-gray-50/50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                              <Receipt size={18} />
                            </div>
                            <div>
                              <div className="font-black text-xs text-gray-800 uppercase tracking-wider">#{iv.invoiceId || iv._id.slice(-6).toUpperCase()}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{new Date(iv.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-gray-700">{iv.customer || 'Walk-in Customer'}</div>
                          <div className="text-[10px] text-gray-400">{iv.paymentMethod || 'Cash'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-700">{owner?.name || "System"}</span>
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">{owner?.role || "Global"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-emerald-600">Rs. {iv.totalAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge status={iv.paymentStatus || iv.status || 'Paid'} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handlePreviewInvoice(iv, settings)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200" title="Preview Invoice"><Eye size={16} /></button>
                            <button onClick={() => handleDownloadInvoice(iv, settings)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200" title="Download PDF"><Download size={16} /></button>
                            <button onClick={() => handlePrintInvoice(iv, settings)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200" title="Print Invoice"><Printer size={16} /></button>
                            <button onClick={() => handleDelete('invoices', iv._id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors border border-transparent hover:border-gray-200" title="Void Invoice"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={pages.invoices}
              totalItems={(data.invoices || []).filter(iv => (iv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) || iv.customer?.toLowerCase().includes(searchTerm.toLowerCase()))).length}
              onPageChange={(p) => setPages({ ...pages, invoices: p })}
            />
          </div>
        </div>
      );
    }



      case "settings": return (
        <div className="space-y-8 max-w-4xl">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900">System <span className="text-indigo-600">Preferences</span></h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Global Environment & Policy Configuration</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-black tracking-tight text-gray-900">Core Configuration</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">General system behavior and defaults</p>
            </div>
            <div className="p-8 space-y-8">
              {[
                { key: "darkMode", title: "Interface Theme", desc: "Toggle between high-contrast and midnight mode", toggle: true, icon: LayoutDashboard },
                { key: "lowStockAlerts", title: "Inventory Monitoring", desc: "Automated alerts for critical SKU depletion", toggle: true, icon: Package },
                { key: "emailNotifications", title: "Broadcast Systems", desc: "Dispatch critical intelligence via email SMTP", toggle: true, icon: Mail },
                { key: "lowStockThreshold", title: "Alert Threshold", desc: "Global trigger value for low stock status", val: settings.lowStockThreshold, unit: "SKUs", icon: AlertTriangle },
                { key: "taxRate", title: "Taxation Rate", desc: "VAT/GST percentage for fiscal calculation", val: settings.taxRate, unit: "%", icon: Receipt },
                { key: "defaultDiscount", title: "Default Discount", desc: "Global base discount for new invoices", val: settings.defaultDiscount, unit: "%", icon: TrendingUp },
                { key: "privacyMode", title: "Security Protocols", desc: "Enforce strict data obfuscation on dash", toggle: true, icon: ShieldCheck },
              ].map((s, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <s.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">{s.title}</h3>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                  {s.toggle ? (
                    <div
                      onClick={() => saveSettings({ ...settings, [s.key]: !settings[s.key] })}
                      className={`w-14 h-7 ${settings[s.key] ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-gray-200'} rounded-full relative cursor-pointer transition-all duration-300`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${settings[s.key] ? 'left-8' : 'left-1'}`}></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <input
                        type="number"
                        value={settings[s.key]}
                        onChange={(e) => saveSettings({ ...settings, [s.key]: parseFloat(e.target.value) })}
                        className="w-20 bg-transparent text-center text-sm font-black text-gray-900 focus:outline-none"
                      />
                      <span className="text-[10px] font-black uppercase text-gray-400 border-l border-gray-200 pl-3">{s.unit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => { localStorage.setItem('appSettings', JSON.stringify(settings)); alert('Settings saved successfully!'); }} className="px-8 py-4 bg-[#0B1120] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-900/20">Commit Changes</button>
            </div>
          </div>

          <div className="bg-rose-50/50 rounded-[2rem] border border-rose-100 p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-rose-500/30"><AlertTriangle size={32} /></div>
                <div>
                  <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">System Termination</h3>
                  <p className="text-xs text-rose-500 font-bold mt-1 leading-relaxed max-w-md">Irreversible data purge. This will wipe all inventory, users, and financial records globally. Exercise extreme caution.</p>
                </div>
              </div>
              <button onClick={async () => {
                if (!window.confirm('CRITICAL ACTION: Purge all system data? This cannot be undone.')) return;
                try {
                  const res = await fetch(`${API}/auth/reset-data`, { method: 'DELETE', headers: hdr() });
                  const data = await res.json();
                  if (data.success) {
                    alert('Global data purge complete.');
                    fetchAll();
                  }
                } catch (e) { }
              }} className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30">Reset All Global Data</button>
            </div>
          </div>
        </div>
      );

      case "promotions": return (
        <BannerManagement 
          settings={settings} 
          setSettings={setSettings} 
          API={API} 
          hdr={hdr} 
          triggerToast={(msg) => alert(msg)} 
        />
      );

      case "profile": return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProfileTab
            profile={profile} 
            setProfile={setProfile} 
            darkMode={settings.darkMode}
            cardClass={cardClass} 
            labelClass={labelClass} 
            inputClass={inputClass}
            profilePhotoInputRef={profilePhotoInputRef}
            handleProfilePhotoChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfile({ ...profile, photo: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
            handleProfileSave={async () => {
              try {
                const res = await fetch(`${API}/auth/profile`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                  body: JSON.stringify({ ...profile, avatar: profile.photo })
                });
                const data = await res.json();
                if (data.success) {
                  alert("Profile updated successfully!");
                  const updatedUser = { ...getUser(), ...profile, avatar: profile.photo };
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  window.location.reload();
                } else {
                  alert(data.message || 'Failed to update profile');
                }
              } catch(err) { console.error(err); alert("Error updating profile"); }
            }}
          />
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className={`flex h-screen ${settings.darkMode ? 'bg-[#0B1120] text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans overflow-hidden transition-colors duration-300`}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            <Header
              darkMode={settings.darkMode}
              setDarkMode={(val) => saveSettings({ ...settings, darkMode: val })}
              sidebarSearchTerm={searchTerm}
              setSidebarSearchTerm={setSearchTerm}
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              showLanguageDropdown={showLanguageDropdown}
              setShowLanguageDropdown={setShowLanguageDropdown}
              notifications={data.notifications}
              showNotificationDropdown={showNotificationDropdown}
              setShowNotificationDropdown={setShowNotificationDropdown}
              handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              handleNotificationClick={handleNotificationClick}
              switchTab={setTab}
              setShowScannerInvoice={setShowScannerInvoice}
              setSidebarOpen={setSidebarOpen}
            />
            <div className={`${settings.darkMode ? 'bg-[#0B1120]' : 'bg-gray-50'} transition-colors duration-300`}>
              {renderTab()}
            </div>
          </div>
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

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Create New {userFormData.role}</h3>
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mt-1">Manual account provisioning</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showUserPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 font-medium ml-1">
                  Must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="+977 98XXXXXXXX"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ManualInvoiceModal
        showInvoiceForm={showInvoiceForm} setShowInvoiceForm={setShowInvoiceForm}
        handleSaveInvoice={handleSaveInvoice}
        darkMode={settings.darkMode} invoiceFormData={invoiceFormData} setInvoiceFormData={setInvoiceFormData}
        customers={data.customers || []} products={data.products || []}
        invoiceTotals={{
          subtotal: (invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0),
          discount: ((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) * (invoiceFormData.discountRate || 0)) / 100,
          tax: ((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) - (((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) * (invoiceFormData.discountRate || 0)) / 100)) * ((invoiceFormData.taxRate || 0) / 100),
          grandTotal: (invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) 
            - (((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) * (invoiceFormData.discountRate || 0)) / 100)
            + (((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) - (((invoiceFormData.items || []).reduce((s, i) => s + (i.qty * (i.price || 0)), 0) * (invoiceFormData.discountRate || 0)) / 100)) * ((invoiceFormData.taxRate || 0) / 100))
        }}
        labelClass="text-[10px] font-black uppercase text-gray-400 mb-1 block"
        inputClass="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors text-gray-800"
        userRole="superadmin"
        loading={isSubmittingInvoice}
      />

      {showScannerInvoice && (
        <BarcodeScannerInvoiceModal
          darkMode={settings.darkMode}
          onClose={() => {
            setShowScannerInvoice(false);
            setSelectedOrderForInvoice(null);
          }}
          products={data.products || []}
          onSaveInvoice={handleSaveScannerInvoice}
          profile={user}
          taxRate={settings.taxRate}
          defaultDiscountRate={settings.defaultDiscount}
          userRole="superadmin"
          initialOrder={selectedOrderForInvoice}
          loading={isSubmittingInvoice}
        />
      )}

      {showSupplierForm && (
        <SupplierFormModal
          showSupplierForm={showSupplierForm}
          setShowSupplierForm={setShowSupplierForm}
          handleSaveSupplier={handleSaveSupplier}
          supplierFormData={supplierFormData}
          setSupplierFormData={setSupplierFormData}
          editSupplierId={editSupplierId}
          darkMode={settings.darkMode}
        />
      )}

      <ProductFormModal
        showProductForm={showProductForm}
        setShowProductForm={(v) => {
          setShowProductForm(v);
          if (!v) setProductFormData({ name: "", sno: "", productId: "", batchNo: "", barcode: "", category: "General", buyingPrice: 0, price: 0, stock: 0, maxStock: 100, expiryDate: "", status: "Active", image: "", supplier: "", supplierName: "" });
        }}
        productFormData={productFormData}
        setProductFormData={setProductFormData}
        handleSaveProduct={handleSaveProduct}
        darkMode={settings.darkMode}
        suppliers={data.suppliers || []}
        products={data.products || []}
        labelClass="text-[10px] font-black uppercase text-gray-400 mb-1 block"
        inputClass="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors text-gray-800"
      />
      <OrderFormModal
        showOrderForm={showOrderForm}
        setShowOrderForm={(v) => {
          setShowOrderForm(v);
          if (!v) setOrderFormData({ sno: "", customer: "", email: "", phone: "", product: "", amount: 0, status: "Pending", date: new Date().toISOString().split('T')[0], quantity: 1 });
        }}
        orderFormData={orderFormData}
        setOrderFormData={setOrderFormData}
        handleSaveOrder={handleSaveOrder}
        darkMode={settings.darkMode}
        customers={data.customers || []}
        products={data.products || []}
        orders={data.orders || []}
        labelClass="text-[10px] font-black uppercase text-gray-400 mb-1 block"
        inputClass="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors text-gray-800"
      />
      <CustomerFormModal
        showCustomerForm={showCustomerModal}
        setShowCustomerForm={setShowCustomerModal}
        handleSaveCustomer={handleSaveCustomer}
        customerFormData={customerFormData}
        setCustomerFormData={setCustomerFormData}
        editCustomerId={editCustomerId}
        darkMode={settings.darkMode}
      />
      <ExchangeFormModal
        showExchangeForm={showExchangeForm}
        setShowExchangeForm={setShowExchangeForm}
        handleSaveExchange={handleSaveExchange}
        exchangeFormData={exchangeFormData}
        setExchangeFormData={setExchangeFormData}
        products={data.products}
        darkMode={settings.darkMode}
        invoices={data.invoices || []}
        suppliers={data.suppliers || []}
        labelClass="text-[10px] font-black uppercase text-gray-400 mb-1 block"
        inputClass="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors text-gray-800"
      />
    </div>
  );
}
