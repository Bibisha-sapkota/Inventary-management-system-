import React from "react";
import { Modal } from "../AdminUI";
import ProductImageUpload from "../ProductImageUpload";

const ProductFormModal = ({
  showProductForm,
  setShowProductForm,
  productFormData,
  setProductFormData,
  handleSaveProduct,
  darkMode,
  suppliers,
  products,
  labelClass,
  inputClass
}) => {
  if (!showProductForm) return null;

  return (
    <Modal
      title={productFormData._id ? "Edit Product" : "Add Product"}
      onClose={() => setShowProductForm(false)}
      onConfirm={handleSaveProduct}
      darkMode={darkMode}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-200/50 dark:border-blue-700/30">
          <label className={labelClass}>S.No (Product Number)</label>
          <input
            type="text"
            className={`${inputClass} !rounded-xl !border-2 !border-blue-300 dark:!border-blue-700`}
            value={productFormData.sno || ""}
            onChange={(e) =>
              setProductFormData((prev) => ({
                ...prev,
                sno: e.target.value,
              }))
            }
            placeholder={`e.g. PROD-${String((products.length || 0) + 1).padStart(4, "0")}`}
          />
        </div>

        <ProductImageUpload
          image={productFormData.image}
          onImageChange={(img) =>
            setProductFormData((prev) => ({ ...prev, image: img }))
          }
          darkMode={darkMode}
        />

        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-2 border-emerald-200/50 dark:border-emerald-700/30">
          <label className={labelClass}>Product Name *</label>
          <input
            type="text"
            className={`${inputClass} !rounded-xl !border-2 !border-emerald-300 dark:!border-emerald-700 font-semibold`}
            value={productFormData.name}
            onChange={(e) =>
              setProductFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-2 border-purple-200/50 dark:border-purple-700/30">
            <label className={labelClass}>Product ID</label>
            <input
              type="text"
              className={`${inputClass} !rounded-xl !border-2 !border-purple-300 dark:!border-purple-700`}
              value={productFormData.productId || ""}
              onChange={(e) => setProductFormData({ ...productFormData, productId: e.target.value })}
              placeholder="e.g. PRD-001"
            />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-2 border-orange-200/50 dark:border-orange-700/30">
            <label className={labelClass}>Batch No</label>
            <input
              type="text"
              className={`${inputClass} !rounded-xl !border-2 !border-orange-300 dark:!border-orange-700`}
              value={productFormData.batchNo || ""}
              onChange={(e) => setProductFormData({ ...productFormData, batchNo: e.target.value })}
              placeholder="e.g. BATCH-2026"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-2 border-red-200/50 dark:border-red-700/30">
          <label className={labelClass}>Barcode</label>
          <input
            type="text"
            className={`${inputClass} !rounded-xl !border-2 !border-red-300 dark:!border-red-700 font-mono`}
            value={productFormData.barcode || ""}
            onChange={(e) => setProductFormData({ ...productFormData, barcode: e.target.value })}
            placeholder="Enter barcode..."
          />
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 border-2 border-indigo-200/50 dark:border-indigo-700/30">
          <label className={labelClass}>Category</label>
          <select
            className={`${inputClass} !rounded-xl !border-2 !border-indigo-300 dark:!border-indigo-700 font-semibold`}
            value={productFormData.category}
            onChange={(e) =>
              setProductFormData((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
          >
            <option value="General">🏷️ General</option>
            <option value="Produce">🥕 Produce</option>
            <option value="Dairy">🥛 Dairy</option>
            <option value="Bakery">🍞 Bakery</option>
            <option value="Grains">🌾 Grains</option>
            <option value="Grocery">🛒 Grocery</option>
            <option value="Meat">🥩 Meat</option>
            <option value="Beverages">🥤 Beverages</option>
            <option value="Snacks">🍪 Snacks</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-2 border-red-200/50 dark:border-red-700/30">
            <label className={`${labelClass} !text-red-700 dark:!text-red-400`}>Buying Price</label>
            <input
              type="number"
              className={`${inputClass} !rounded-xl !border-2 !border-red-300 dark:!border-red-700 text-red-700 dark:text-red-400 font-bold`}
              value={productFormData.buyingPrice}
              onChange={(e) =>
                setProductFormData((prev) => ({
                  ...prev,
                  buyingPrice: Math.max(0, Number(e.target.value)),
                }))
              }
              min="0"
              placeholder="Rs."
            />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-2 border-green-200/50 dark:border-green-700/30">
            <label className={`${labelClass} !text-green-700 dark:!text-green-400`}>Selling Price</label>
            <input
              type="number"
              className={`${inputClass} !rounded-xl !border-2 !border-green-300 dark:!border-green-700 text-green-700 dark:text-green-400 font-bold`}
              value={productFormData.price}
              onChange={(e) =>
                setProductFormData((prev) => ({
                  ...prev,
                  price: Math.max(0, Number(e.target.value)),
                }))
              }
              min="0"
              placeholder="Rs."
            />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-200/50 dark:border-blue-700/30">
            <label className={`${labelClass} !text-blue-700 dark:!text-blue-400`}>Stock</label>
            <input
              type="number"
              className={`${inputClass} !rounded-xl !border-2 !border-blue-300 dark:!border-blue-700 text-blue-700 dark:text-blue-400 font-bold`}
              value={productFormData.stock}
              onChange={(e) =>
                setProductFormData((prev) => ({
                  ...prev,
                  stock: Math.max(0, Number(e.target.value)),
                }))
              }
              min="0"
              placeholder="Units"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 border-2 border-pink-200/50 dark:border-pink-700/30">
            <label className={labelClass}>Expiry Date</label>
            <input
              type="date"
              className={`${inputClass} !rounded-xl !border-2 !border-pink-300 dark:!border-pink-700`}
              value={productFormData.expiryDate ? productFormData.expiryDate.substring(0, 10) : ""}
              onChange={(e) =>
                setProductFormData((prev) => ({
                  ...prev,
                  expiryDate: e.target.value,
                }))
              }
            />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 border-2 border-teal-200/50 dark:border-teal-700/30">
            <label className={labelClass}>Alert Threshold</label>
            <input
              type="number"
              className={`${inputClass} !rounded-xl !border-2 !border-teal-300 dark:!border-teal-700`}
              value={productFormData.maxStock}
              onChange={(e) =>
                setProductFormData((prev) => ({
                  ...prev,
                  maxStock: Math.max(0, Number(e.target.value)),
                }))
              }
              min="0"
              placeholder="Units"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10 border-2 border-cyan-200/50 dark:border-cyan-700/30">
          <label className={labelClass}>Status</label>
          <select
            className={`${inputClass} !rounded-xl !border-2 !border-cyan-300 dark:!border-cyan-700 font-semibold`}
            value={productFormData.status}
            onChange={(e) =>
              setProductFormData((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
          >
            <option value="Active">Active</option>
            <option value="Unactive">Unactive</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Supplier (optional)</label>
          <select
            className={inputClass}
            value={productFormData.supplier || ""}
            onChange={(e) => {
              const chosen = suppliers.find(s => s._id === e.target.value);
              setProductFormData(prev => ({
                ...prev,
                supplier: e.target.value || null,
                supplierName: chosen ? chosen.name : "",
              }));
            }}
          >
            <option value="">-- No Supplier --</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default ProductFormModal;
