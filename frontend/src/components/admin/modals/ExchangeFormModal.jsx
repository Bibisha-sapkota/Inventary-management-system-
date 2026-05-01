import React from "react";
import { Modal } from "../AdminUI";

const ExchangeFormModal = ({
  showExchangeForm,
  setShowExchangeForm,
  exchangeFormData,
  setExchangeFormData,
  handleSaveExchange,
  darkMode,
  products,
  labelClass,
  inputClass,
  invoices = [],
  suppliers = []
}) => {
  if (!showExchangeForm) return null;

  // Extract unique customer names from invoices
  const uniqueCustomerNames = Array.from(new Set(invoices.map(inv => inv.customer).filter(Boolean)));
  
  // Extract bill numbers for selected customer
  const suggestedBillNumbers = exchangeFormData.customerName 
    ? Array.from(new Set(invoices.filter(inv => inv.customer === exchangeFormData.customerName).map(inv => inv.invoiceId).filter(Boolean)))
    : [];

  return (
    <Modal
      title={exchangeFormData.type === "customer" ? "Customer Return/Exchange" : "Supplier Return/Exchange"}
      onClose={() => setShowExchangeForm(false)}
      onConfirm={handleSaveExchange}
      darkMode={darkMode}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Type</label>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                exchangeFormData.type === "customer"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50"
              }`}
              onClick={() => setExchangeFormData({ ...exchangeFormData, type: "customer" })}
            >
              Customer Return
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                exchangeFormData.type === "supplier"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50"
              }`}
              onClick={() => setExchangeFormData({ ...exchangeFormData, type: "supplier" })}
            >
              Supplier Return
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            {exchangeFormData.type === "customer" ? "Customer Name *" : "Supplier Name *"}
          </label>
          {exchangeFormData.type === "customer" ? (
            <>
              <input
                type="text"
                list="customerNames"
                className={inputClass}
                value={exchangeFormData.customerName || ''}
                onChange={(e) => setExchangeFormData({ ...exchangeFormData, customerName: e.target.value })}
                placeholder="Select or type Customer Name"
              />
              <datalist id="customerNames">
                {uniqueCustomerNames.map((name, i) => <option key={i} value={name} />)}
              </datalist>
              {suggestedBillNumbers.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Suggestion: Bill No is {suggestedBillNumbers.join(", ")}
                </p>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                list="supplierNames"
                className={inputClass}
                value={exchangeFormData.supplierName || ''}
                onChange={(e) => setExchangeFormData({ ...exchangeFormData, supplierName: e.target.value })}
                placeholder="Select or type Supplier Name"
              />
              <datalist id="supplierNames">
                {suppliers.map(sup => <option key={sup._id} value={sup.name} />)}
              </datalist>
            </>
          )}
        </div>

        <div>
          <label className={labelClass}>Returned Product *</label>
          <select
            className={inputClass}
            value={exchangeFormData.returnedProductId || ''}
            onChange={(e) => setExchangeFormData({ ...exchangeFormData, returnedProductId: e.target.value })}
          >
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} {p.productId ? `(ID: ${p.productId})` : ''} {p.batchNo ? `[Batch: ${p.batchNo}]` : ''}
              </option>
            ))}
          </select>
          {exchangeFormData.returnedProductId && (
            <p className="text-xs text-blue-500 mt-1">
              Suggestion: Product Batch No is {products.find(p => p._id === exchangeFormData.returnedProductId)?.batchNo || "N/A"}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Replacement/New Product *</label>
          <select
            className={inputClass}
            value={exchangeFormData.newProductId || ''}
            onChange={(e) => setExchangeFormData({ ...exchangeFormData, newProductId: e.target.value })}
          >
            <option value="">-- Select Product --</option>
            {products.filter(p => p.stock > 0).map(p => (
              <option key={p._id} value={p._id}>
                {p.name} {p.productId ? `(ID: ${p.productId})` : ''} {p.batchNo ? `[Batch: ${p.batchNo}]` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              className={inputClass}
              value={exchangeFormData.quantity || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, quantity: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={exchangeFormData.restocked}
                onChange={(e) => setExchangeFormData({ ...exchangeFormData, restocked: e.target.checked })}
              />
              <span className="text-xs font-bold opacity-70">Restock Item?</span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Reason for Exchange *</label>
          <select
            className={inputClass}
            value={exchangeFormData.reason || ''}
            onChange={(e) => setExchangeFormData({ ...exchangeFormData, reason: e.target.value })}
          >
            <option value="">-- Select Reason --</option>
            <option value="return">↩️ Customer Return / Exchange</option>
            <option value="defect">⚠️ Product Defect</option>
            <option value="damage">🔨 Damaged in Transit</option>
            <option value="loss">📦 Damage or Loss</option>
            <option value="other">Other / Miscellaneous</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Addl. Charge (Rs.)</label>
            <input
              type="number"
              className={inputClass}
              value={exchangeFormData.amountToPay || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, amountToPay: Math.max(0, parseFloat(e.target.value) || 0) })}
              min="0"
            />
          </div>
          <div>
            <label className={labelClass}>Refund (Rs.)</label>
            <input
              type="number"
              className={inputClass}
              value={exchangeFormData.amountToRefund || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, amountToRefund: Math.max(0, parseFloat(e.target.value) || 0) })}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Purchase Date</label>
            <input
              type="date"
              className={inputClass}
              value={exchangeFormData.purchaseDate ? new Date(exchangeFormData.purchaseDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, purchaseDate: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Batch No</label>
            <input
              type="text"
              className={inputClass}
              value={exchangeFormData.batchNo || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, batchNo: e.target.value })}
              placeholder="e.g. 2026-017"
            />
          </div>
          <div>
            <label className={labelClass}>Bill Number *</label>
            <input
              type="text"
              list="billNumbers"
              className={inputClass}
              value={exchangeFormData.billNumber || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, billNumber: e.target.value })}
              placeholder={suggestedBillNumbers.length > 0 ? "Select or type bill" : "e.g. INV-102"}
            />
            {suggestedBillNumbers.length > 0 && (
              <datalist id="billNumbers">
                {suggestedBillNumbers.map((bill, i) => <option key={i} value={bill} />)}
              </datalist>
            )}
          </div>
          <div>
            <label className={labelClass}>Membership ID</label>
            <input
              type="text"
              className={inputClass}
              value={exchangeFormData.membershipId || ''}
              onChange={(e) => setExchangeFormData({ ...exchangeFormData, membershipId: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExchangeFormModal;
