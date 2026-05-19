import React from "react";
import { Modal } from "../AdminUI";

const OrderFormModal = ({
  showOrderForm,
  setShowOrderForm,
  orderFormData,
  setOrderFormData,
  handleSaveOrder,
  darkMode,
  customers = [],
  products = [],
  orders = [],
  labelClass,
  inputClass
}) => {
  if (!showOrderForm) return null;

  return (
    <Modal
      title="Add Order"
      onClose={() => setShowOrderForm(false)}
      onConfirm={handleSaveOrder}
      darkMode={darkMode}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>S.No (Order Number)</label>
          <input
            type="text"
            className={inputClass}
            value={orderFormData.sno || `ORD-${String((orders.length || 0) + 1).padStart(4, "0")}`}
            onChange={(e) =>
              setOrderFormData((prev) => ({
                ...prev,
                sno: e.target.value,
              }))
            }
            placeholder="e.g. ORD-0001"
          />
        </div>
        <div>
          <label className={labelClass}>Customer Name</label>
          <input
            type="text"
            className={inputClass}
            value={orderFormData.customer}
            list="customer-list"
            onChange={(e) => {
              const selectedName = e.target.value;
              const foundCustomer = customers.find(c => c.name === selectedName);
              setOrderFormData((prev) => ({
                ...prev,
                customer: selectedName,
                email: foundCustomer && foundCustomer.email ? foundCustomer.email : prev.email,
                phone: foundCustomer && foundCustomer.phone ? foundCustomer.phone : prev.phone,
              }));
            }}
            placeholder="Name or Select Customer"
          />
          <datalist id="customer-list">
            {customers.map(c => (
              <option key={c.id || c._id} value={c.name}>
                {c.id || "CUST-???"} | {c.phone}
              </option>
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={orderFormData.email || ""}
              onChange={(e) =>
                setOrderFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              className={inputClass}
              value={orderFormData.phone || ""}
              onChange={(e) =>
                setOrderFormData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="+977 98XXXXXXXX"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Product / Description *</label>
          <input
            type="text"
            list="product-list"
            className={inputClass}
            value={orderFormData.product}
            onChange={(e) => {
              const selectedName = e.target.value;
              const foundProduct = products.find(p => p.name === selectedName);
              let qty = orderFormData.quantity || 1;
              if (foundProduct && qty > foundProduct.stock) {
                qty = foundProduct.stock;
              }
              setOrderFormData((prev) => ({
                ...prev,
                product: selectedName,
                quantity: qty,
                amount: foundProduct ? (foundProduct.price * qty) : prev.amount
              }));
            }}
            placeholder="Search or Type Product Name"
          />
          <datalist id="product-list">
            {products.filter(p => p.stock > 0).map(p => (
              <option key={p._id} value={p.name}>
                {p.productId || "NO-ID"} | Stock: {p.stock} | Price: Rs.{p.price}
              </option>
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={orderFormData.date}
            onChange={(e) =>
              setOrderFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={orderFormData.quantity || 1}
              onChange={(e) => {
                let qty = parseInt(e.target.value) || 1;
                if (qty < 1) qty = 1;
                const foundProduct = products.find(p => p.name === orderFormData.product);
                if (foundProduct && qty > foundProduct.stock) {
                  alert(`⚠️ Only ${foundProduct.stock} units available in stock! Quantity has been capped.`);
                  qty = foundProduct.stock;
                }
                const price = foundProduct ? foundProduct.price : 0;
                setOrderFormData((prev) => ({
                  ...prev,
                  quantity: qty,
                  amount: price * qty
                }));
              }}
              placeholder="1"
            />
          </div>
          <div>
            <label className={labelClass}>Amount (Rs.)</label>
            <input
              type="number"
              className={inputClass}
              value={orderFormData.amount}
              onChange={(e) =>
                setOrderFormData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderFormModal;
