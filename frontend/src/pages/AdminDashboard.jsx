import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Bell,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  LogOut,
  TrendingUp,
  AlertTriangle,
  Sun,
  Moon,
  Settings as SettingsIcon,
  FileText,
  X,
  CheckCircle,
  Camera,
  ChevronDown,
  ChevronRight,
  Receipt,
  Download,
  Printer,
  Scan,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

// Auth & Utils
import { getUser, clearAuth } from "../utils/auth";
import {
  generateBarcodeSVG,
  generateSequentialInvoiceId,
  statusColor,
  categoryColors,
  CATEGORY_COLORS,
  groupLogsByDate,
  API_URL
} from "../components/admin/adminUtils";
import {
  handlePreviewInvoice,
  handleDownloadInvoice,
  handlePrintInvoice,
  handleExportCSV,
  handleExportPDF,
  handleExportExcel
} from "../components/admin/InvoiceUtils";

// Modular UI Components
import {
  SidebarItem,
  SidebarSubItem,
  StatCard,
  QuickActionBtn,
  Modal,
  SettingsToggle,
  SettingsRow
} from "../components/admin/AdminUI";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

// Modular Tabs
import ProductsTab from "../components/admin/ProductsTab";
import ProductCardsTab from "../components/admin/ProductCardsTab";
import DashboardTab from "../components/admin/DashboardTab";
import OrdersTab from "../components/admin/OrdersTab";
import SuppliersTab from "../components/admin/SuppliersTab";
import NotificationsTab from "../components/admin/NotificationsTab";
import ExchangesTab from "../components/admin/ExchangesTab";
import HistoryTab from "../components/admin/HistoryTab";
import ProfileTab from "../components/admin/ProfileTab";
import SettingsTab from "../components/admin/SettingsTab";
import ReportsTab from "../components/admin/ReportsTab";

// Modular Modals
import CSVImportModal from "../components/admin/CSVImportModal";
import BarcodeScannerInvoiceModal from "../components/admin/BarcodeScannerInvoiceModal";
import OrderFormModal from "../components/admin/modals/OrderFormModal";
import ProductFormModal from "../components/admin/modals/ProductFormModal";
import SupplierFormModal from "../components/admin/modals/SupplierFormModal";
import ExchangeFormModal from "../components/admin/modals/ExchangeFormModal";
import LotFormModal from "../components/admin/modals/LotFormModal";

// Custom Hooks
import { useAdminData } from "../components/admin/useAdminData";
import { useAdminHandlers } from "../components/admin/useAdminHandlers";

