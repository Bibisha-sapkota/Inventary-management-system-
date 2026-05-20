import React from "react";
import { Upload, Package, Pencil, Trash2 } from "lucide-react";
import { Pagination } from "./AdminUI";

const ProductCardsTab = ({
  filteredProducts,
  darkMode,
  cardClass,
  setShowCSVImportModal,
  openAddProduct,
  handleEditProduct,
  handleDeleteProduct,
  settings,
  lowStockThreshold,
  currentPage,
  onPageChange,
  userRole
}) => {
  const PAGE_SIZE = 12;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return (
    <div className={`${cardClass} rounded-2xl shadow-sm p-6 border-2`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Product View</h2>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-2">🎨 Visual Card Display</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCSVImportModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/30 flex items-center gap-2 transition border-2 border-emerald-600"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button
            onClick={openAddProduct}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/30 border-2 border-blue-600"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((p, i) => (
          <div
            key={p._id || `product-${(currentPage - 1) * PAGE_SIZE + i}`}
            className={`border-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group ${darkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-600/50"
              : "bg-white border-gray-200 hover:border-blue-400/60"
              }`}
          >
            {/* Product Image */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-48">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center`}
                >
                  <Package size={64} className="text-gray-400 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className={`absolute top-3 right-3 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase ${p.stock >= 100 ? 'bg-indigo-500' : p.stock > 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`}>
                {p.stock >= 100 ? 'High Stock' : p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock ⚠️'}
              </span>
              <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md ${p.status === "Active" ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gray-500"}`}>
                {p.status}
              </span>
            </div>

            {/* Product Info */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-black text-lg mb-1 truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">
                  {p.category}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {p.productId && (
                  <span
                    className={`text-xs font-mono px-2 py-1.5 rounded-lg font-bold ${darkMode ? "bg-blue-900/40 text-blue-300 border border-blue-700/50" : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                  >
                    ID: {p.productId}
                  </span>
                )}
                {p.batchNo && (
                  <span
                    className={`text-xs font-mono px-2 py-1.5 rounded-lg font-bold ${darkMode ? "bg-orange-900/40 text-orange-300 border border-orange-700/50" : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}
                  >
                    Batch: {p.batchNo}
                  </span>
                )}
              </div>

              {p.barcode && (
                <p
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg inline-block font-bold ${darkMode ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                >
                  {p.barcode}
                </p>
              )}

              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-[9px] uppercase font-black opacity-40 tracking-widest">Buy / Sell</p>
                  <p className="text-sm font-black flex items-center gap-1.5 mt-1">
                    <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Rs.{p.buyingPrice || 0}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Rs.{p.price}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black opacity-40 tracking-widest">In Stock</p>
                  <p
                    className={`text-lg font-black mt-1 ${p.stock <= 0
                      ? "text-red-500 animate-pulse"
                      : "text-gray-800 dark:text-gray-200"
                      }`}
                  >
                    {Math.max(0, p.stock)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEditProduct((currentPage - 1) * PAGE_SIZE + i)}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                >
                  <Pencil size={14} /> Edit
                </button>
                {userRole === 'superadmin' && (
                  <button
                    onClick={() => handleDeleteProduct(p._id || p.id)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default ProductCardsTab;
