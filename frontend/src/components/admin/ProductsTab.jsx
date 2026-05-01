import React from "react";
import { Download, Upload, Plus, Image as ImageIcon, Pencil, Trash2, Search } from "lucide-react";
import { Pagination } from "./AdminUI";

const ProductsTab = ({
  filteredProducts,
  searchTerm,
  setSearchTerm,
  darkMode,
  cardClass,
  handleExportCSV,
  setShowCSVImportModal,
  openAddProduct,
  handleEditProduct,
  handleDeleteProduct,
  settings,
  lowStockThreshold,
  currentPage,
  onPageChange
}) => {
  const PAGE_SIZE = 10;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`${cardClass} rounded-2xl shadow-sm border-2 overflow-hidden`}>
      <div className="p-8 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-tight">Inventory Catalog</h2>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.25em]">Centralized SKU management & lifecycle control</p>
          </div>

          <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search products by name, category, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all outline-none ${darkMode
                    ? "bg-gray-900/50 border-gray-700 text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                    : "bg-gray-50 border-gray-100 text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30"
                  }`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className={`px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition border-2 ${darkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600 shadow-lg shadow-black/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                  }`}
                title="Export to CSV"
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={() => setShowCSVImportModal(true)}
                className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 flex items-center gap-2 transition shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                <Upload size={16} /> Import
              </button>
              <button
                onClick={openAddProduct}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 flex items-center gap-2 transition shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <Plus size={16} /> New SKU
              </button>
            </div>
          </div>
        </div>

        <div
          className={`border-2 rounded-2xl overflow-hidden mb-6 ${darkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${darkMode
                    ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700"
                  } font-bold text-sm uppercase`}
              >
                <th className="py-4 px-4 border-b-2">Image</th>
                <th className="py-4 px-4 border-b-2">Product</th>
                <th className="py-4 px-4 border-b-2">Product ID</th>
                <th className="py-4 px-4 border-b-2">Batch No</th>
                <th className="py-4 px-4 border-b-2">Barcode</th>
                <th className="py-4 px-4 border-b-2 text-red-500">Buy Price</th>
                <th className="py-4 px-4 border-b-2 text-green-600">MRP</th>
                <th className="py-4 px-4 border-b-2">Stock</th>
                <th className="py-4 px-4 border-b-2 text-center">Status</th>
                <th className="py-4 px-4 border-b-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p, i) => (
                <tr
                  key={i}
                  className={`${darkMode
                      ? "hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 border-gray-700 text-gray-300"
                      : "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 border-gray-200 text-gray-800"
                    } border-b transition-all`}
                >
                  <td className="py-4 px-4 border-r">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                      >
                        <ImageIcon
                          size={20}
                          className="text-gray-400"
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 border-r">
                    <div className="flex flex-col">
                      <span className="font-black text-sm tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent uppercase">{p.name || "Unnamed Product"}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-0.5">
                        {p.category || "Uncategorized"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r">
                    <span
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg font-bold ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {p.productId || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-r">
                    <span
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg font-bold ${darkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {p.batchNo || "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-r">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${darkMode ? "bg-green-900/40 text-green-300 border border-green-700/50" : "bg-green-100 text-green-700 border border-green-300"
                        }`}
                    >
                      {p.barcode || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-r font-bold text-red-500 text-sm">
                    Rs. {p.buyingPrice || 0}
                  </td>
                  <td className="py-4 px-4 border-r font-bold text-green-600 text-sm">
                    Rs. {p.price}
                  </td>
                  <td
                    className={`py-4 px-4 border-r font-semibold text-sm ${p.stock <= 0 ? "text-red-500" : p.stock <= (settings?.lowStockThreshold || 5) ? "text-orange-500" : "text-green-600"}`}
                  >
                    {p.stock}
                    {p.stock <= 0 ? (
                      <span className="ml-2 text-[10px] font-black bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 uppercase">
                        Out of Stock
                      </span>
                    ) : p.stock <= (settings?.lowStockThreshold || 5) ? (
                      <span className="ml-2 text-[10px] font-black bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
                        Low Stock
                      </span>
                    ) : p.stock >= 100 ? (
                      <span className="ml-2 text-[10px] font-black bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase">
                        High Stock
                      </span>
                    ) : null}
                  </td>
                  <td className="py-4 px-4 border-r text-center">
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-md ${p.status === "Active"
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                        : "bg-gray-400 text-white"
                      }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditProduct(i)}
                        className="hover:text-orange-500 hover:bg-orange-500/10 p-2 rounded-lg transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id || p.id)}
                        className="hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
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
        totalItems={filteredProducts.length}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        darkMode={darkMode}
      />
    </div>
  );
};

export default ProductsTab;
