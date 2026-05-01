import React from "react";
import { Modal } from "../AdminUI";

const SupplierFormModal = ({
  showSupplierForm,
  setShowSupplierForm,
  editSupplierId,
  handleSaveSupplier,
  supplierFormData,
  setSupplierFormData,
  darkMode,
  inputClass
}) => {
  if (!showSupplierForm) return null;

  return (
    <Modal
      title={editSupplierId ? "Edit Partner Profile" : "Register New Partner"}
      onClose={() => setShowSupplierForm(false)}
      onConfirm={handleSaveSupplier}
      darkMode={darkMode}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Full Business Name *</label>
            <input type="text" className={`${inputClass} !rounded-xl`} placeholder="e.g., Global Electronics Ltd." value={supplierFormData.name} onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Primary Contact</label>
            <input type="text" className={`${inputClass} !rounded-xl`} placeholder="Contact person name" value={supplierFormData.contactPerson} onChange={(e) => setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Partner Category</label>
            <select className={`${inputClass} !rounded-xl`} value={supplierFormData.category} onChange={(e) => setSupplierFormData({ ...supplierFormData, category: e.target.value })}>
              <option value="Regular">Regular Supplier</option>
              <option value="Premium">Premium Partner</option>
              <option value="Wholesale">Wholesale Channel</option>
              <option value="Logistics">Logistics Provider</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Email Address</label>
            <input type="email" className={`${inputClass} !rounded-xl`} placeholder="billing@partner.com" value={supplierFormData.email} onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Phone Number *</label>
            <input type="text" className={`${inputClass} !rounded-xl`} placeholder="+977-98XXXXXXXX" value={supplierFormData.phone} onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-1 block">Operational Address</label>
          <input type="text" className={`${inputClass} !rounded-xl`} placeholder="Headquarters or warehouse location" value={supplierFormData.address} onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })} />
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block text-center">Account Status</label>
          <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setSupplierFormData({ ...supplierFormData, status: 'Active' })}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${supplierFormData.status === 'Active' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400'}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setSupplierFormData({ ...supplierFormData, status: 'Inactive' })}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${supplierFormData.status === 'Inactive' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400'}`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierFormModal;
