// src/components/customer/useOrders.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      // Fetch user's orders (Force customer view to see what we BOUGHT)
      const res = await axios.get('https://inventory-backend-u3bi.onrender.com/api/orders?view=customer', config);
      
      // The backend returns an array of objects. 
      // Admin dashboard maps them differently, but we want to map them similarly here.
      // Wait, let's map them to match the expected format in OrderHistoryTab:
      // { id: String, customer: String, date: String, status: String, amount: Number, products: [String] }
      
      // Let's group by invoice number since multiple items hit different order records
      const grouped = {};
      res.data.data.forEach(item => {
        if (!grouped[item.invoiceNumber]) {
           grouped[item.invoiceNumber] = {
             id: item.invoiceNumber,
             customer: item.customerName,
             date: item.date,
             status: item.status,
             amount: 0,
             products: [],
             items: []
           };
        }
        grouped[item.invoiceNumber].amount += item.totalPrice;
        grouped[item.invoiceNumber].products.push(item.product);
        grouped[item.invoiceNumber].items.push({ name: item.product, qty: item.quantity, price: item.totalPrice / item.quantity });
      });

      const mappedOrders = Object.values(grouped).sort((a,b) => new Date(b.date) - new Date(a.date));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, []);

  const addOrder = async (orderData) => {
    try {
       const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       };

       const res = await axios.post('https://inventory-backend-u3bi.onrender.com/api/orders/checkout', orderData, config);
       if (res.data.success) {
          fetchOrders(); // Refresh to get the actual grouped invoice
       }
       return res.data;
    } catch (error) {
       console.error("Failed to place order:", error);
       alert(error.response?.data?.message || "Check out failed");
       throw error;
    }
  };

  const cancelOrder = useCallback(async (orderId) => {
      alert("Order cancellation logic not implemented on backend for multiple items per invoice yet. Please contact support.");
  }, []);

  return {
    orders,
    isLoading,
    refreshOrders,
    addOrder,
    cancelOrder,
  };
}