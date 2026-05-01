import React from "react";
import { Modal } from "../AdminUI";
import { Phone, PackagePlus, Trash2 } from "lucide-react";

const LotFormModal = ({
  showLotForm,
  setShowLotForm,
  lotTargetSupplier,
  lotFormData,
  setLotFormData,
  lotNewItem,
  setLotNewItem,
  handleAddLotItem,
  handleRemoveLotItem,
  handleSaveLot,
  products,
  darkMode,
  inputClass
}) => {
  if (!showLotForm || !lotTargetSupplier) return null;

  return (
    <Modal
      title={`Delivery Intake: ${lotTargetSupplier.name}`}
      onClose={() => setShowLotForm(false)}
      onConfirm={handleSaveLot}
      darkMode={darkMode}
      maxWidth="max-w-3xl"
      confirmText="Finalize Batch"
    >
      <div className="space-y-8 py-2">
        {/* Context Header */}
        <div className={`p-6 rounded-3xl flex items-center justify-between border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-green-50/50 border-green-100"}`}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-green-500/20">
              {lotTargetSupplier.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-lg tracking-tight leading-none mb-1">{lotTargetSupplier.name}</p>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                <Phone size={10} /> {lotTargetSupplier.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] block mb-1">Lot Source</span>
            <span className="px-3 py-1 rounded-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-black uppercase">Verified Partner</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Manifest Number *</label>
            <input
              type="text"
              className={`${inputClass} !py-4 !px-6 !rounded-2xl font-bold`}
              value={lotFormData.lotNumber}
              onChange={e => setLotFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
              placeholder="e.g., LOT-X992"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Arrival Date</label>
            <input
              type="date"
              className={`${inputClass} !py-4 !px-6 !rounded-2xl font-bold`}
              value={lotFormData.receivedDate}
              onChange={e => setLotFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Procurement Entry */}
        <div className={`p-6 rounded-[2rem] border ${darkMode ? "bg-gray-900/40 border-gray-800" : "bg-gray-50/50 border-gray-100 shadow-inner"}`}>
          <div className="flex items-center justify-between mb-6 px-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50 flex items-center gap-2">
              <PackagePlus size={14} className="text-green-500" /> Item Enrollment
            </h4>
            <p className="text-[10px] font-bold opacity-30 italic">Press Enter to quick-add</p>
          </div>

          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 lg:col-span-5">
              <label className="text-[9px] font-black uppercase opacity-30 ml-2 mb-1 block">Product Name</label>
              <select
                className={`${inputClass} !rounded-xl text-sm`}
                value={lotNewItem.product || ""}
                onChange={e => {
                  const p = products.find(prod => prod._id === e.target.value);
                  setLotNewItem(prev => ({ 
                    ...prev, 
                    product: e.target.value, 
                    productName: p?.name || "" 
                  }));
                }}
              >
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.productId || 'No ID'})</option>
                ))}
              </select>
            </div>
            <div className="col-span-6 lg:col-span-2">
              <label className="text-[9px] font-black uppercase opacity-30 ml-2 mb-1 block">Units</label>
              <input
                type="number"
                className={`${inputClass} !rounded-xl text-sm text-center`}
                placeholder="0"
                min="0"
                value={lotNewItem.quantityReceived || ""}
                onChange={e => setLotNewItem(prev => ({ ...prev, quantityReceived: Math.max(0, Number(e.target.value)) }))}
                onKeyDown={e => e.key === "Enter" && handleAddLotItem()}
              />
            </div>
            <div className="col-span-6 lg:col-span-3">
              <label className="text-[9px] font-black uppercase opacity-30 ml-2 mb-1 block">Buy Price (Rs.)</label>
              <input
                type="number"
                className={`${inputClass} !rounded-xl text-sm text-right font-mono`}
                placeholder="0.00"
                min="0"
                value={lotNewItem.purchasePrice || ""}
                onChange={e => setLotNewItem(prev => ({ ...prev, purchasePrice: Math.max(0, Number(e.target.value)) }))}
                onKeyDown={e => e.key === "Enter" && handleAddLotItem()}
              />
            </div>
            <div className="col-span-12 lg:col-span-2">
              <button
                onClick={handleAddLotItem}
                className="w-full h-[46px] bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                Enroll
              </button>
            </div>
          </div>

          {/* List of Enrolled Items */}
          {lotFormData.items.length > 0 && (
            <div className="mt-8 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-6">
              {lotFormData.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 group animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{it.productName}</p>
                      <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Qty: {it.quantityReceived} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-mono font-bold text-green-600">Rs. {it.purchasePrice || 0}</p>
                    <button
                      onClick={() => handleRemoveLotItem(idx)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Arrival Notes</label>
          <textarea
            className={`${inputClass} !py-4 !px-6 !rounded-3xl min-h-[100px] resize-none`}
            placeholder="Condition of goods, driver info, etc."
            value={lotFormData.notes}
            onChange={e => setLotFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  );
};

export default LotFormModal;
