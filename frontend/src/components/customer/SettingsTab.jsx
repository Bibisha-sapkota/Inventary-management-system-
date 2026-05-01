// src/components/customer/SettingsTab.jsx

import ToggleSetting from "./ToggleSetting";

export default function SettingsTab({ settings, setSettings }) {
  const updateSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSelectSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500">Manage your account preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-1">
          <ToggleSetting
            label="Email Notifications"
            description="Receive order updates and promotions via email"
            checked={settings.emailNotifications}
            onChange={() => updateSetting("emailNotifications")}
          />
          <ToggleSetting
            label="SMS Notifications"
            description="Receive order updates via SMS"
            checked={settings.smsNotifications}
            onChange={() => updateSetting("smsNotifications")}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
        <div className="space-y-1">
          <ToggleSetting
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            checked={settings.twoFactorAuth}
            onChange={() => updateSetting("twoFactorAuth")}
          />
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-800">Change Password</p>
              <p className="text-sm text-gray-500">Update your password regularly</p>
            </div>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSelectSetting("language", e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option>English</option>
              <option>Nepali</option>
              <option>Hindi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateSelectSetting("currency", e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option>NPR (Rs.)</option>
              <option>USD ($)</option>
              <option>INR (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}