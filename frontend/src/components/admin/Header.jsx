import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Receipt, 
  ChevronDown, 
  Sun, 
  Moon, 
  Bell, 
  Settings, 
  User,
  RefreshCw,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  RotateCw,
  Activity,
  Image as ImageIcon,
  X
} from "lucide-react";

// All searchable nav items — icon + label + tab id + optional keywords
const NAV_ITEMS = [
  { id: "dashboard",       label: "Overview",          icon: LayoutDashboard, keywords: ["home", "dashboard", "overview", "summary"] },
  { id: "usermanagement",  label: "User Management",   icon: ShieldCheck,     keywords: ["user", "admin", "management", "accounts", "block"] },
  { id: "products",        label: "Products",          icon: Package,         keywords: ["product", "stock", "inventory", "sku", "catalog", "item"] },
  { id: "orders",          label: "Orders",            icon: ShoppingCart,    keywords: ["order", "purchase", "cart", "sale"] },
  { id: "invoices",        label: "Invoices",          icon: Receipt,         keywords: ["invoice", "bill", "payment", "receipt", "financial"] },
  { id: "suppliers",       label: "Suppliers",         icon: Truck,           keywords: ["supplier", "vendor", "supply", "network"] },
  { id: "exchanges",       label: "Exchanges",         icon: RotateCw,        keywords: ["exchange", "return", "refund", "replace"] },
  { id: "reports",         label: "Reports",           icon: FileText,        keywords: ["report", "analytics", "export", "performance"] },
  { id: "notifications",   label: "Notifications",     icon: Bell,            keywords: ["notification", "alert", "message"] },
  { id: "promotions",      label: "Banner Promotion",  icon: ImageIcon,       keywords: ["banner", "promotion", "promo", "advertise", "image"] },
  { id: "activityhistory", label: "Activity History",  icon: Activity,        keywords: ["activity", "history", "log", "audit"] },
  { id: "settings",        label: "System Settings",   icon: Settings,        keywords: ["setting", "config", "system", "preference"] },
];

