import React from "react";
import { Plus, List, Grid, ShieldCheck, Ban, Pencil, Trash2, Search } from "lucide-react";

const CustomersTab = ({
  customers,
  searchTerm,
  setSearchTerm,
  customerStats,
  activeCustomersCount,
  blockedCustomersCount,
  totalCustomerSpent,
  customerViewMode,
  setCustomerViewMode,
  darkMode,
  cardClass,
  openAddCustomer,
  setSelectedCustomer,
  handleToggleCustomerStatus,
  handleEditCustomer,
  handleDeleteCustomer
}) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} rounded-2xl p-4 shadow-sm`}>
          <p className="text-xs uppercase font-semibold text-gray-400">
            Total Customers
          </p>
          <p className="text-2xl font-bold mt-1">
            {customers.length}
          </p>
        </div>
        <div className={`${cardClass} rounded-2xl p-4 shadow-sm`}>
          <p className="text-xs uppercase font-semibold text-gray-400">
            Active
          </p>
          <p className="text-2xl font-bold mt-1">
            {activeCustomersCount}
          </p>
        </div>
        <div className={`${cardClass} rounded-2xl p-4 shadow-sm`}>
          <p className="text-xs uppercase font-semibold text-gray-400">
            Blocked
          </p>
          <p className="text-2xl font-bold mt-1">
            {blockedCustomersCount}
          </p>
        </div>

      </div>

      {/* Customer List */}
      <div className={`${cardClass} rounded-2xl p-6 shadow-sm`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Customers</h2>
          </div>

          <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search customers by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-bold transition-all outline-none ${
                  darkMode 
                    ? "bg-gray-900/50 border-gray-700 text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50" 
                    : "bg-gray-50 border-gray-100 text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30"
                }`}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openAddCustomer}
                className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus size={16} /> New Profile
              </button>

              <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl">
                <button
                  onClick={() => setCustomerViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${customerViewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setCustomerViewMode("cards")}
                  className={`p-2 rounded-lg transition-all ${customerViewMode === 'cards' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Card View"
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {customerViewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 italic">
                No customers found matching your criteria.
              </div>
            ) : (
              customers.map((c, idx) => (
                <div
                  key={c.id || c._id || `cust-${idx}`}
                  className={`relative group ${darkMode ? 'bg-gray-850' : 'bg-gray-50'} rounded-2xl p-5 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} hover:shadow-xl hover:border-green-500/50 transition-all cursor-pointer`}
                  onClick={() => setSelectedCustomer(c)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{c.name}
                          {c.fromOrders && (
                            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 align-middle">
                              From Orders
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">Joined {c.joined}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${c.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="opacity-70">📧</span>
                      <span className="truncate">{c.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="opacity-70">📞</span>
                      <span>{c.phone || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-center p-2 rounded-xl bg-green-500/5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Orders</p>
                      <p className="font-bold text-lg">{c.totalOrders}</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-green-500/5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total Spent</p>
                      <p className="font-bold text-lg text-green-600">Rs {c.totalSpent.toFixed(0)}</p>
                    </div>
                  </div>


                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleCustomerStatus(c); }}
                      className={`p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow transition-colors ${c.status === 'blocked' ? 'text-green-500 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                      title={c.status === 'blocked' ? "Unblock Customer" : "Block Customer"}
                    >
                      {c.status === 'blocked' ? <ShieldCheck size={14} /> : <Ban size={14} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditCustomer(c); }}
                      className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow hover:text-green-600 transition-colors"
                      title="Edit Customer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id || c._id); }}
                      className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow hover:text-red-500 transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div
            className={`border rounded-lg overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"
              }`}
          >
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr
                  className={`text-xs uppercase ${darkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                    }`}
                >
                  <th className="py-3 px-4 border text-center">S.No</th>
                  <th className="py-3 px-4 border">Name</th>
                  <th className="py-3 px-4 border">Email</th>
                  <th className="py-3 px-4 border">Phone</th>
                  <th className="py-3 px-4 border">Status</th>
                  <th className="py-3 px-4 border text-right">
                    Orders
                  </th>
                  <th className="py-3 px-4 border text-right">
                    Total Spent
                  </th>

                  <th className="py-3 px-4 border text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 px-4 text-center text-xs text-gray-400"
                    >
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => (
                    <tr
                      key={c.id || c._id || `row-${idx}`}
                      className={
                        darkMode
                          ? "border-t border-gray-700 hover:bg-gray-800"
                          : "border-t border-gray-200 hover:bg-gray-50"
                      }
                    >
                      <td className="py-3 px-4 border text-center text-xs font-bold text-green-600">
                        {c.sno || idx + 1}
                      </td>
                      <td className="py-3 px-4 border font-semibold">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="hover:text-green-600 transition-colors flex items-center gap-2"
                        >
                          {c.name}
                          {c.fromOrders && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                              Guest
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 border text-gray-500">
                        {c.email || "—"}
                      </td>
                      <td className="py-3 px-4 border text-gray-500">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3 px-4 border">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${c.status === "blocked"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                            }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border text-right font-mono">
                        {c.totalOrders}
                      </td>
                      <td className="py-3 px-4 border text-right font-bold text-green-600">
                        Rs. {c.totalSpent.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 border text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleCustomerStatus(c)}
                            className={`p-1 rounded-md ${c.status === "blocked"
                              ? "text-green-600 hover:bg-green-50"
                              : "text-amber-500 hover:bg-amber-50"
                              }`}
                            title={
                              c.status === "blocked"
                                ? "Unblock"
                                : "Block"
                            }
                          >
                            {c.status === "blocked" ? (
                              <ShieldCheck size={16} />
                            ) : (
                              <Ban size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditCustomer(c)}
                            className="text-blue-500 hover:bg-blue-50 p-1 rounded-md"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.id || c._id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersTab;
