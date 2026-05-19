import React from "react";
import { Bell, CheckCircle, Search } from "lucide-react";
import { Pagination } from "./AdminUI";

const NotificationsTab = ({
  notifications,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  settings,
  handleMarkAllNotificationsRead,
  handleNotificationClick,
  currentPage,
  onPageChange
}) => {
  const PAGE_SIZE = 10;
  const filteredNotifications = (notifications || []).filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`${cardClass} rounded-2xl shadow-sm p-6`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Intelligence Feed</h2>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mt-1">System-wide alerts & transaction history</p>
        </div>

        <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-bold transition-all outline-none ${
                darkMode 
                  ? "bg-gray-900/50 border-gray-700 text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50" 
                  : "bg-gray-50 border-gray-100 text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30"
              }`}
            />
          </div>

          <button
            onClick={handleMarkAllNotificationsRead}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border ${darkMode ? "border-gray-700" : "border-gray-100"} overflow-hidden`}>
        {paginatedNotifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="mx-auto mb-4 opacity-10" size={64} />
            <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Your history is clear</p>
          </div>
        ) : (
          paginatedNotifications.map((n, index) => (
            <div
              key={n.id || n._id || index}
              onClick={() => handleNotificationClick(n)}
              className={`flex items-start justify-between px-8 py-6 border-b cursor-pointer transition-all duration-300 relative group ${n.unread
                ? (darkMode ? "bg-green-900/5 hover:bg-green-900/10" : "bg-green-50/40 hover:bg-green-50/80")
                : (darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50/50")
                } ${darkMode ? "border-gray-800" : "border-gray-100"}`}
            >
              {n.unread && (
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-green-500 rounded-r-full" />
              )}

              <div className="flex-1 pr-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    n.category === 'invoice' ? 'bg-blue-100 text-blue-600' :
                    n.category === 'order' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {n.category || 'System'}
                  </span>
                  <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{n.title}</p>
                </div>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {n.message}
                </p>
                <div className="mt-2 opacity-40">
                  <span className="text-[10px] font-medium">{n.date || new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center h-full pt-1">
                {n.unread ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                ) : (
                  <CheckCircle size={16} className="text-gray-300" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredNotifications.length}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default NotificationsTab;
