import React, { useState, useEffect } from "react";
import { Modal } from "../AdminUI";

const SupplierPaymentModal = ({
  showPaymentModal,
  setShowPaymentModal,
  suppliers = [],
  initialSupplierId = null,
  handleRecordPayment,
  darkMode,
  inputClass
}) => {
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showPaymentModal) {
      setSupplierId(initialSupplierId || (suppliers[0]?._id || ""));
      setAmount("");
      setPaymentMethod("Cash");
      setReference("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setError("");
    }
  }, [showPaymentModal, initialSupplierId, suppliers]);

  if (!showPaymentModal) return null;

  const handleSubmit = () => {
    if (!supplierId) {
      setError("Please select a supplier!");
      return;
    }
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      setError("Please enter a valid payment amount greater than 0!");
      return;
    }
    if (!reference || !reference.trim()) {
      setError("Please write a reason or reference for this payment!");
      return;
    }
    setError("");
    handleRecordPayment(supplierId, payAmt, paymentMethod, reference, paymentDate);
  };

  const inputStyle = `w-full px-4 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
    darkMode 
      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500" 
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
  }`;

  return (
    <Modal
      title="Record Supplier Payment"
      onClose={() => {
        setError("");
        setShowPaymentModal(false);
      }}
      onConfirm={handleSubmit}
      darkMode={darkMode}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Supplier Choice */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1.5 block">Choose Supplier *</label>
            <select
              className={inputStyle}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={!!initialSupplierId}
            >
              <option value="" disabled>-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.phone || "No phone"})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1.5 block">Payment Amount (रु - Amount) *</label>
            <input
              type="number"
              className={`${inputStyle} ${error && !amount ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
              placeholder="e.g., 5000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1.5 block">Payment Channel / Method *</label>
            <select
              className={inputStyle}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">💵 Cash</option>
              <option value="eSewa">📱 eSewa</option>
              <option value="Khalti">💜 Khalti</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="IPS / ConnectIPS">🔗 ConnectIPS</option>
              <option value="Cheque">✍️ Cheque</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1.5 block">Payment Date</label>
            <input
              type="date"
              className={inputStyle}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Reason/Remarks (Wider Textarea & Important!) */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1.5 block text-red-500 dark:text-red-400 font-bold">
              Reason / Remarks / Transaction Ref * (Required)
            </label>
            <textarea
              className={`${inputStyle} min-h-[130px] resize-none ${error && !reference.trim() ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
              placeholder="e.g., Paid outstanding balance for WLV lot, eSewa Transaction ID: 89X72B9..."
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (error) setError("");
              }}
              rows={4}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-[11px] font-black text-red-500 animate-pulse">❌ {error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SupplierPaymentModal;
