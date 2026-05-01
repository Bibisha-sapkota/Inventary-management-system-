import React from "react";
import { 
  Search, 
  Receipt, 
  ChevronDown, 
  Sun, 
  Moon, 
  Bell, 
  Settings, 
  User,
  RefreshCw 
} from "lucide-react";

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
  setShowScannerInvoice
}) => {
  return (
    <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all sticky top-0 z-20">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative group flex items-center flex-1 max-w-2xl">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-60 group-focus-within:opacity-100 group-focus-within:text-green-600 transition-all z-10"
            size={18}
          />
          <input
            type="text"
            placeholder="Search dashboard, orders, products, invoices, customers..."
            value={sidebarSearchTerm}
            onChange={(e) => setSidebarSearchTerm(e.target.value)}
            className={`pl-14 pr-20 py-3.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-green-500/10 w-full shadow-inner transition-all ${darkMode
              ? "bg-gray-900/50 text-white placeholder:text-gray-600"
              : "bg-gray-50 text-gray-800 placeholder:text-gray-400"
              }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400 shadow-sm border border-gray-100 pointer-events-none uppercase tracking-tighter">
            Enter
          </div>
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
                        onClick={() => {
                          handleNotificationClick(n);
                        }}
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
