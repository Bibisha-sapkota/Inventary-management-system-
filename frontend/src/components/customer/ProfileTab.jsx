// src/components/customer/ProfileTab.jsx

import { useState } from "react";
import Icons from "./Icons";
import Toast from "./Toast";

export default function ProfileTab({ 
  profile, 
  handleProfilePhoto, 
  handleProfileChange, 
  saveProfile, 
  isSaving 
}) {
  const [toast, setToast] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Image size should be less than 5MB", type: "error" });
        return;
      }
      
      handleProfilePhoto(e);
      setToast({ message: "Photo uploaded successfully!", type: "success" });
    }
  };

  const handleSave = async () => {
    const result = await saveProfile();
    if (result.success) {
      setToast({ message: result.message, type: "success" });
    } else {
      setToast({ message: result.message || "Failed to save", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 via-red-500 to-green-700 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 mb-8">
            {/* Profile Photo */}
            <div className="relative mx-auto sm:mx-0 group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 group-hover:scale-110">
                <Icons.Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
              </label>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-white text-sm font-medium">Change Photo</span>
              </div>
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-500">{profile.bio}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span>📍</span> {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <span>📅</span> Member since {profile.memberSince}
                </span>
              </div>
            </div>

            {/* Save Button - Desktop */}
            <div className="hidden sm:block">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-200"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                name="location"
                value={profile.location}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your location"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none resize-none transition-all"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Save Button - Mobile */}
          <div className="mt-6 sm:hidden">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Account Information
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold text-gray-800">{profile.memberSince}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Active
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-semibold text-gray-800">Customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}