import React from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

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
  handleDeleteOrder
}) => {
  return (
    <div className={`${cardClass} rounded-2xl shadow-sm p-8`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Order Intelligence</h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-1">Lifecycle monitoring & transaction logs</p>
        </div>

        <div className="flex flex-1 max-w-xl items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search orders by customer, product, or status..."
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
                amount: ""
              });
              setShowOrderForm(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 flex items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Create New Order
          </button>
        </div>
      </div>

      <div
        className={`border rounded-lg overflow-x-auto ${darkMode ? "border-gray-700" : "border-gray-200"
          }`}
      >
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr
              className={`${darkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
                } font-bold text-sm uppercase`}
            >
              <th className="py-4 px-4 border">S.No</th>
              <th className="py-4 px-4 border">Customer</th>
              <th className="py-4 px-4 border">Email</th>
              <th className="py-4 px-4 border">Phone</th>
              <th className="py-4 px-4 border">Product / Summary</th>
              <th className="py-4 px-4 border text-center">Status</th>
              <th className="py-4 px-4 border">Date</th>
              <th className="py-4 px-4 border">Amount (Rs.)</th>
              <th className="py-4 px-4 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-gray-400">
                  No orders yet.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o, i) => (
                <tr
                  key={o._id || `order-${i}`}
                  className={`${darkMode
                    ? "hover:bg-gray-700 border-gray-700 text-gray-300"
                    : "hover:bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                >
                  <td className="py-4 px-4 border text-sm">{i + 1}</td>
                  <td className="py-4 px-4 border font-semibold text-sm">
                    {o.customerName || "—"}
                  </td>
                  <td className="py-4 px-4 border text-sm">
                    {o.customerEmail || (o.customerId && o.customerId.email) ? (
                      <span className="text-green-600">{o.customerEmail || o.customerId.email}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 border text-sm">
                    {o.customerPhone || (o.customerId && o.customerId.phone) || <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="py-4 px-4 border">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-green-600 uppercase tracking-tight">{o.product}</span>
                      {(o.invoiceNumber || o.invoiceId) && (
                        <span className="text-[10px] opacity-40 font-bold mt-0.5">
                          REF: {o.invoiceNumber || o.invoiceId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 border text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[o.status] || "bg-gray-100"
                        }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 border text-sm">{o.date}</td>
                  <td className="py-4 px-4 border text-sm font-semibold">
                    {o.totalPrice != null ? `Rs. ${Number(o.totalPrice).toFixed(2)}` : (o.amount || "—")}
                  </td>
                  <td className="py-4 px-4 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditOrder(o)}
                        className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                        title="Edit Order"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(o._id)}
                        className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm"
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
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
  );
};

export default OrdersTab;
