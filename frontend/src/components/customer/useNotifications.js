// src/components/customer/useNotifications.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Map backend fields (isRead, createdAt) to frontend fields (read, time)
        const mapped = res.data.data.map(n => ({
          ...n,
          id: n._id,
          read: n.isRead,
          time: new Date(n.createdAt).toLocaleString()
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 5 seconds for updates (faster for better responsiveness)
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllNotificationsAsRead = async () => {
    if (!token) return;
    try {
      const res = await axios.put(`${API_URL}/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      const res = await axios.put(`${API_URL}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { 
    notifications, 
    unreadCount, 
    markAllNotificationsAsRead, 
    markAsRead,
    refreshNotifications: fetchNotifications 
  };
}