const Header = ({
  darkMode,
  setDarkMode,
  sidebarSearchTerm,
  setSidebarSearchTerm,
  currentLanguage,
  setCurrentLanguage,
  showLanguageDropdown,
  setShowLanguageDropdown,
  notifications,
  showNotificationDropdown,
  setShowNotificationDropdown,
  handleMarkAllNotificationsRead,
  handleNotificationClick,
  switchTab,
  setShowScannerInvoice,
  setSidebarOpen
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter nav items based on search term
  const filteredItems = sidebarSearchTerm.trim().length > 0
    ? NAV_ITEMS.filter(item => {
        const q = sidebarSearchTerm.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.keywords.some(k => k.includes(q))
        );
      })
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSidebarSearchTerm(e.target.value);
    setShowSearchDropdown(true);
    setSelectedIndex(-1);
  };

  const handleSelectItem = (item) => {
    switchTab(item.id);
    setSidebarSearchTerm("");
    setShowSearchDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSearchDropdown || filteredItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectItem(filteredItems[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
      setSidebarSearchTerm("");
    }
  };

  return (
    <header className={`flex justify-between items-center mb-8 p-4 rounded-2xl transition-all sticky top-0 z-20 ${
      darkMode 
        ? "bg-[#1E293B] border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl" 
        : "bg-white/80 border border-gray-100 shadow-sm backdrop-blur-md"
    }`}>
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
        >
          <Menu size={20} />
        </button>

        {/* Search bar with live dropdown */}
        <div className="relative flex items-center flex-1 max-w-2xl" ref={searchRef}>
          <Search
            className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all z-10 ${
              showSearchDropdown && sidebarSearchTerm
                ? "text-emerald-500 opacity-100"
                : "text-gray-400 opacity-60"
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search dashboard, orders, products, invoices, customers..."
            value={sidebarSearchTerm}
            onChange={handleSearchChange}
            onFocus={() => sidebarSearchTerm && setShowSearchDropdown(true)}
            onKeyDown={handleKeyDown}
            className={`pl-14 pr-20 py-3.5 rounded-xl border focus:outline-none focus:ring-4 w-full shadow-inner transition-all ${
              showSearchDropdown && filteredItems.length > 0
                ? "rounded-b-none border-emerald-300 focus:ring-emerald-500/10"
                : "border-gray-100 focus:ring-green-500/10"
            } ${darkMode
              ? "bg-gray-900/50 text-white placeholder:text-gray-600"
              : "bg-gray-50 text-gray-800 placeholder:text-gray-400"
            }`}
          />
          {sidebarSearchTerm ? (
            <button
              onClick={() => { setSidebarSearchTerm(""); setShowSearchDropdown(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X size={14} />
            </button>
          ) : (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400 shadow-sm border border-gray-100 pointer-events-none uppercase tracking-tighter">
              Enter
            </div>
          )}

          {/* Live search results dropdown */}
          {showSearchDropdown && sidebarSearchTerm.trim().length > 0 && (
            <div
              ref={dropdownRef}
              className={`absolute top-full left-0 right-0 rounded-b-xl border border-t-0 shadow-2xl z-50 overflow-hidden ${
                darkMode
                  ? "bg-[#1E293B] border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              {filteredItems.length === 0 ? (
                <div className={`px-5 py-4 text-xs font-bold flex items-center gap-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <Search size={14} />
                  No results for &quot;{sidebarSearchTerm}&quot;
                </div>
              ) : (
                <>
                  <div className={`px-4 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Navigate to
                  </div>
                  {filteredItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectItem(item); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-bold transition-all text-left ${
                          isSelected
                            ? darkMode
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                            : darkMode
                              ? "text-gray-300 hover:bg-white/5"
                              : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}>
                          <Icon size={14} />
                        </span>
                        <span>{item.label}</span>
                        {isSelected && (
                          <span className={`ml-auto text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                          }`}>
                            ↵ Go
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <div className={`px-5 py-2 text-[9px] font-bold border-t flex items-center gap-2 ${
                    darkMode ? "border-white/5 text-gray-600" : "border-gray-100 text-gray-400"
                  }`}>
                    <kbd className={`px-1.5 py-0.5 rounded text-[8px] border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"}`}>↑↓</kbd> navigate &nbsp;
                    <kbd className={`px-1.5 py-0.5 rounded text-[8px] border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"}`}>↵</kbd> select &nbsp;
                    <kbd className={`px-1.5 py-0.5 rounded text-[8px] border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"}`}>Esc</kbd> close
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            switchTab("invoices");
            setShowScannerInvoice(true);
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <span>Generate Bill</span>
          <Receipt size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-6">
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className={`flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl cursor-pointer transition-all border border-gray-200 group`}
          >
            <span className={`text-sm font-bold text-gray-700`}>{currentLanguage}</span>
            <ChevronDown size={16} className={`text-gray-400 group-hover:text-blue-500 transition-all ${showLanguageDropdown ? "rotate-180" : ""}`} />
          </button>

          {showLanguageDropdown && (
            <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-2xl z-[60] overflow-hidden border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <div className="p-1">
                <button
                  onClick={() => { setCurrentLanguage("US English"); setShowLanguageDropdown(false); }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-lg transition-all ${currentLanguage === "US English" ? "bg-blue-600 text-white" : (darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50")}`}
                >
                  🇺🇸 US English
                </button>
                <button
                  onClick={() => { setCurrentLanguage("Nepali"); setShowLanguageDropdown(false); }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-bold rounded-lg transition-all ${currentLanguage === "Nepali" ? "bg-blue-600 text-white" : (darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50")}`}
                >
                  🇳🇵 Nepali (नेपाली)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => window.location.reload()}
            className={`p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? "text-yellow-400" : "text-gray-500"}`}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className={`p-3 rounded-xl transition-all hover:bg-green-50 dark:hover:bg-green-600/20 relative ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute top-2 right-2 min-w-[16px] h-[16px] bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className={`absolute right-0 mt-3 w-80 rounded-xl shadow-2xl z-50 overflow-hidden border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "bg-green-900/10" : "bg-green-50/50"}`}>
                  <h4 className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>Notifications</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkAllNotificationsRead(); }}
                      className="text-[9px] font-black uppercase text-green-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                    <span className="text-[10px] px-2 py-1 bg-red-100 text-red-600 rounded-full font-bold">
                      {notifications.filter(n => n.unread).length} New
                    </span>
                  </div>
                </div>
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No new alerts</div>
                  ) : (
                    notifications.slice(0, 15).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { handleNotificationClick(n); }}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-600/10 cursor-pointer transition-colors group relative ${n.unread ? (darkMode ? 'bg-green-900/10' : 'bg-green-50/50') : ''}`}
                      >
                        {n.unread && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                        )}
                        <h5 className={`font-bold text-xs transition-colors ${n.unread ? 'text-green-600' : 'group-hover:text-green-600'}`}>
                          {n.title}
                        </h5>
                        <p className="text-[10px] opacity-70 mt-1">{n.message}</p>
                        <p className="text-[8px] opacity-40 mt-2 font-bold uppercase">{n.date}</p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setShowNotificationDropdown(false); switchTab("notifications"); }}
                  className="w-full py-3 text-[10px] font-black uppercase text-green-600 border-t dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-600/10 transition-colors"
                >
                  View All
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => switchTab("settings")}
            className={`p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            title="Settings"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => switchTab("profile")}
            className={`ml-2 p-1.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95 ${darkMode ? "border-gray-700 bg-gray-800 text-gray-300" : "border-gray-100 bg-white text-gray-600"}`}
            title="Profile"
          >
            <User size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
