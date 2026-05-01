import { Bell, CheckCircle, Search } from "lucide-react";

const NotificationsTab = ({
  notifications,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  settings,
  handleMarkAllNotificationsRead,
  handleNotificationClick
}) => {
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
              placeholder="Search alerts by title, message, or category..."
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
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600 shadow-black/20"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Clear All Alerts
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border ${darkMode ? "border-gray-700" : "border-gray-100"} overflow-hidden`}>
        {notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="mx-auto mb-4 opacity-10" size={64} />
            <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Your history is clear</p>
            <p className="text-sm opacity-50 mt-2">No notifications found in your logs.</p>
          </div>
        ) : (
          notifications.map((n, index) => (
            <div
              key={n.id}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleNotificationClick(n)}
              className={`flex items-start justify-between px-8 py-6 border-b cursor-pointer transition-all duration-300 relative group animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${n.unread
                ? (darkMode ? "bg-green-900/5 hover:bg-green-900/10" : "bg-green-50/40 hover:bg-green-50/80")
                : (darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50/50")
                } ${darkMode ? "border-gray-800" : "border-gray-100"} hover:translate-x-1`}
            >
              {n.unread && (
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-green-500 rounded-r-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              )}

              <div className="flex-1 pr-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    n.category === 'invoice' ? 'bg-blue-100 text-blue-600' :
                    n.category === 'order' ? 'bg-emerald-100 text-emerald-600' :
                    n.category === 'customer' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {n.category || 'System'}
                  </span>
                  <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{n.title}</p>
                </div>
                
                <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {n.message}
                </p>

                <div className="flex items-center gap-2 mt-3 opacity-40">
                  <span className="text-[10px] font-medium tracking-tight italic">{n.date}</span>
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
    </div>
  );
};

export default NotificationsTab;
