import React from "react";
import { Plus, RotateCcw, Calendar, CheckCircle, AlertCircle, ArrowRight, Edit2, Trash2, Search } from "lucide-react";

const ExchangesTab = ({
  exchanges,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  setShowExchangeForm,
  setExchangeFormData,
  handleDeleteExchange,
  triggerToast
}) => {
  return (
    <div className="space-y-8 pb-8">
      {/* Premium Header */}
      <div className={`${cardClass} rounded-3xl p-8 border-t-4 border-green-500 shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl -z-0" />

        <div className="flex justify-between items-start gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg">
                ⚡
              </div>
              <h2 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                Smart Exchanges
              </h2>
            </div>
            <p className={`text-sm font-medium mt-3 max-w-2xl leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Effortlessly manage product exchanges and returns. Our intelligent system helps you track every swap with precision and care for your customers.
            </p>
          </div>
          <button
            onClick={() => setShowExchangeForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-7 py-4 rounded-2xl font-bold shadow-xl shadow-green-500/25 transition-all hover:shadow-2xl hover:shadow-green-500/35 hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Log Exchange</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl mx-auto w-full">
        <Search
          className={`absolute left-5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-all z-10 ${darkMode ? "text-gray-400 group-focus-within:text-green-500" : "text-gray-500 group-focus-within:text-green-600"}`}
          size={20}
        />
        <input
          type="text"
          placeholder="Search by customer, product, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-14 pr-6 py-4 rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-green-500/10 w-full shadow-lg transition-all ${darkMode
            ? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600 focus:border-green-500/50"
            : "bg-white border-gray-100 text-gray-800 placeholder:text-gray-400 focus:border-green-600/30 shadow-green-500/5"
            }`}
        />
      </div>

      {/* KPI Cards */}
      {exchanges.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Card */}
          <div className={`${cardClass} rounded-2xl p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl font-black p-2 rounded-lg ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                📊
              </span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Total Exchanges
            </p>
            <p className="text-3xl font-black mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {exchanges.length}
            </p>
            <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              All transactions tracked
            </p>
          </div>

          {/* Restocked Card */}
          <div className={`${cardClass} rounded-2xl p-6 border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl font-black p-2 rounded-lg ${darkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                ✅
              </span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Restocked Items
            </p>
            <p className="text-3xl font-black mt-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {exchanges.filter(e => e.restocked).length}
            </p>
            <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Back in inventory
            </p>
          </div>

          {/* Damaged Card */}
          <div className={`${cardClass} rounded-2xl p-6 border-l-4 border-orange-500 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl font-black p-2 rounded-lg ${darkMode ? "bg-orange-500/20" : "bg-orange-100"}`}>
                ⚠️
              </span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Damaged/Lost
            </p>
            <p className="text-3xl font-black mt-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {exchanges.filter(e => !e.restocked).length}
            </p>
            <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Awaiting write-off
            </p>
          </div>

          {/* Success Rate Card */}
          <div className={`${cardClass} rounded-2xl p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl font-black p-2 rounded-lg ${darkMode ? "bg-purple-500/20" : "bg-purple-100"}`}>
                📈
              </span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Success Rate
            </p>
            <p className="text-3xl font-black mt-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {exchanges.length > 0 ? Math.round((exchanges.filter(e => e.restocked).length / exchanges.length) * 100) : 0}%
            </p>
            <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Restock completion
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {exchanges.length === 0 ? (
        <div className={`${cardClass} rounded-3xl p-20 text-center border-2 border-dashed ${darkMode ? "border-gray-700" : "border-gray-200"} relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-6">
              <RotateCcw size={40} className="text-green-500 opacity-60" />
            </div>
            <h3 className={`text-2xl font-black tracking-tight mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              No Exchanges Yet
            </h3>
            <p className={`text-base mb-8 max-w-md mx-auto ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Ready to log your first exchange? Create a new record to get started with our smart exchange management system.
            </p>
            <button
              onClick={() => setShowExchangeForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-500/25 inline-flex items-center gap-2 hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus size={20} /> Create First Exchange
            </button>
          </div>
        </div>
      ) : (
        /* Exchanges List */
        <div className="space-y-5">
          {exchanges.map((ex, idx) => (
            <div
              key={ex._id}
              className={`${cardClass} rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl border-l-4 group ${ex.restocked
                ? `border-l-green-500 ${darkMode ? "hover:bg-green-900/10" : "hover:bg-green-50/50"}`
                : `border-l-orange-500 ${darkMode ? "hover:bg-orange-900/10" : "hover:bg-orange-50/50"}`
                }`}
              style={{
                animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`
              }}
            >
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

              <div className="flex flex-col gap-5">
                {/* Top Row: Customer & Quick Status */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md transition-transform group-hover:scale-110 ${ex.restocked ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-orange-500 to-red-600"
                      }`}>
                      {ex.customerName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {ex.customerName}
                      </h3>
                      <p className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <Calendar size={14} />
                        {new Date(ex.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <span className="opacity-40">•</span>
                        <span className="opacity-60">{new Date(ex.date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all w-fit ${ex.restocked
                    ? darkMode
                      ? "bg-green-900/30 text-green-300 border border-green-500/30"
                      : "bg-green-100 text-green-700 border border-green-200"
                    : darkMode
                      ? "bg-orange-900/30 text-orange-300 border border-orange-500/30"
                      : "bg-orange-100 text-orange-700 border border-orange-200"
                    }`}>
                    {ex.restocked ? (
                      <>
                        <CheckCircle size={16} /> Restocked
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} /> Damaged/Lost
                      </>
                    )}
                  </div>
                </div>

                {/* Swap Flow */}
                <div className={`rounded-2xl p-5 ${darkMode ? "bg-gray-900/50 border border-gray-700" : "bg-gradient-to-r from-gray-50 to-white border border-gray-200"}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Product Swap Flow
                  </p>
                  <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
                    {/* Returned */}
                    <div className="flex-1 min-w-max">
                      <div className={`text-xs font-bold mb-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>↪️ Returned</div>
                      <div className={`px-4 py-3 rounded-xl border ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                        <p className={`font-bold text-sm line-through opacity-70 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {ex.returnedProduct?.name || "—"}
                        </p>
                        <p className="text-[9px] font-black opacity-30 mt-0.5">ID: {ex.returnedProduct?.productId || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center">
                      <ArrowRight size={24} className={ex.restocked ? "text-green-500" : "text-orange-500"} />
                      <span className={`text-xs font-black px-3 py-1 rounded-lg mt-2 ${ex.restocked
                        ? darkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700"
                        : darkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"
                        }`}>
                        ×{ex.quantity}
                      </span>
                    </div>

                    {/* New */}
                    <div className="flex-1 min-w-max">
                      <div className={`text-xs font-bold mb-2 ${darkMode ? "text-green-400" : "text-green-600"}`}>↙️ New Item</div>
                      <div className={`px-4 py-3 rounded-xl border ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                        <p className={`font-bold text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                          {ex.newProduct?.name || "—"}
                        </p>
                        <p className="text-[9px] font-black opacity-30 mt-0.5">ID: {ex.newProduct?.productId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Reason Badge */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Reason
                    </p>
                    <div className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-block ${ex.reason === "damage"
                      ? darkMode
                        ? "bg-red-900/30 text-red-300 border border-red-500/30"
                        : "bg-red-100 text-red-700 border border-red-200"
                      : ex.reason === "defect"
                        ? darkMode
                          ? "bg-yellow-900/30 text-yellow-300 border border-yellow-500/30"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : darkMode
                          ? "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                          : "bg-purple-100 text-purple-700 border border-purple-200"
                      }`}>
                      {ex.reason === "damage" && "🔨 Damaged in Transit"}
                      {ex.reason === "defect" && "⚠️ Product Defect"}
                      {ex.reason === "return" && "↩️ Customer Return"}
                      {ex.reason === "loss" && "📦 Damage or Loss"}
                      {!["damage", "defect", "return", "loss"].includes(ex.reason) && ex.reason}
                    </div>
                  </div>
                  <div className={`text-right text-xs opacity-50 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    ID: {ex._id?.slice(-8).toUpperCase()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: darkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(229, 231, 235, 1)" }}>
                  <button
                    onClick={() => {
                      setExchangeFormData({
                        type: ex.type || 'customer',
                        customerName: ex.customerName || '',
                        supplierName: ex.supplierName || '',
                        returnedProductId: ex.returnedProductId || '',
                        newProductId: ex.newProductId || '',
                        quantity: ex.quantity || 1,
                        restocked: ex.restocked || false,
                        reason: ex.reason || '',
                        amountToPay: ex.amountToPay || 0,
                        amountToRefund: ex.amountToRefund || 0,
                        exchangeId: ex._id
                      });
                      setShowExchangeForm(true);
                    }}
                    className={`p-2.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${darkMode
                      ? "bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 border border-blue-500/30"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                      }`}
                    title="Edit this exchange record"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExchange(ex._id)}
                    className={`p-2.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${darkMode
                      ? "bg-red-900/20 text-red-300 hover:bg-red-900/40 border border-red-500/30"
                      : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                      }`}
                    title="Delete this exchange record"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExchangesTab;
