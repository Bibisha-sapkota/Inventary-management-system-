import { API_URL } from "./useAdminData";
import CryptoJS from "crypto-js";

export const useAdminHandlers = ({
  token,
  fetchData,
  fetchNotifications,
  fetchHistoryLogs,
  triggerToast,
  setProducts,
  setOrders,
  setInvoices,
  setSuppliers,
  setCustomers,
  setNotifications,
  setExchanges,
  setHistoryLogs,
  products,
  orders,
  invoices,
  suppliers,
  customers,
  notifications,
  exchanges,
  settings,
  profile,
  // Form states and setters
  setProductFormData,
  setShowProductForm,
  setEditProductIndex,
  setInvoiceFormData,
  setShowInvoiceForm,
  setOrderFormData,
  setShowOrderForm,
  setEditOrderId,
  setSupplierFormData,
  setShowSupplierForm,
  setEditSupplierId,
  setLotFormData,
  setShowLotForm,
  setLotTargetSupplier,
  setLotNewItem,
  setExchangeFormData,
  setShowExchangeForm,
  setCustomerFormData,
  setShowCustomerForm,
  setEditCustomerId,
  setSupplierDetailData,
  setExpandedSupplierId,
  expandedSupplierId,
  supplierDetailData,
  setShowScannerInvoice
}) => {

  const handleLogout = (navigate, clearAuth) => {
    if (window.confirm("Logout?")) {
      clearAuth();
      navigate("/login");
    }
  };

  const handleNotificationClick = async (notif, activeTab, switchTab, setShowNotificationDropdown) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );

    if (notif.unread) {
      try {
        await fetch(`${API_URL}/notifications/${notif.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) { console.error("Error marking notification read:", err); }
    }

    if (activeTab !== "notifications") {
      switchTab("notifications");
    }
    setShowNotificationDropdown(false);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.error("Error marking all notifications read:", err); }
  };

  const handleSaveProduct = async (productFormData) => {
    if (!productFormData.name.trim()) return alert("Name is required!");
    try {
      const payload = { ...productFormData };
      if (!payload.supplier) delete payload.supplier;
      delete payload.status;

      const url = productFormData._id ? `${API_URL}/products/${productFormData._id}` : `${API_URL}/products`;
      const method = productFormData._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        triggerToast(productFormData._id ? "Product updated!" : "Product added!");
        setShowProductForm(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);
      } else {
        alert("Failed to save product: " + (data.message || "Unknown error"));
      }
    } catch (err) { alert("Error saving product."); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Deleted!");
        fetchData();
        fetchNotifications();
        fetchHistoryLogs();
      }
    } catch (err) { alert("Error deleting"); }
  };

  const handleSaveInvoice = async (invoiceFormData, invoiceTotals) => {
    const { subtotal, discount, tax, grandTotal } = invoiceTotals;
    const totalItems = invoiceFormData.items.reduce((acc, item) => acc + Number(item.qty || 0), 0);

    const newInvoice = {
      customer: invoiceFormData.customer,
      membershipId: invoiceFormData.membershipId,
      date: invoiceFormData.date || new Date().toISOString().split("T")[0],
      itemsCount: totalItems,
      subtotal,
      discount,
      tax,
      totalAmount: grandTotal,
      itemsList: invoiceFormData.items,
      paymentMethod: invoiceFormData.paymentMethod,
      discountRate: invoiceFormData.discountRate,
      taxRate: invoiceFormData.taxRate,
      status: "Paid",
    };

    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newInvoice)
      });
      const resData = await res.json();
      if (res.ok) {
        const generatedInvoiceId = resData.data.invoiceId;
        // Create corresponding Order
        try {
          await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              product: newInvoice.itemsList[0]?.product + (newInvoice.itemsList.length > 1 ? ` + ${newInvoice.itemsList.length - 1} more` : ""),
              invoiceNumber: generatedInvoiceId,
              status: "Completed",
              date: newInvoice.date,
              totalPrice: grandTotal,
              quantity: totalItems
            })
          });
        } catch (err) { console.error("Error creating order:", err); }

        triggerToast("Invoice created successfully!");
        setShowInvoiceForm(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);

        // Handle Payment Redirects
        if (invoiceFormData.paymentMethod === 'eSewa') {
           // eSewa Logic (Simplified for brevity, but should match AdminDashboard.jsx)
           initiateEsewaPayment(generatedInvoiceId, subtotal, discount, tax, grandTotal);
        } else if (invoiceFormData.paymentMethod === 'Khalti') {
           initiateKhaltiPayment(generatedInvoiceId, grandTotal, triggerToast);
        }
      } else {
        alert("Error: " + (resData.message || "Failed to save invoice."));
      }
    } catch (err) { alert("Network Error: Could not connect to server."); }
  };

  const initiateEsewaPayment = (invoiceId, subtotal, discount, tax, grandTotal) => {
    const taxableAmount = (subtotal - discount).toFixed(2);
    const taxAmt = tax.toFixed(2);
    const totalAmt = grandTotal.toFixed(2);
    const uuid = invoiceId + "-" + Date.now();
    const secret = '8gBm/:&EnhH.1/q';
    const productCode = 'EPAYTEST';
    const message = `total_amount=${totalAmt},transaction_uuid=${uuid},product_code=${productCode}`;
    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

    const fields = {
      amount: taxableAmount,
      tax_amount: taxAmt,
      total_amount: totalAmt,
      transaction_uuid: uuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: window.location.origin + '/admin/invoices?esewa_success=true',
      failure_url: window.location.origin + '/admin/invoices?esewa_failure=true',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature
    };

    for (const key in fields) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', fields[key]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const initiateKhaltiPayment = (invoiceId, grandTotal, triggerToast) => {
    const loadKhalti = () => {
      return new Promise((resolve) => {
        if (window.KhaltiCheckout) return resolve();
        const script = document.createElement("script");
        script.src = "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadKhalti().then(() => {
      const config = {
        publicKey: "test_public_key_6d757813cc1941faafbd9ef30523b9fd",
        productIdentity: `${invoiceId}-${Date.now()}`,
        productName: "Invoice " + invoiceId,
        productUrl: window.location.origin,
        paymentPreference: ["KHALTI"],
        eventHandler: {
          onSuccess(payload) { triggerToast("Payment successful!"); },
          onError(error) { triggerToast("Payment Error!"); },
          onClose() { console.log('Khalti widget closed'); }
        }
      };
      const checkout = new window.KhaltiCheckout(config);
      checkout.show({ amount: Math.round(Number(grandTotal || 0) * 100) });
    });
  };

  const handleSaveScannerInvoice = async (data) => {
    const totalItems = data.items.reduce((acc, item) => acc + item.qty, 0);
    const newInvoice = {
      customer: data.customer,
      membershipId: data.membershipId,
      date: data.date,
      itemsCount: totalItems,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      totalAmount: data.grandTotal,
      itemsList: data.items,
      paymentMethod: data.paymentMethod || "Cash",
      discountRate: data.discountRate,
      taxRate: data.taxRate,
      status: "Paid",
    };

    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newInvoice)
      });
      const resData = await res.json();
      if (res.ok) {
        const generatedInvoiceId = resData.data.invoiceId;
        // Create Order
        await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            product: data.items[0]?.product + (data.items.length > 1 ? ` + ${data.items.length - 1} more` : ""),
            invoiceNumber: generatedInvoiceId,
            status: "Completed",
            date: data.date,
            totalPrice: data.grandTotal,
            quantity: totalItems
          })
        });

        triggerToast("Invoice Saved!");
        setShowScannerInvoice(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);

        if (data.paymentMethod === 'eSewa') {
          initiateEsewaPayment(generatedInvoiceId, data.subtotal, data.discount, data.tax, data.grandTotal);
        } else if (data.paymentMethod === 'Khalti') {
          initiateKhaltiPayment(generatedInvoiceId, data.grandTotal, triggerToast);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveOrder = async (orderFormData, editOrderId) => {
    if (!orderFormData.product.trim()) return alert("Product is required!");
    const amountNum = parseFloat(orderFormData.amount);
    try {
      const url = editOrderId ? `${API_URL}/orders/${editOrderId}` : `${API_URL}/orders`;
      const method = editOrderId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product: orderFormData.product,
          customerName: orderFormData.customer,
          customerEmail: orderFormData.email,
          customerPhone: orderFormData.phone,
          status: orderFormData.status,
          date: orderFormData.date,
          totalPrice: isNaN(amountNum) ? 0 : amountNum
        })
      });
      if (res.ok) {
        triggerToast(editOrderId ? "Order updated!" : "Order added!");
        setShowOrderForm(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Order deleted!");
        fetchData();
        fetchNotifications();
        fetchHistoryLogs();
      }
    } catch (err) { alert("Error deleting"); }
  };

  const handleSaveSupplier = async (supplierFormData, editSupplierId) => {
    try {
      const url = editSupplierId ? `${API_URL}/suppliers/${editSupplierId}` : `${API_URL}/suppliers`;
      const method = editSupplierId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(supplierFormData)
      });
      if (res.ok) {
        triggerToast("Supplier saved!");
        setShowSupplierForm(false);
        fetchData();
      }
    } catch (err) { alert("Error saving supplier"); }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Delete supplier?")) return;
    try {
      await fetch(`${API_URL}/suppliers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      triggerToast("Supplier deleted!");
      fetchData();
    } catch (err) { alert("Error deleting"); }
  };

  const handleUpdateSupplierStatus = async (id, newStatus) => {
    try {
      const supplier = suppliers.find(s => s._id === id);
      if (!supplier) return;
      const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...supplier, status: newStatus })
      });
      if (res.ok) {
        triggerToast(`Status updated!`);
        fetchData();
      }
    } catch (err) { alert("Error updating status"); }
  };

  const handleToggleSupplierExpand = async (supplierId) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
      return;
    }
    setExpandedSupplierId(supplierId);
    if (supplierDetailData[supplierId]) return;
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [pRes, lRes] = await Promise.all([
        fetch(`${API_URL}/suppliers/${supplierId}/products`, { headers: h }),
        fetch(`${API_URL}/suppliers/${supplierId}/lots`, { headers: h }),
      ]);
      const pData = await pRes.json();
      const lData = await lRes.json();
      setSupplierDetailData(prev => ({
        ...prev,
        [supplierId]: { products: pData.data || [], lots: lData.data || [] },
      }));
    } catch (err) { console.error(err); }
  };

  const handleSaveLot = async (lotFormData, lotTargetSupplier) => {
    if (!lotTargetSupplier) return;
    try {
      const res = await fetch(`${API_URL}/suppliers/${lotTargetSupplier._id}/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(lotFormData),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Lot saved!");
        setShowLotForm(false);
        setSupplierDetailData(prev => {
          const copy = { ...prev };
          delete copy[lotTargetSupplier._id];
          return copy;
        });
        if (expandedSupplierId === lotTargetSupplier._id) {
           // Refresh logic...
        }
      }
    } catch (err) { alert("Error saving lot"); }
  };

  const handleSaveCustomer = async (customerFormData, editCustomerId) => {
    if (!customerFormData.name.trim()) return alert("Name is required!");
    try {
      const url = editCustomerId ? `${API_URL}/customers/${editCustomerId}` : `${API_URL}/customers`;
      const method = editCustomerId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(customerFormData)
      });
      if (res.ok) {
        triggerToast(editCustomerId ? "Customer updated!" : "Customer added!");
        setShowCustomerForm(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error saving customer");
      }
    } catch (err) { alert("Error saving customer"); }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Delete customer?")) return;
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Deleted!");
        fetchData();
      }
    } catch (err) { alert("Error deleting"); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice? This will also delete the corresponding order record if it exists.")) return;
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Invoice deleted!");
        fetchData();
      } else {
        alert("Failed to delete invoice");
      }
    } catch (err) { alert("Error deleting invoice"); }
  };

  const handleCSVImport = async (data, products, fetchData, triggerToast, token) => {
    // Basic implementation - iterate and POST
    let count = 0;
    for (const item of data) {
      try {
        await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(item)
        });
        count++;
      } catch (err) { console.error("CSV Import error for item:", item, err); }
    }
    triggerToast(`Imported ${count} products!`);
    fetchData();
  };

  const handleSaveExchange = async (exchangeFormData) => {
    if (!exchangeFormData.returnedProductId) {
      alert("Please select a Returned Product.");
      return;
    }
    if (!exchangeFormData.reason) {
      alert("Please select a Reason for Exchange.");
      return;
    }
    if (!exchangeFormData.billNumber) {
      alert("Bill number is required.");
      return;
    }
    
    try {
      if (exchangeFormData.exchangeId) {
         await fetch(`${API_URL}/exchanges/${exchangeFormData.exchangeId}`, {
           method: 'DELETE',
           headers: { Authorization: `Bearer ${token}` }
         });
      }
      const dataToSend = { ...exchangeFormData };
      delete dataToSend.exchangeId;

      const res = await fetch(`${API_URL}/exchanges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        triggerToast("Exchange logged!");
        setShowExchangeForm(false);
        fetchData();
      } else {
        alert("Failed to save exchange: " + (responseData.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error saving exchange: " + err.message);
    }
  };

  const handleProfileSave = async (profile) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) triggerToast("Profile saved!");
    } catch (err) { alert("Error saving profile"); }
  };

  const handleSettingsSave = async (settings, darkMode) => {
    try {
      const res = await fetch(`${API_URL}/auth/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...settings, darkMode })
      });
      if (res.ok) triggerToast("Settings saved!");
    } catch (err) { alert("Error saving settings"); }
  };

  const handleResetData = async () => {
    if (!window.confirm("⚠️ DANGER: Reset all data?")) return;
    try {
      const res = await fetch(`${API_URL}/auth/reset-data`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Data reset!");
        fetchData();
      }
    } catch (err) { alert("Error resetting"); }
  };

  const handleToggleCustomerStatus = async (customer) => {
    try {
      const newStatus = customer.status === "active" ? "blocked" : "active";
      const res = await fetch(`${API_URL}/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...customer, status: newStatus })
      });
      if (res.ok) {
        triggerToast(`Customer ${newStatus === "active" ? "unblocked" : "blocked"}!`);
        fetchData();
      }
    } catch (err) { alert("Error updating customer status"); }
  };

  return {
    handleLogout,
    handleNotificationClick,
    handleMarkAllNotificationsRead,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveInvoice,
    handleSaveScannerInvoice,
    handleSaveOrder,
    handleDeleteOrder,
    handleSaveSupplier,
    handleDeleteSupplier,
    handleUpdateSupplierStatus,
    handleToggleSupplierExpand,
    handleSaveLot,
    handleSaveCustomer,
    handleToggleCustomerStatus,
    handleDeleteCustomer,
    handleDeleteInvoice,
    handleCSVImport,
    handleSaveExchange,
    handleProfileSave,
    handleSettingsSave,
    handleResetData
  };
};
