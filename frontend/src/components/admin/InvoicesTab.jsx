import React from "react";
import { Plus, ChevronDown, Receipt, Scan, Eye, Download, Printer, Trash2, Search } from "lucide-react";
import { Pagination } from "./AdminUI";

const InvoicesTab = ({
  invoices,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  invoiceMenuOpen,
  setInvoiceMenuOpen,
  openAddInvoice,
  setShowScannerInvoice,
  handlePreviewInvoice,
  handleDownloadInvoice,
  handlePrintInvoice,
  handleDeleteInvoice,
  currentPage,
  onPageChange,
  userRole
}) => {
  const PAGE_SIZE = 10;
  const paginatedInvoices = invoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`${cardClass} rounded-2xl shadow-sm overflow-hidden`}>
      <div className="p-6 pb-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Financial Ledger</h2>
            <p className={`text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mt-1`}>
              {invoices.length} historical records authenticated
            </p>
          </div>

          <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search invoices by ID, customer, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-bold transition-all outline-none ${darkMode
                    ? "bg-gray-900/50 border-gray-700 text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                    : "bg-gray-50 border-gray-100 text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30"
                  }`}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setInvoiceMenuOpen(!invoiceMenuOpen)}
                className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 flex items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus size={16} />
                Actions
                <ChevronDown size={14} />
              </button>
              {invoiceMenuOpen && (
                <div className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border-2 z-30 overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <button
                    onClick={() => { openAddInvoice(); setInvoiceMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-5 py-4 text-xs font-black uppercase tracking-widest ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-50 text-gray-700"}`}
                  >
                    <Receipt size={16} className="text-emerald-500" /> Manual Invoice
                  </button>
                  <button
                    onClick={() => { setShowScannerInvoice(true); setInvoiceMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-5 py-4 text-xs font-black uppercase tracking-widest border-t-2 ${darkMode ? "hover:bg-gray-700 border-gray-700 text-gray-200" : "hover:bg-gray-50 border-gray-100 text-gray-700"}`}
                  >
                    <Scan size={16} className="text-emerald-600" /> Scan & Create
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 text-green-800 rounded-xl p-4 border border-green-100">
            <p className="text-xs uppercase font-semibold opacity-70">
              Total Invoices
            </p>
            <p className="text-2xl font-bold mt-1">
              {invoices.length}
            </p>
          </div>
          <div className="bg-green-50 text-green-800 rounded-xl p-4 border border-green-100">
            <p className="text-xs uppercase font-semibold opacity-70">
              Total Revenue
            </p>
            <p className="text-2xl font-bold mt-1">
              Rs.{" "}
              {invoices
                .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount || inv.amount || 0)), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 text-green-800 rounded-xl p-4 border border-green-100">
            <p className="text-xs uppercase font-semibold opacity-70">
              Avg. Invoice
            </p>
            <p className="text-2xl font-bold mt-1">
              Rs.{" "}
              {invoices.length
                ? (
                  invoices.reduce(
                    (sum, inv) => sum + (parseFloat(inv.totalAmount || inv.amount || 0)),
                    0
                  ) / invoices.length
                ).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>

        <div
          className={`border rounded-lg overflow-hidden mb-6 ${darkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${darkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                  } text-sm font-semibold uppercase`}
              >
                <th className="py-3 px-4 border">Invoice #</th>
                <th className="py-3 px-4 border">Customer</th>
                <th className="py-3 px-4 border">Date</th>
                <th className="py-3 px-4 border">Items</th>
                <th className="py-3 px-4 border">Amount</th>
                <th className="py-3 px-4 border text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((inv, idx) => (
                <tr
                  key={inv._id || `inv-${inv.invoiceId}-${idx}`}
                  className={`${darkMode
                      ? "hover:bg-gray-700 border-gray-700 text-gray-300"
                      : "hover:bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                >
                  <td className="py-3 px-4 border">
                    <button
                      onClick={() => handlePreviewInvoice(inv)}
                      className="text-green-500 font-bold text-sm hover:underline"
                    >
                      #{inv.invoiceId || inv._id}
                    </button>
                  </td>
                  <td className="py-3 px-4 border">
                    {inv.customer}
                  </td>
                  <td className="py-3 px-4 border">{inv.date}</td>
                  <td className="py-3 px-4 border">
                    {(inv.itemsList && inv.itemsList.length > 0)
                      ? inv.itemsList.reduce((sum, item) => sum + (item.qty || 0), 0)
                      : (inv.itemsCount || 0)} items
                  </td>
                  <td className="py-3 px-4 border">
                    Rs. {Number(inv.totalAmount || inv.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 border text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                      <button
                        className="hover:text-green-500"
                        onClick={() => handlePreviewInvoice(inv)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="hover:text-green-600"
                        onClick={() => handleDownloadInvoice(inv)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="hover:text-gray-700"
                        onClick={() => handlePrintInvoice(inv)}
                      >
                        <Printer size={16} />
                      </button>
                      {userRole === "superadmin" && (
                        <button
                          className="hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteInvoice(inv._id || inv.id || inv.invoiceId)}
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={invoices.length}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        darkMode={darkMode}
      />
    </div>
  );
};

export default InvoicesTab;
