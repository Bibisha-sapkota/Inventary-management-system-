import React from "react";
import { Plus, Pencil, Trash2, Search, ShoppingBag, Calendar, User, Phone, Mail, ChevronRight, Hash, CheckCircle } from "lucide-react";
import { Pagination } from "./AdminUI";

const OrdersTab = ({
  orders,
  filteredOrders,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  statusColor,
  setShowOrderForm,
  setEditOrderId,
  setOrderFormData,
  handleEditOrder,
  handleDeleteOrder,
  handleInvoiceOrder,
  invoices,
  currentPage,
  onPageChange
}) => {
  const PAGE_SIZE = 10;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`${cardClass} rounded-3xl shadow-xl shadow-black/5 border-2 overflow-hidden animate-in fade-in duration-700`}>
      <div className="p-8 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent uppercase tracking-tight">Order Intelligence</h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.25em] mt-1">Lifecycle monitoring & transaction logistics</p>
          </div>

          <div className="flex flex-1 max-w-2xl items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search orders by customer, product, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all outline-none ${darkMode
                    ? "bg-gray-900/50 border-gray-700 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50"
                    : "bg-gray-50 border-gray-100 text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30"
                  }`}
              />
            </div>

            <button
              onClick={() => {
                setEditOrderId(null);
                setOrderFormData({
                  sno: `ORD-${String((orders.length || 0) + 1).padStart(4, "0")}`,
                  product: "",
                  customer: "",
                  email: "",
                  phone: "",
                  status: "Pending",
                  date: new Date().toISOString().split("T")[0],
                  amount: "",
                  quantity: 1
                });
                setShowOrderForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus size={16} /> New Order
            </button>
          </div>
        </div>

        <div className={`border-2 rounded-2xl overflow-hidden mb-6 ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`${darkMode ? "bg-gray-800/50 text-gray-200 border-gray-700" : "bg-gray-50 text-gray-700 border-gray-50"} font-black text-[10px] uppercase tracking-widest border-b-2`}>
                <th className="py-5 px-6">Ref / Date</th>
                <th className="py-5 px-6">Customer Engagement</th>
                <th className="py-5 px-6">Product / Summary</th>
                <th className="py-5 px-6">Total Amount</th>
                <th className="py-5 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    No matching orders found in your system.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o, i) => (
                  <tr
                    key={o._id || `order-${i}`}
                    className={`${darkMode
                        ? "hover:bg-blue-900/10 border-gray-700 text-gray-300"
                        : "hover:bg-blue-50/30 border-gray-50 text-gray-800"
                      } transition-all group`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <div className="font-black text-xs text-gray-900 uppercase tracking-wider">#{o.orderId || o.sno || o._id.slice(-6).toUpperCase()}</div>
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                            <Calendar size={10} /> {o.date}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-800">
                          <User size={12} className="text-blue-500 opacity-50" />
                          {o.customerName || o.customer || "Walk-in"}
                          {o.status === 'Invoiced' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-200">
                              Done
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                          {o.customerEmail || (o.customerId && o.customerId.email) ? (
                            <span className="flex items-center gap-1"><Mail size={10} /> {o.customerEmail || o.customerId.email}</span>
                          ) : null}
                          {o.customerPhone || (o.customerId && o.customerId.phone) ? (
                            <span className="flex items-center gap-1"><Phone size={10} /> {o.customerPhone || o.customerId.phone}</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-emerald-600 uppercase tracking-tight">{o.product}</span>
                        {(o.invoiceNumber || o.invoiceId) && (
                          <span className="text-[9px] opacity-40 font-bold mt-0.5 flex items-center gap-1 uppercase tracking-tighter">
                            <Hash size={10} /> REF: {o.invoiceNumber || o.invoiceId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-sm font-black text-emerald-600">
                        Rs. {o.totalPrice != null ? Number(o.totalPrice).toLocaleString() : (o.amount || "0")}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditOrder(o)}
                          className="p-2 rounded-xl hover:bg-orange-50 text-orange-500 transition-colors border border-transparent hover:border-orange-100"
                          title="Edit Order"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o._id)}
                          className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleInvoiceOrder(o)}
                          disabled={o.status === 'Invoiced'}
                          className={`p-2 rounded-xl transition-colors border border-transparent ${o.status === 'Invoiced' ? 'text-emerald-500 bg-emerald-50' : 'hover:bg-gray-100 text-gray-500 hover:border-gray-200'}`}
                          title={o.status === 'Invoiced' ? "Invoice Generated" : "Generate Invoice"}
                        >
                          {o.status === 'Invoiced' ? <CheckCircle size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredOrders.length}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        darkMode={darkMode}
      />
    </div>
  );
};

export default OrdersTab;
