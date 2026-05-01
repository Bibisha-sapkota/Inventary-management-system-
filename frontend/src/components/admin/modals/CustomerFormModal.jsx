import React from "react";
import { Modal } from "../AdminUI";

const CustomerFormModal = ({
  showCustomerForm,
  setShowCustomerForm,
  editCustomerId,
  handleSaveCustomer,
  customerFormData,
  setCustomerFormData,
  darkMode,
  labelClass,
  inputClass
}) => {
  if (!showCustomerForm) return null;

  return (
    <Modal
      title={editCustomerId ? "Edit Customer" : "Add New Customer"}
      onClose={() => setShowCustomerForm(false)}
      onConfirm={handleSaveCustomer}
      darkMode={darkMode}
      maxWidth="max-w-md"
      confirmText="Save"
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>S.No (Customer Number)</label>
          <input
            type="text"
            className={`${inputClass} font-black text-green-600 bg-green-50/10`}
            value={customerFormData.sno || ""}
            readOnly
          />
        </div>
        <div>
          <label className={labelClass}>Customer Name *</label>
          <input
            type="text"
            className={inputClass}
            value={customerFormData.name}
            onChange={(e) =>
              setCustomerFormData({ ...customerFormData, name: e.target.value })
            }
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            className={inputClass}
            value={customerFormData.email}
            onChange={(e) =>
              setCustomerFormData({ ...customerFormData, email: e.target.value })
            }
            placeholder="customer@example.com"
          />
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="text"
            className={inputClass}
            value={customerFormData.phone}
            onChange={(e) =>
              setCustomerFormData({ ...customerFormData, phone: e.target.value })
            }
            placeholder="+977 98XXXXXXXX"
          />
        </div>
        <div>
          <label className={labelClass}>Initial Status</label>
          <select
            className={inputClass}
            value={customerFormData.status}
            onChange={(e) =>
              setCustomerFormData({ ...customerFormData, status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerFormModal;
