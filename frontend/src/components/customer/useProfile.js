// src/components/customer/useProfile.js

import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_URL = "https://inventory-backend-u3bi.onrender.com/api/auth";

export function useProfile() {
  const [profile, setProfile] = useState({
    photo: null,
    name: "Loading...",
    email: "",
    phone: "",
    bio: "",
    location: "",
    memberSince: "...",
  });

  const [isSaving, setIsSaving] = useState(false);
  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        const u = res.data;
        setProfile({
          photo: u.avatar || null,
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          bio: u.bio || "",
          location: u.location || "",
          status: u.status || "active",
          memberSince: new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If the server returns 403 Forbidden, it likely means the user is blocked
      if (error.response && error.response.status === 403) {
        setProfile(prev => ({ ...prev, status: "blocked" }));
      }
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfilePhoto = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, message: "Image size should be less than 5MB" };
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfile((prev) => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
      
      return { success: true, message: "Photo selected successfully!" };
    }
    return { success: false, message: "No file selected" };
  }, []);

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const saveProfile = useCallback(async () => {
    if (!token) return { success: false, message: "Not logged in" };
    setIsSaving(true);
    
    try {
      const res = await axios.put(`${API_URL}/profile`, {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        avatar: profile.photo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        // Also update the cached user object in localStorage for other components
        const cachedUserStr = localStorage.getItem("user");
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          const updatedUser = {
            ...cachedUser,
            name: profile.name,
            avatar: profile.photo
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setIsSaving(false);
        return { success: true, message: "Profile saved successfully!" };
      }
      
      setIsSaving(false);
      return { success: false, message: res.data.message || "Failed to save" };
    } catch (error) {
      console.error("Profile save error:", error);
      setIsSaving(false);
      return { success: false, message: error.response?.data?.message || "Server error" };
    }
  }, [profile, token]);

  const updateProfileField = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    profile,
    setProfile,
    handleProfilePhoto,
    handleProfileChange,
    saveProfile,
    isSaving,
    updateProfileField,
    refreshProfile: fetchProfile
  };
}