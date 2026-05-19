import { API_URL } from "./useAdminData";
import CryptoJS from "crypto-js";
import { handlePreviewInvoice } from "./InvoiceUtils";

export const useAdminHandlers = ({
  token,
  fetchData,
  fetchNotifications,
  fetchHistoryLogs,
  triggerToast,
  setProducts,
  setOrders,
  setSuppliers,
  setNotifications,
  setExchanges,
  setHistoryLogs,
  products,
  orders,
  suppliers,
  notifications,
  exchanges,
  settings,
  profile,
  // Form states and setters
  setProductFormData,
  setShowProductForm,
  setEditProductIndex,
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
  setSupplierDetailData,
  setExpandedSupplierId,
  expandedSupplierId,
  supplierDetailData,
  setShowScannerInvoice,
  setShowInvoiceForm,
  setInvoiceFormData,
  setActiveTab,
  setIsSubmittingInvoice
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
    if (!productFormData.name.trim()) return triggerToast("Name is required!", "error");
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
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Unknown error");
        triggerToast(msg, "error");
      }
    } catch (err) { triggerToast("Error saving product.", "error"); }
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


  const handleSaveOrder = async (orderFormData, editOrderId) => {
    if (!orderFormData.product.trim()) return triggerToast("Product is required!", "error");
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
          totalPrice: isNaN(amountNum) ? 0 : amountNum,
          quantity: Number(orderFormData.quantity) || 1
        })
      });
      if (res.ok) {
        triggerToast(editOrderId ? "Order updated!" : "Order added!");
        setShowOrderForm(false);
        fetchData();
        setTimeout(() => { fetchNotifications(); fetchHistoryLogs(); }, 800);
      } else {
        const data = await res.json();
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Action failed");
        triggerToast(msg, "error");
      }
    } catch (err) { console.error(err); triggerToast("Error saving order", "error"); }
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
      } else {
        const data = await res.json();
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Action failed");
        triggerToast(msg, "error");
      }
    } catch (err) { triggerToast("Error saving supplier", "error"); }
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



  const handleCSVImport = async (data) => {
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
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (responseData.message || "Unknown error");
        triggerToast(msg, "error");
      }
    } catch (err) {
      triggerToast("Error saving exchange: " + err.message, "error");
    }
  };

  const handleProfileSave = async (profile) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        triggerToast("Profile saved!");
      } else {
        const data = await res.json();
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Action failed");
        alert("Failed to save profile: " + msg);
      }
    } catch (err) { alert("Error saving invoice"); }
    finally { setIsSubmittingInvoice(false); }
  };

  const handleSettingsSave = async (settings, darkMode) => {
    try {
      const res = await fetch(`${API_URL}/auth/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...settings, darkMode })
      });
      
      if (res.ok) {
        triggerToast("Settings saved!");
      } else {
        const data = await res.json();
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Action failed");
        alert("Failed to save settings: " + msg);
      }
    } catch (err) { alert("Error saving settings"); }
  };

  const handleSaveInvoice = async (invoiceFormData, invoiceTotals) => {
    if (!invoiceFormData.customer.trim()) return triggerToast("Customer name is required!", "error");
    setIsSubmittingInvoice(true);
    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoiceId: invoiceFormData.sno,
          date: invoiceFormData.date,
          customer: invoiceFormData.customer,
          membershipId: invoiceFormData.membershipId,
          customerEmail: invoiceFormData.customerEmail,
          itemsList: invoiceFormData.items,
          subtotal: invoiceTotals.subtotal,
          discount: invoiceTotals.discount,
          tax: invoiceTotals.tax,
          totalAmount: invoiceTotals.grandTotal,
          paymentMethod: invoiceFormData.paymentMethod,
          discountRate: invoiceFormData.discountRate,
          taxRate: invoiceFormData.taxRate
        })
      });

      if (res.ok) {
        const result = await res.json();
        const finalInvoice = result.data || { invoiceId: invoiceFormData.sno, ...invoiceFormData };
        triggerToast("Invoice created successfully!");
        setShowInvoiceForm(false);
        fetchData();
        setActiveTab("invoices");
        
        if (invoiceFormData.paymentMethod === 'eSewa') {
          initiateEsewaPayment(invoiceFormData.sno, invoiceTotals.subtotal, invoiceTotals.discount, invoiceTotals.tax, invoiceTotals.grandTotal);
        } else if (invoiceFormData.paymentMethod === 'Khalti') {
          initiateKhaltiPayment(invoiceFormData.sno, invoiceTotals.grandTotal, triggerToast);
        }
      } else {
        const data = await res.json();
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Failed to save invoice");
        triggerToast(msg, "error");
      }
    } catch (err) {
      triggerToast("Error saving invoice", "error");
    }
  };

  const handleSaveScannerInvoice = async (invoiceData) => {
    setIsSubmittingInvoice(true);
    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: invoiceData.date,
          customer: invoiceData.customer,
          membershipId: invoiceData.membershipId,
          customerEmail: invoiceData.customerEmail,
          itemsList: invoiceData.items.map(item => ({
            product: item.product,
            productId: item.productId,
            qty: item.qty,
            price: item.price
          })),
          subtotal: invoiceData.subtotal,
          discount: invoiceData.discount,
          tax: invoiceData.tax,
          totalAmount: invoiceData.grandTotal,
          itemsCount: invoiceData.items.length,
          paymentMethod: invoiceData.paymentMethod,
          discountRate: invoiceData.discountRate,
          taxRate: invoiceData.taxRate,
          sourceOrderId: invoiceData.sourceOrderId
        })
      });

      if (res.ok) {
        const result = await res.json();
        const finalInvoice = result.data || {};
        triggerToast("Invoice created successfully!");
        setShowScannerInvoice(false);
        fetchData();
        setActiveTab("invoices");
        
        if (invoiceData.paymentMethod === 'eSewa') {
          initiateEsewaPayment(finalInvoice.invoiceId || Date.now(), invoiceData.subtotal, invoiceData.discount, invoiceData.tax, invoiceData.grandTotal);
        } else if (invoiceData.paymentMethod === 'Khalti') {
          initiateKhaltiPayment(finalInvoice.invoiceId || Date.now(), invoiceData.grandTotal, triggerToast);
        }
      } else {
        const data = await res.json().catch(() => ({ message: "Server error occurred" }));
        const msg = res.status === 403 ? "Your account is blocked by superadmin!" : (data.message || "Failed to save invoice");
        triggerToast(msg, "error");
      }
    } catch (err) {
      console.error("❌ Invoice Save Error:", err);
      triggerToast("Error saving invoice", "error");
    } finally {
      setIsSubmittingInvoice(false);
    }
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


  const handleDeleteExchange = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this exchange record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/exchanges/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Exchange deleted successfully!");
        fetchData();
        fetchNotifications();
        fetchHistoryLogs();
      } else {
        const data = await res.json();
        triggerToast(data.message || "Failed to delete exchange", "error");
      }
    } catch (err) {
      console.error("Delete Exchange Error:", err);
      triggerToast("Error deleting exchange", "error");
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this invoice? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Invoice deleted successfully!");
        fetchData();
        fetchNotifications();
        fetchHistoryLogs();
      } else {
        const data = await res.json();
        triggerToast(data.message || "Failed to delete invoice", "error");
      }
    } catch (err) {
      console.error("Delete Invoice Error:", err);
      triggerToast("Error deleting invoice", "error");
    }
  };

  return {
    handleLogout,
    handleNotificationClick,
    handleMarkAllNotificationsRead,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveOrder,
    handleDeleteOrder,
    handleSaveSupplier,
    handleDeleteSupplier,
    handleUpdateSupplierStatus,
    handleToggleSupplierExpand,
    handleSaveLot,
    handleCSVImport,
    handleSaveExchange,
    handleDeleteExchange,
    handleSaveInvoice,
    handleSaveScannerInvoice,
    handleDeleteInvoice,
    handleProfileSave,
    handleSettingsSave,
    handleResetData
  };
};
