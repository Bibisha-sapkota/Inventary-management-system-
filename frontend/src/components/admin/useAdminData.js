import { useState, useEffect } from 'react';

export const API_URL = "http://localhost:5000/api";

export const useAdminData = (token, navigate) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [settings, setSettings] = useState(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [pRes, oRes, iRes, sRes, cRes, nRes, exRes, hRes, setRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/orders`, { headers }),
        fetch(`${API_URL}/invoices`, { headers }),
        fetch(`${API_URL}/suppliers`, { headers }),
        fetch(`${API_URL}/customers`, { headers }),
        fetch(`${API_URL}/notifications`, { headers }),
        fetch(`${API_URL}/exchanges`, { headers }),
        fetch(`${API_URL}/history`, { headers }),
        fetch(`${API_URL}/settings`, { headers }),
      ]);

      const pData = await pRes.json();
      const oData = await oRes.json();
      const iData = await iRes.json();
      const sData = await sRes.json();
      const cData = await cRes.json();
      const nData = await nRes.json();
      const exData = await exRes.json();
      const hData = await hRes.json();
      const setData = await setRes.json();

      if (pData.success) setProducts(pData.data);
      if (oData.success) setOrders(oData.data);
      if (iData.success) setInvoices(iData.data);
      if (sData.success) setSuppliers(sData.data);
      if (cData.success) setCustomers(cData.data);
      if (exData.success) setExchanges(exData.data);
      if (setData.success) setSettings(setData.data);
      if (hData.success) setHistoryLogs(hData.data.map(log => ({
        ...log,
        id: log._id || log.id,
        title: log.title || log.entityName || log.action || 'Activity',
        detail: log.detail || log.details || '',
        type: (log.type || log.entityType || '').toLowerCase(),
        date: log.date || log.createdAt,
        createdAt: log.createdAt || log.date
      })));
      if (nData.success) {
        setNotifications(nData.data.map(n => ({
          ...n,
          id: n._id,
          unread: !n.isRead,
          date: new Date(n.createdAt).toLocaleString()
        })));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nData = await res.json();
      if (nData.success) {
        setNotifications(nData.data.map(n => ({
          ...n,
          id: n._id,
          unread: !n.isRead,
          date: new Date(n.createdAt).toLocaleString(),
        })));
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchHistoryLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hData = await res.json();
      if (hData.success) {
        setHistoryLogs(hData.data.map(log => ({
          ...log,
          id: log._id || log.id,
          title: log.title || log.entityName || log.action || 'Activity',
          detail: log.detail || log.details || '',
          type: (log.type || log.entityType || '').toLowerCase(),
          date: log.date || log.createdAt,
          createdAt: log.createdAt || log.date
        })));
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [token]);

  return {
    loading,
    products,
    setProducts,
    orders,
    setOrders,
    invoices,
    setInvoices,
    suppliers,
    setSuppliers,
    customers,
    setCustomers,
    notifications,
    setNotifications,
    exchanges,
    setExchanges,
    historyLogs,
    setHistoryLogs,
    settings,
    setSettings,
    fetchData,
    fetchNotifications,
    fetchHistoryLogs
  };
};
