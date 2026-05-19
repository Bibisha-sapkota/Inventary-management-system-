import React from "react";
import { Modal } from "../AdminUI";
import { QRCodeCanvas } from "qrcode.react";

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
  inputClass,
  userRole,
  loading = false
}) => {
  if (!showInvoiceForm) return null;

  return (
    <Modal
      title="Create Manual Invoice"
      onClose={() => setShowInvoiceForm(false)}
      onConfirm={handleSaveInvoice}
      darkMode={darkMode}
      maxWidth="max-w-xl"
      loading={loading}
      confirmText="Checkout"
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
              placeholder="Leave blank for Auto-generated"
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
            <label className={labelClass}>Customer Email</label>
            <input
              type="email"
              className={inputClass}
              value={invoiceFormData.customerEmail}
              placeholder="Email for Digital Receipt"
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-blue-50/80 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/50 shadow-sm transition-all hover:shadow-md">
                <div className="col-span-5">
                  <label className="text-[9px] font-black uppercase text-blue-400 mb-1 ml-1 block tracking-widest">Select Product</label>
                  <input
                    type="text"
                    list="product-list-invoice"
                    placeholder="Product Name"
                    className={`${inputClass} !p-2 !rounded-lg text-xs border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500`}
                    value={item.product}
                    onChange={(e) => {
                      const val = e.target.value;
                      const p = products.find(prod => prod.name === val);
                      if (p && p.stock <= 0) {
                        alert("⚠️ This product is out of stock!");
                        return;
                      }
                      const newItems = [...invoiceFormData.items];
                      const currentQty = newItems[idx].qty;
                      newItems[idx] = {
                        ...newItems[idx],
                        product: val,
                        price: p ? p.price : newItems[idx].price,
                        productId: p ? p._id : newItems[idx].productId,
                        batchNo: p ? p.batchNo : newItems[idx].batchNo,
                        qty: (p && currentQty > p.stock) ? p.stock : currentQty
                      };
                      setInvoiceFormData({ ...invoiceFormData, items: newItems });
                    }}
                  />
                  <datalist id="product-list-invoice">
                    {products.filter(p => p.stock > 0).map(p => (
                      <option key={p._id} value={p.name}>
                        Rs. {p.price} | Stock: {p.stock}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="col-span-3">
                  <label className="text-[9px] font-black uppercase text-blue-400 mb-1 ml-1 block tracking-widest">Qty</label>
                  <input
                    type="number"
                    placeholder="Qty"
                    className={`${inputClass} !p-2 !rounded-lg text-xs border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500`}
                    value={item.qty}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      if (val < 1) val = 1;
                      const product = products.find(p => p.name === item.product);
                      if (product && val > product.stock) {
                        alert(`⚠️ Only ${product.stock} units available! Quantity has been capped.`);
                        val = product.stock;
                      }
                      const newItems = [...invoiceFormData.items];
                      newItems[idx].qty = val;
                      setInvoiceFormData({ ...invoiceFormData, items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-blue-400 mb-1 ml-1 block tracking-widest">Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className={`${inputClass} !p-2 !rounded-lg text-xs border-blue-200 dark:border-blue-800 ${userRole === 'superadmin' ? '' : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75'}`}
                    value={item.price}
                    readOnly={userRole !== 'superadmin'}
                    onChange={(e) => {
                      if (userRole !== 'superadmin') return;
                      const inputVal = parseFloat(e.target.value) || 0;
                      const p = products.find(prod => prod.name === item.product);
                      
                      let finalPrice = inputVal;
                      if (p) {
                        if (inputVal > p.price) {
                          alert(`⚠️ Price cannot exceed original price (Rs. ${p.price})`);
                          finalPrice = p.price;
                        } else if (inputVal < p.price) {
                          alert(`⚠️ Price cannot be lower than original price (Rs. ${p.price})`);
                          finalPrice = p.price;
                        }
                      }

                      const newItems = [...invoiceFormData.items];
                      newItems[idx].price = finalPrice;
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
              <label className={labelClass}>
                Disc % {userRole !== 'superadmin' && <span className="text-red-400 normal-case text-[8px]">(Superadmin)</span>}
              </label>
              <input
                type="number"
                className={`${inputClass} ${userRole !== 'superadmin' ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                value={invoiceFormData.discountRate}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discountRate: parseFloat(e.target.value) || 0 })}
                disabled={userRole !== 'superadmin'}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>
                Tax % {userRole !== 'superadmin' && <span className="text-red-400 normal-case text-[8px]">(Superadmin)</span>}
              </label>
              <input
                type="number"
                className={`${inputClass} ${userRole !== 'superadmin' ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                value={invoiceFormData.taxRate}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxRate: parseFloat(e.target.value) || 0 })}
                disabled={userRole !== 'superadmin'}
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

        {invoiceFormData.items.some(i => i.product) && invoiceFormData.customer && (
          <div className={`mt-4 p-4 rounded-2xl flex items-center justify-center gap-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-2 rounded-xl`}>
              <QRCodeCanvas
                value={`PAY-TO-STORE|${invoiceFormData.paymentMethod}|${invoiceTotals.grandTotal.toFixed(2)}`}
                size={80}
                level="H"
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scan to Verify</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">Rs. {invoiceTotals.grandTotal.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{invoiceFormData.paymentMethod} Payment</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManualInvoiceModal;
