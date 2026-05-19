import React from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  User, 
  Truck, 
  RotateCcw, 
  Package, 
  Receipt, 
  FileText, 
  Bell, 
  History, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { SidebarItem, SidebarSubItem } from "./AdminUI";
import logoImg from "../../images/logo.png";

const Sidebar = ({
  activeTab,
  switchTab,
  sidebarSearchTerm,
  orderMenuOpen,
  setOrderMenuOpen,
  customerMenuOpen,
  setCustomerMenuOpen,
  supplierSidebarOpen,
  setSupplierSidebarOpen,
  exchangeMenuOpen,
  setExchangeMenuOpen,
  productMenuOpen,
  setProductMenuOpen,
  invoiceSidebarOpen,
  setInvoiceSidebarOpen,
  customerViewMode,
  setCustomerViewMode,
  exchangeFormData,
  setExchangeFormData,
  setShowOrderForm,
  setShowCustomerForm,
  openAddSupplier,
  openAddInvoice,
  setShowScannerInvoice,
  setShowExchangeForm,
  handleLogout,
  profile
}) => {
  const s = sidebarSearchTerm.toLowerCase();

  return (
    <aside className="w-72 flex flex-col fixed h-full z-10 transition-all duration-500 shadow-[20px_0_60px_rgba(0,0,0,0.2)] bg-[#0B1120] border-r border-[#1e293b]">
      <div className="p-8 border-b border-white/5 transition-all">
        <div className="flex items-center gap-4 mb-6 group cursor-pointer" onClick={() => switchTab("dashboard")}>
          <div className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <img
              src={logoImg}
              alt="Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_5px_15px_rgba(255,255,255,0.1)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3067/3067451.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter leading-none text-white">STOCK <br /> INVENTORY</h1>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-green-400">Management System</p>
          </div>
        </div>

        <div className="mt-6 px-1 translate-x-1">
          <p className="font-black text-sm uppercase tracking-tight text-white">{profile.name}</p>
          <p className="text-[10px] font-bold opacity-50 truncate text-gray-300">{profile.email}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <ul className="space-y-1.5">
          {("dashboard").includes(s) && (
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => switchTab("dashboard")}
            />
          )}

          {("orders order details add order").includes(s) && (
            <li>
              <button
                onClick={() => setOrderMenuOpen(!orderMenuOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${activeTab === "orders"
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart size={20} />
                  <span>Orders</span>
                </span>
                {orderMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {(orderMenuOpen || s) && (
                <ul className="mt-1 ml-6 space-y-1">
                  {("order details").includes(s) && <SidebarSubItem label="Order Details" active={activeTab === "orders"} onClick={() => switchTab("orders")} />}
                  {("add order").includes(s) && <SidebarSubItem label="Add Order" active={false} onClick={() => { switchTab("orders"); setShowOrderForm(true); }} />}
                </ul>
              )}
            </li>
          )}

          {("invoices ledger billing").includes(s) && (
            <li>
              <button
                onClick={() => setInvoiceSidebarOpen(!invoiceSidebarOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${activeTab === "invoices"
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Receipt size={20} />
                  <span>Invoices</span>
                </span>
                {invoiceSidebarOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {(invoiceSidebarOpen || s) && (
                <ul className="mt-1 ml-6 space-y-1">
                  {("financial ledger").includes(s) && <SidebarSubItem label="Financial Ledger" active={activeTab === "invoices"} onClick={() => switchTab("invoices")} />}
                  {("manual invoice").includes(s) && <SidebarSubItem label="Manual Invoice" active={false} onClick={() => { switchTab("invoices"); openAddInvoice(); }} />}
                  {("barcode scanner").includes(s) && <SidebarSubItem label="Barcode Scanner" active={false} onClick={() => { switchTab("invoices"); setShowScannerInvoice(true); }} />}
                </ul>
              )}
            </li>
          )}


          {("suppliers supplier detail add supplier").includes(s) && (
            <li>
              <button
                onClick={() => setSupplierSidebarOpen(!supplierSidebarOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${activeTab === "suppliers" || activeTab === "lots"
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Truck size={20} />
                  <span>Suppliers</span>
                </span>
                {supplierSidebarOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {(supplierSidebarOpen || s) && (
                <ul className="mt-1 ml-6 space-y-1">
                  {("suppliers detail").includes(s) && <SidebarSubItem label="Suppliers Detail" active={activeTab === "suppliers"} onClick={() => switchTab("suppliers")} />}
                  {("add supplier").includes(s) && <SidebarSubItem label="Add Supplier" active={false} onClick={() => { switchTab("suppliers"); openAddSupplier(); }} />}
                </ul>
              )}
            </li>
          )}

          {("exchanges customer returns supplier returns").includes(s) && (
            <li>
              <button
                onClick={() => setExchangeMenuOpen(!exchangeMenuOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${activeTab === "exchanges"
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <RotateCcw size={20} />
                  <span>Exchanges</span>
                </span>
                {exchangeMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {(exchangeMenuOpen || s) && (
                <ul className="mt-1 ml-6 space-y-1">
                  {("customer returns").includes(s) && (
                    <SidebarSubItem
                      label="Customer Returns"
                      active={activeTab === "exchanges" && exchangeFormData.type === "customer"}
                      onClick={() => {
                        setExchangeFormData({ ...exchangeFormData, type: "customer" });
                        setShowExchangeForm(true);
                        switchTab("exchanges");
                      }}
                    />
                  )}
                  {("supplier returns").includes(s) && (
                    <SidebarSubItem
                      label="Supplier Returns"
                      active={activeTab === "exchanges" && exchangeFormData.type === "supplier"}
                      onClick={() => {
                        setExchangeFormData({ ...exchangeFormData, type: "supplier" });
                        setShowExchangeForm(true);
                        switchTab("exchanges");
                      }}
                    />
                  )}
                </ul>
              )}
            </li>
          )}

          {("products product list product view").includes(s) && (
            <li>
              <button
                onClick={() => setProductMenuOpen(!productMenuOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg cursor-pointer transition-all uppercase text-xs font-black tracking-widest ${activeTab === "productList" || activeTab === "productView"
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Package size={20} />
                  <span>Products</span>
                </span>
                {productMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {(productMenuOpen || s) && (
                <ul className="mt-1 ml-6 space-y-1">
                  {("product list").includes(s) && <SidebarSubItem label="Product List" active={activeTab === "productList"} onClick={() => switchTab("productList")} />}
                  {("product view").includes(s) && <SidebarSubItem label="Product View" active={activeTab === "productView"} onClick={() => switchTab("productView")} />}
                </ul>
              )}
            </li>
          )}


          {("reports").includes(s) && (
            <SidebarItem icon={<FileText size={20} />} label="Reports" active={activeTab === "reports"} onClick={() => switchTab("reports")} />
          )}
          {("notifications").includes(s) && (
            <SidebarItem icon={<Bell size={20} />} label="Notifications" active={activeTab === "notifications"} onClick={() => switchTab("notifications")} />
          )}
          {("activity history").includes(s) && (
            <SidebarItem icon={<History size={20} />} label="Activity History" active={activeTab === "history"} onClick={() => switchTab("history")} />
          )}
          {("profile").includes(s) && (
            <SidebarItem icon={<User size={20} />} label="Profile" active={activeTab === "profile"} onClick={() => switchTab("profile")} />
          )}
          {("settings").includes(s) && (
            <SidebarItem icon={<SettingsIcon size={20} />} label="Settings" active={activeTab === "settings"} onClick={() => switchTab("settings")} />
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-semibold"
        >
          <LogOut size={18} /> LOGOUT
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
