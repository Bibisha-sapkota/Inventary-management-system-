// src/components/customer/Sidebar.jsx

import logo from "../../images/logo.png";
import Icons from "./Icons";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  cartCount, 
  unreadCount, 
  logout, 
  isOpen, 
  setIsOpen 
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "products", label: "Browse Products", icon: Icons.Products },
    { id: "cart", label: "My Cart", icon: Icons.Cart, badge: cartCount },
    { id: "history", label: "Order History", icon: Icons.History },
    { id: "exchanges", label: "Product Exchanges", icon: Icons.Exchange },
    { id: "notifications", label: "Notifications", icon: Icons.Bell, badge: unreadCount },
    { id: "profile", label: "Profile", icon: Icons.Profile },
    { id: "settings", label: "Settings", icon: Icons.Settings },
    { id: "documentation", label: "Help & Docs", icon: Icons.Document },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0B1120] text-slate-300 transition-transform duration-300 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center p-2.5 shadow-inner">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tight leading-none uppercase">Stock <span className="text-emerald-500">Inventory</span></h1>
              <p className="text-[10px] text-slate-500 mt-1 font-black tracking-[0.2em] uppercase opacity-60">
                Customer Portal
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === item.id
                          ? "text-white"
                          : "text-slate-400 group-hover:text-emerald-400"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === item.id
                          ? "bg-white text-emerald-600"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section (Logout) */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
              <Icons.Logout className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}