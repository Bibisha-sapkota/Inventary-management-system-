import React from "react";
import { Clock, RefreshCw, Search, History, Receipt, Package, ShoppingCart, User, Activity } from "lucide-react";
import { Pagination } from "./AdminUI";

const HistoryTab = ({
  historyLogs,
  historySearch,
  setHistorySearch,
  historyFilter,
  setHistoryFilter,
  fetchHistoryLogs,
  groupLogsByDate,
  loading,
  darkMode,
  cardClass,
  currentPage,
  onPageChange
}) => {
  const PAGE_SIZE = 10;
  const filteredLogs = historyLogs.filter(log => {
    const matchesSearch =
      (log.title || "").toLowerCase().includes(historySearch.toLowerCase()) ||
      (log.detail || "").toLowerCase().includes(historySearch.toLowerCase());
    const matchesFilter = historyFilter === 'all' || (log.type || "").toLowerCase() === historyFilter;
    return matchesSearch && matchesFilter;
  });

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Audit Trail</h2>
          <p className="text-sm opacity-50 font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> System Activity Logs
          </p>
        </div>
        <button
          onClick={fetchHistoryLogs}
          className={`p-2.5 rounded-xl transition-all ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 border border-gray-100 shadow-sm"
            }`}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Tabs */}
      <div className={`${cardClass} p-4 rounded-2xl space-y-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search history..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${darkMode ? "bg-gray-900 border-gray-700 focus:border-green-500" : "bg-gray-50 border-gray-200 focus:border-green-500 shadow-inner"
              }`}
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All History' },
            { id: 'product', label: 'Products' },
            { id: 'order', label: 'Orders' },
            { id: 'customer', label: 'Customers' },
            { id: 'invoice', label: 'Invoices' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHistoryFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${historyFilter === tab.id
                ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                : darkMode
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 shadow-sm"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className={`${cardClass} rounded-2xl p-20 text-center border-dashed border-2`}>
          <History className="mx-auto mb-6 opacity-5" size={100} />
          <h3 className="text-xl font-bold opacity-30 uppercase tracking-tighter">No Logs Found</h3>
          <p className="opacity-20 text-sm max-w-xs mx-auto mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        groupLogsByDate(paginatedLogs).map(([groupKey, logs]) => (
          <div key={groupKey} className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">{groupKey}</span>
              <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="flex flex-col gap-3">
              {logs.map((log, lIdx) => (
                <div
                  key={log.id || log._id || `log-${lIdx}`}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${darkMode
                    ? "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-green-500/30"
                    : "bg-white border-gray-100 hover:shadow-xl hover:shadow-green-500/5 hover:border-green-500/20 shadow-sm"
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${log.type === 'invoice' ? 'bg-orange-500/10 text-orange-500' :
                    log.type === 'product' ? 'bg-green-500/10 text-green-600' :
                      log.type === 'order' ? 'bg-green-500/10 text-green-500' :
                        log.type === 'customer' ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                    {log.type === 'invoice' ? <Receipt size={22} /> :
                      log.type === 'product' ? <Package size={22} /> :
                        log.type === 'order' ? <ShoppingCart size={22} /> :
                          log.type === 'customer' ? <User size={22} /> : <Activity size={22} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className={`font-bold text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {log.title}
                      </h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded self-start sm:self-auto ${log.type === 'invoice' ? 'text-orange-500 bg-orange-500/10' :
                        log.type === 'product' ? 'text-green-600 bg-green-500/10' :
                          log.type === 'order' ? 'text-green-500 bg-green-500/10' :
                            log.type === 'customer' ? 'text-red-600 bg-red-500/10' : 'text-gray-500 bg-gray-500/10'
                        }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium opacity-60 truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {log.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold opacity-30 uppercase tracking-tight">
                        {log.date && !isNaN(new Date(log.date)) ? new Date(log.date).toISOString().split('T')[0] : "Unknown Date"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredLogs.length}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        darkMode={darkMode}
      />
    </div>
  );
};

export default HistoryTab;
