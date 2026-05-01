import React from "react";
import { Modal } from "../AdminUI";

const ManualInvoiceModal = ({
  showInvoiceForm,
  setShowInvoiceForm,
  handleSaveInvoice,
  darkMode,
  invoiceFormData,
  setInvoiceFormData,
  customers,
  products,
  invoiceTotals,
  labelClass,
  inputClass
}) => {
  if (!showInvoiceForm) return null;

  return (
    <Modal
      title="Create Manual Invoice"
      onClose={() => setShowInvoiceForm(false)}
      onConfirm={handleSaveInvoice}
      darkMode={darkMode}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Invoice Number</label>
            <input
              type="text"
              className={inputClass}
              value={invoiceFormData.sno}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, sno: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              className={inputClass}
              value={invoiceFormData.date}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Customer Name</label>
            <input
              type="text"
              list="customer-list-invoice"
              className={inputClass}
              value={invoiceFormData.customer}
              placeholder="Search or Enter Name"
              onChange={(e) => {
                const val = e.target.value;
                const found = customers.find(c => c.name === val);
                setInvoiceFormData(prev => ({
                  ...prev,
                  customer: val,
                  membershipId: found ? (found.id || found.sno || "") : prev.membershipId
                }));
              }}
            />
            <datalist id="customer-list-invoice">
              {customers.map(c => (
                <option key={c._id || c.id} value={c.name}>
                  {c.phone ? `📞 ${c.phone}` : ""}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelClass}>Membership No.</label>
            <input
              type="text"
              className={inputClass}
              value={invoiceFormData.membershipId}
              placeholder="Auto-filled or Optional"
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, membershipId: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="flex justify-between items-center mb-2">
            <span className={labelClass}>Items List</span>
            <button
              onClick={() => {
                const newItem = { product: "", productId: "", batchNo: "", qty: 1, price: 0 };
                setInvoiceFormData(p => ({ ...p, items: [...p.items, newItem] }));
              }}
              className="text-[10px] font-black uppercase text-green-500 hover:underline"
            >
              + Add Item
            </button>
          </label>
          <div className="space-y-3">
            {invoiceFormData.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50/50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="col-span-5">
                  <input
                    type="text"
                    list="product-list-invoice"
                    placeholder="Product Name"
                    className={`${inputClass} !p-2 !rounded-lg text-xs`}
                    value={item.product}
                    onChange={(e) => {
                      const val = e.target.value;
                      const p = products.find(prod => prod.name === val);
                      const newItems = [...invoiceFormData.items];
                      newItems[idx] = {
                        ...newItems[idx],
                        product: val,
                        price: p ? p.price : newItems[idx].price,
                        productId: p ? p.productId : newItems[idx].productId,
                        batchNo: p ? p.batchNo : newItems[idx].batchNo
                      };
                      setInvoiceFormData({ ...invoiceFormData, items: newItems });
                    }}
                  />
                  <datalist id="product-list-invoice">
                    {products.map(p => (
                      <option key={p._id} value={p.name}>
                        Rs. {p.price} | Stock: {p.stock}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Price"
                    className={`${inputClass} !p-2 !rounded-lg text-xs`}
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...invoiceFormData.items];
                      newItems[idx].price = parseFloat(e.target.value) || 0;
                      setInvoiceFormData({ ...invoiceFormData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className={`${inputClass} !p-2 !rounded-lg text-xs`}
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = [...invoiceFormData.items];
                      newItems[idx].qty = parseInt(e.target.value) || 0;
                      setInvoiceFormData({ ...invoiceFormData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (invoiceFormData.items.length > 1) {
                        setInvoiceFormData({
                          ...invoiceFormData,
                          items: invoiceFormData.items.filter((_, i) => i !== idx)
                        });
                      }
                    }}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Payment Method</label>
            <select
              className={inputClass}
              value={invoiceFormData.paymentMethod}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, paymentMethod: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="eSewa">eSewa (Sandbox)</option>
              <option value="Khalti">Khalti (Sandbox)</option>
              <option value="Card">Card</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="flex gap-2">
             <div className="flex-1">
               <label className={labelClass}>Disc %</label>
               <input
                 type="number"
                 className={inputClass}
                 value={invoiceFormData.discountRate}
                 onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discountRate: parseFloat(e.target.value) || 0 })}
               />
             </div>
             <div className="flex-1">
               <label className={labelClass}>Tax %</label>
               <input
                 type="number"
                 className={inputClass}
                 value={invoiceFormData.taxRate}
                 onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxRate: parseFloat(e.target.value) || 0 })}
               />
             </div>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-2xl ${darkMode ? "bg-gray-900/50" : "bg-gray-50"} space-y-2`}>
          <div className="flex justify-between text-xs opacity-60">
            <span>Subtotal:</span>
            <span>Rs. {invoiceTotals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-red-500">
            <span>Discount:</span>
            <span>- Rs. {invoiceTotals.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-blue-500">
            <span>Tax ({invoiceFormData.taxRate}%):</span>
            <span>+ Rs. {invoiceTotals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-200 dark:border-gray-800">
            <span>Total:</span>
            <span className="text-green-600">Rs. {invoiceTotals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManualInvoiceModal;