const AdminDashboard = ({ initialTab }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(initialTab || localStorage.getItem("activeTab") || "dashboard");
  const [pages, setPages] = useState({ products: 1, orders: 1, suppliers: 1 });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved).darkMode : localStorage.getItem("darkMode") === "true";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Menu visibility states
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const [exchangeMenuOpen, setExchangeMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [supplierSidebarOpen, setSupplierSidebarOpen] = useState(false);
  const [invoiceSidebarOpen, setInvoiceSidebarOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("US English");

  // Modal visibility states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showCSVImportModal, setShowCSVImportModal] = useState(false);
  const [showScannerInvoice, setShowScannerInvoice] = useState(false);

  // Form Data States
  const [productFormData, setProductFormData] = useState({ name: "", price: 0, stock: 0, category: "General", status: "Active" });
  const [orderFormData, setOrderFormData] = useState({ product: "", customer: "", status: "Pending", date: new Date().toISOString().split("T")[0], amount: "" });
  const [supplierFormData, setSupplierFormData] = useState({ name: "", contactPerson: "", phone: "", category: "Regular", status: "Active" });
  const [exchangeFormData, setExchangeFormData] = useState({ type: "customer", customerName: "", returnedProductId: "", newProductId: "", quantity: 1, reason: "", restocked: true });
  const [lotFormData, setLotFormData] = useState({ lotNumber: "", receivedDate: "", items: [] });
  const [lotNewItem, setLotNewItem] = useState({ productName: "", quantityReceived: 0, purchasePrice: 0 });

  // Selection/Edit States
  const [editProductIndex, setEditProductIndex] = useState(null);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [selectedSupplierForLots, setSelectedSupplierForLots] = useState(null);
  const [lotTargetSupplier, setLotTargetSupplier] = useState(null);
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);
  const [supplierDetailData, setSupplierDetailData] = useState({});
  const [reportRange, setReportRange] = useState("month");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [supplierSearch, setSupplierSearch] = useState("");

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "+977 98XXXXXXXX",
    photo: null,
  });

  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    taxRate: 0.13,
    defaultDiscountRate: 0,
    enableNotifications: true,
  });

  const profilePhotoInputRef = useRef(null);

  // --- HOOKS ---
  const {
    loading, products, setProducts, orders, setOrders, invoices, setInvoices,
    suppliers, setSuppliers, customers, setCustomers, notifications, setNotifications,
    exchanges, setExchanges, historyLogs, setHistoryLogs,
    settings: globalSettings, setSettings: setGlobalSettings,
    fetchData, fetchNotifications, fetchHistoryLogs
  } = useAdminData(token, navigate);

  useEffect(() => {
    if (globalSettings) {
      setSettings({
        lowStockThreshold: globalSettings.lowStockThreshold,
        taxRate: globalSettings.taxRate / 100,
        defaultDiscountRate: globalSettings.defaultDiscount,
        enableNotifications: true, // or from globalSettings if added
      });
    }
  }, [globalSettings]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlers = useAdminHandlers({
    token, fetchData, fetchNotifications, fetchHistoryLogs, triggerToast,
    setProducts, setOrders, setInvoices, setSuppliers, setCustomers, setNotifications,
    setExchanges, setHistoryLogs, products, orders, invoices, suppliers, customers,
    notifications, exchanges, settings, profile,
    setProductFormData, setShowProductForm, setEditProductIndex,
    setOrderFormData, setShowOrderForm, setEditOrderId,
    setSupplierFormData, setShowSupplierForm, setEditSupplierId, setLotFormData,
    setShowLotForm, setLotTargetSupplier, setLotNewItem, setExchangeFormData,
    setShowExchangeForm,
    setSupplierDetailData, setExpandedSupplierId, expandedSupplierId, supplierDetailData,
    setShowScannerInvoice
  });

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (selectedSupplierForLots && !supplierDetailData[selectedSupplierForLots._id]) {
      handlers.handleToggleSupplierExpand(selectedSupplierForLots._id);
    }
  }, [selectedSupplierForLots]);

  // --- HELPERS ---
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");

    // Map internal tab names to URLs
    const tabUrlMap = {
      dashboard: "/admin/dashboard",
      productList: "/admin/products",
      productView: "/admin/products/view",
      invoices: "/admin/invoices",
      orders: "/admin/orders",
      customers: "/admin/customer",
      suppliers: "/admin/suppliers",
      notifications: "/admin/notifications",
      profile: "/admin/profile",
      settings: "/admin/settings",
      posScanner: "/admin/pos"
    };

    if (tabUrlMap[tab]) {
      navigate(tabUrlMap[tab]);
    }
  };

  const cardClass = darkMode
    ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 text-white shadow-2xl"
    : "bg-white/90 backdrop-blur-xl border border-white/40 text-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]";

  const inputClass = darkMode
    ? "w-full bg-gray-900/50 border border-gray-700 text-white p-4 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 outline-none transition-all placeholder:text-gray-600 shadow-inner"
    : "w-full bg-white border border-gray-100 text-gray-800 p-4 text-sm rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 outline-none transition-all placeholder:text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";

  const labelClass = darkMode
    ? "block text-[11px] font-black tracking-widest text-gray-500 uppercase mb-2.5 ml-1"
    : "block text-[11px] font-black tracking-widest text-gray-400 uppercase mb-2.5 ml-1";

  // Filtering Logic
  const q = searchTerm.toLowerCase();

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.productId?.toLowerCase().includes(q) ||
    p.barcode?.toLowerCase().includes(q)
  );

  const filteredOrders = orders.filter(o =>
    o.product?.toLowerCase().includes(q) ||
    o.status?.toLowerCase().includes(q) ||
    o.customerName?.toLowerCase().includes(q) ||
    o.customerEmail?.toLowerCase().includes(q) ||
    o.customerPhone?.toLowerCase().includes(q)
  );

  const customerStats = (customers || []).map(c => {
    const cInvoices = invoices.filter(inv => inv.customer?.toLowerCase() === c.name?.toLowerCase());
    return { ...c, totalSpent: cInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0), totalOrders: cInvoices.length };
  });

  const filteredCustomerStats = customerStats.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.phone?.toLowerCase().includes(q) ||
    c.customerId?.toLowerCase().includes(q)
  );

  const filteredInvoices = (invoices || []).filter(inv =>
    inv.invoiceId?.toLowerCase().includes(q) ||
    inv.customer?.name?.toLowerCase().includes(q) ||
    inv.paymentMethod?.toLowerCase().includes(q) ||
    inv.status?.toLowerCase().includes(q)
  );

  const filteredNotifications = (notifications || []).filter(n =>
    n.title?.toLowerCase().includes(q) ||
    n.message?.toLowerCase().includes(q) ||
    n.type?.toLowerCase().includes(q)
  );

  const filteredExchanges = (exchanges || []).filter(ex =>
    ex.customerName?.toLowerCase().includes(q) ||
    ex.returnedProduct?.name?.toLowerCase().includes(q) ||
    ex.newProduct?.name?.toLowerCase().includes(q) ||
    ex.reason?.toLowerCase().includes(q)
  );

  // Stats for Dashboard
  const totalRevenue = (invoices || []).reduce((s, inv) => s + (inv.totalAmount || 0), 0);
  const activeProductsCount = (products || []).filter(p => p.status === "Active").length;
  const unactiveProductsCount = (products || []).filter(p => p.status === "Unactive").length;
  const lowStockProducts = (products || []).filter(p => p.stock <= settings.lowStockThreshold);
  const expirySoonProducts = (products || []).filter(p => {
    if (!p.expiryDate) return false;
    const diff = new Date(p.expiryDate) - new Date();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  const recentProducts = [...(products || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  const recentOrders = [...(orders || [])].slice(-3).reverse();
  const recentInvoices = [...(invoices || [])].slice(0, 5);
  const recentHistory = [...(historyLogs || [])].slice(0, 5);

  const salesData = Object.entries((invoices || []).reduce((acc, inv) => {
    const date = inv.date || new Date(inv.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + (inv.totalAmount || 0);
    return acc;
  }, {})).map(([date, amount]) => ({
    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    uv: amount
  })).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7); // Last 7 days with data
  const stockByCategoryData = Object.entries((products || []).reduce((acc, p) => {
    const cat = p.category || "General";
    acc[cat] = (acc[cat] || 0) + (p.stock || 0);
    return acc;
  }, {})).map(([name, count]) => ({ name, count }));

  const categoryPieData = Object.entries((products || []).reduce((acc, p) => {
    const cat = p.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const categoryReport = Object.entries((products || []).reduce((acc, p) => {
    const cat = p.category || "General";
    if (!acc[cat]) acc[cat] = { category: cat, totalStock: 0, productCount: 0, inventoryValue: 0 };
    acc[cat].totalStock += p.stock || 0;
    acc[cat].productCount += 1;
    acc[cat].inventoryValue += (p.price || 0) * (p.stock || 0);
    return acc;
  }, {})).map(([_, data]) => data);

  const reportDataSets = {
    daily: [
      { name: "Mon", uv: 4000 }, { name: "Tue", uv: 3000 }, { name: "Wed", uv: 2000 },
      { name: "Thu", uv: 2780 }, { name: "Fri", uv: 1890 }, { name: "Sat", uv: 2390 }, { name: "Sun", uv: 3490 }
    ],
    weekly: [
      { name: "Week 1", uv: 14000 }, { name: "Week 2", uv: 13000 },
      { name: "Week 3", uv: 12000 }, { name: "Week 4", uv: 15780 }
    ],
    monthly: [
      { name: "Jan", uv: 40000 }, { name: "Feb", uv: 30000 }, { name: "Mar", uv: 20000 },
      { name: "Apr", uv: 27800 }, { name: "May", uv: 18900 }, { name: "Jun", uv: 23900 }
    ],
    yearly: [
      { name: "2023", uv: 400000 }, { name: "2024", uv: 300000 }, { name: "2025", uv: 200000 }, { name: "2026", uv: 278000 }
    ]
  };



  const totalCustomerSpent = customerStats.reduce((s, c) => s + c.totalSpent, 0);
  const activeCustomersCount = customerStats.filter(c => c.status === "active").length;
  const blockedCustomersCount = customerStats.filter(c => c.status === "blocked").length;

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"} font-sans transition-colors`}>
      <Sidebar
        activeTab={activeTab}
        switchTab={switchTab}
        sidebarSearchTerm={sidebarSearchTerm}
        orderMenuOpen={orderMenuOpen}
        setOrderMenuOpen={setOrderMenuOpen}
        customerMenuOpen={customerMenuOpen}
        setCustomerMenuOpen={setCustomerMenuOpen}
        supplierSidebarOpen={supplierSidebarOpen}
        setSupplierSidebarOpen={setSupplierSidebarOpen}
        exchangeMenuOpen={exchangeMenuOpen}
        setExchangeMenuOpen={setExchangeMenuOpen}
        productMenuOpen={productMenuOpen}
        setProductMenuOpen={setProductMenuOpen}
        exchangeFormData={exchangeFormData}
        setExchangeFormData={setExchangeFormData}
        setShowOrderForm={setShowOrderForm}
        setShowCustomerForm={() => {}} 
        openAddSupplier={() => { setSupplierFormData({ name: "", contactPerson: "", phone: "", category: "Regular", status: "Active" }); setEditSupplierId(null); setShowSupplierForm(true); }}
        openAddInvoice={() => {}}
        setShowScannerInvoice={setShowScannerInvoice}
        setShowExchangeForm={setShowExchangeForm}
        handleLogout={() => handlers.handleLogout(navigate, clearAuth)}
        profile={profile}
      />

      <main className="flex-1 ml-72 p-10 overflow-y-auto min-h-screen">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarSearchTerm={sidebarSearchTerm}
          setSidebarSearchTerm={setSidebarSearchTerm}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          showLanguageDropdown={showLanguageDropdown}
          setShowLanguageDropdown={setShowLanguageDropdown}
          notifications={notifications}
          showNotificationDropdown={showNotificationDropdown}
          setShowNotificationDropdown={setShowNotificationDropdown}
          handleMarkAllNotificationsRead={handlers.handleMarkAllNotificationsRead}
          handleNotificationClick={(n) => handlers.handleNotificationClick(n, activeTab, switchTab, setShowNotificationDropdown)}
          switchTab={switchTab}
          setShowScannerInvoice={setShowScannerInvoice}
        />

        {showToast && (
          <div className="fixed top-10 right-10 z-50 animate-bounce">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
              <CheckCircle size={24} />
              <div>
                <h4 className="font-bold">Success!</h4>
                <p className="text-sm">{toastMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB RENDERING */}
        {activeTab === "dashboard" && (
          <DashboardTab
            profile={profile} products={products} orders={orders} invoices={invoices}
            customers={customers} suppliers={suppliers} totalRevenue={totalRevenue}
            activeProductsCount={activeProductsCount} unactiveProductsCount={unactiveProductsCount}
            expirySoonProducts={expirySoonProducts} recentProducts={recentProducts}
            recentOrders={recentOrders} recentInvoices={recentInvoices}
            recentHistory={recentHistory} salesData={salesData}
            stockByCategoryData={stockByCategoryData} categoryPieData={categoryPieData}
            darkMode={darkMode} cardClass={cardClass} switchTab={switchTab}
            handleEditProduct={(idx) => { setProductFormData({ ...products[idx] }); setEditProductIndex(idx); setShowProductForm(true); }}
            openAddProduct={() => { setShowProductForm(true); setEditProductIndex(null); }}
            setShowScannerInvoice={setShowScannerInvoice}
            statusColor={statusColor} categoryColors={categoryColors}
          />
        )}

        {activeTab === "productList" && (
          <ProductsTab
            filteredProducts={filteredProducts}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            darkMode={darkMode} cardClass={cardClass}
            handleExportCSV={handleExportCSV} setShowCSVImportModal={setShowCSVImportModal}
            openAddProduct={() => { setShowProductForm(true); setEditProductIndex(null); }}
            handleEditProduct={(idx) => { setProductFormData({ ...products[idx] }); setEditProductIndex(idx); setShowProductForm(true); }}
            handleDeleteProduct={handlers.handleDeleteProduct} settings={settings}
            currentPage={pages.products}
            onPageChange={(p) => setPages({ ...pages, products: p })}
          />
        )}

        {activeTab === "productView" && (
          <ProductCardsTab
            filteredProducts={filteredProducts}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            darkMode={darkMode} cardClass={cardClass}
            setShowCSVImportModal={setShowCSVImportModal} openAddProduct={() => setShowProductForm(true)}
            handleEditProduct={(idx) => { setProductFormData({ ...products[idx] }); setEditProductIndex(idx); setShowProductForm(true); }}
            handleDeleteProduct={handlers.handleDeleteProduct} settings={settings}
          />
        )}


        {activeTab === "orders" && (
          <OrdersTab
            orders={orders} filteredOrders={filteredOrders}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            darkMode={darkMode} cardClass={cardClass}
            statusColor={statusColor} setShowOrderForm={setShowOrderForm}
            setEditOrderId={setEditOrderId} setOrderFormData={setOrderFormData}
            handleEditOrder={(order) => { setOrderFormData({ ...order }); setEditOrderId(order._id); setShowOrderForm(true); }}
            handleDeleteOrder={handlers.handleDeleteOrder}
            currentPage={pages.orders}
            onPageChange={(p) => setPages({ ...pages, orders: p })}
          />
        )}

        {activeTab === "suppliers" && (
          <SuppliersTab
            suppliers={suppliers} supplierSearch={supplierSearch}
            supplierDetailData={supplierDetailData} products={products}
            selectedSupplierForLots={selectedSupplierForLots}
            setSelectedSupplierForLots={setSelectedSupplierForLots}
            setSupplierFormData={setSupplierFormData}
            setEditSupplierId={setEditSupplierId}
            setShowSupplierForm={setShowSupplierForm}
            darkMode={darkMode} cardClass={cardClass}
            openAddSupplier={() => {
              setEditSupplierId(null);
              setSupplierFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "General", status: "Active" });
              setShowSupplierForm(true);
            }}
            handleDeleteSupplier={handlers.handleDeleteSupplier}
            handleUpdateSupplierStatus={handlers.handleUpdateSupplierStatus}
            openLotForm={(s) => { setLotTargetSupplier(s); setShowLotForm(true); }}
            handleDeleteLot={handlers.handleDeleteLot}
            handleEditProduct={(p) => {
              const idx = products.findIndex(prod => prod._id === p._id);
              if (idx !== -1) {
                setProductFormData({ ...products[idx] });
                setEditProductIndex(idx);
                setShowProductForm(true);
              }
            }}
            handleDeleteProduct={handlers.handleDeleteProduct}
            currentPage={pages.suppliers}
            onPageChange={(p) => setPages({ ...pages, suppliers: p })}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            notifications={filteredNotifications}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            darkMode={darkMode} cardClass={cardClass}
            settings={settings}
            handleMarkAllNotificationsRead={handlers.handleMarkAllNotificationsRead}
            handleNotificationClick={(n) => handlers.handleNotificationClick(n, activeTab, switchTab, setShowNotificationDropdown)}
          />
        )}

        {activeTab === "exchanges" && (
          <ExchangesTab
            exchanges={filteredExchanges}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            darkMode={darkMode} cardClass={cardClass}
            setShowExchangeForm={setShowExchangeForm} setExchangeFormData={setExchangeFormData}
            handleDeleteExchange={handlers.handleDeleteExchange} triggerToast={triggerToast}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            historyLogs={historyLogs} historySearch={historySearch}
            setHistorySearch={setHistorySearch} historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter} loading={loading}
            fetchHistoryLogs={fetchHistoryLogs} darkMode={darkMode} cardClass={cardClass}
            groupLogsByDate={groupLogsByDate}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            profile={profile} setProfile={setProfile} darkMode={darkMode}
            cardClass={cardClass} labelClass={labelClass} inputClass={inputClass}
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
            handleProfileSave={() => handlers.handleProfileSave(profile)}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            darkMode={darkMode} setDarkMode={setDarkMode} settings={settings}
            setSettings={setSettings} cardClass={cardClass} inputClass={inputClass}
            handleResetData={handlers.handleResetData}
            handleSettingsSave={() => handlers.handleSettingsSave(settings, darkMode)}
            triggerToast={triggerToast} SettingsToggle={SettingsToggle} SettingsRow={SettingsRow}
          />
        )}

        {activeTab === "reports" && (
          <ReportsTab
            products={products} categoryReport={categoryReport}
            reportRange={reportRange} setReportRange={setReportRange}
            reportDataSets={reportDataSets} darkMode={darkMode} cardClass={cardClass}
            handleExportPDF={handleExportPDF} handleExportExcel={handleExportExcel}
            CATEGORY_COLORS={CATEGORY_COLORS}
          />
        )}
      </main>

      {/* MODALS */}
      <OrderFormModal
        showOrderForm={showOrderForm} setShowOrderForm={setShowOrderForm}
        orderFormData={orderFormData} setOrderFormData={setOrderFormData}
        handleSaveOrder={() => handlers.handleSaveOrder(orderFormData, editOrderId)}
        darkMode={darkMode} products={products} labelClass={labelClass} inputClass={inputClass}
      />

      <ProductFormModal
        showProductForm={showProductForm} setShowProductForm={setShowProductForm}
        productFormData={productFormData} setProductFormData={setProductFormData}
        handleSaveProduct={() => handlers.handleSaveProduct(productFormData)}
        darkMode={darkMode} suppliers={suppliers} products={products}
        labelClass={labelClass} inputClass={inputClass}
      />

      <OrderFormModal
        showOrderForm={showOrderForm} setShowOrderForm={setShowOrderForm}
        orderFormData={orderFormData} setOrderFormData={setOrderFormData}
        handleSaveOrder={() => handlers.handleSaveOrder(orderFormData, editOrderId)}
        darkMode={darkMode} customers={customers} products={products} orders={orders}
        labelClass={labelClass} inputClass={inputClass}
      />



      <SupplierFormModal
        showSupplierForm={showSupplierForm} setShowSupplierForm={setShowSupplierForm}
        editSupplierId={editSupplierId} handleSaveSupplier={() => handlers.handleSaveSupplier(supplierFormData, editSupplierId)}
        supplierFormData={supplierFormData} setSupplierFormData={setSupplierFormData}
        darkMode={darkMode} inputClass={inputClass}
      />

      <LotFormModal
        showLotForm={showLotForm} setShowLotForm={setShowLotForm}
        lotTargetSupplier={lotTargetSupplier} lotFormData={lotFormData}
        setLotFormData={setLotFormData} lotNewItem={lotNewItem} setLotNewItem={setLotNewItem}
        handleAddLotItem={() => { if (lotNewItem.product && lotNewItem.quantityReceived > 0) { setLotFormData(p => ({ ...p, items: [...p.items, { ...lotNewItem }] })); setLotNewItem({ product: "", productName: "", quantityReceived: 0, purchasePrice: 0 }); } }}
        handleRemoveLotItem={(idx) => setLotFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
        handleSaveLot={() => handlers.handleSaveLot(lotFormData, lotTargetSupplier)}
        darkMode={darkMode} inputClass={inputClass}
      />

      <ExchangeFormModal
        showExchangeForm={showExchangeForm} setShowExchangeForm={setShowExchangeForm}
        exchangeFormData={exchangeFormData} setExchangeFormData={setExchangeFormData}
        handleSaveExchange={() => handlers.handleSaveExchange(exchangeFormData)}
        darkMode={darkMode} products={products} labelClass={labelClass} inputClass={inputClass}
        invoices={invoices} suppliers={suppliers}
      />

      {showCSVImportModal && (
        <CSVImportModal
          darkMode={darkMode} onClose={() => setShowCSVImportModal(false)}
          onImport={(data) => handlers.handleCSVImport(data, products, fetchData, triggerToast, token)}
          existingProducts={products}
        />
      )}

      {showScannerInvoice && (
        <BarcodeScannerInvoiceModal
          darkMode={darkMode} onClose={() => setShowScannerInvoice(false)}
          products={products} onSaveInvoice={handlers.handleSaveScannerInvoice}
          profile={profile} taxRate={settings.taxRate}
          defaultDiscountRate={settings.defaultDiscountRate}
          lowStockThreshold={settings.lowStockThreshold}
        />
      )}
    </div>
  );
};

export default AdminDashboard;