import React from "react";
import { AlertTriangle } from "lucide-react";
import { SettingsToggle, SettingsRow } from "./AdminUI";

const SettingsTab = ({
  darkMode,
  setDarkMode,
  settings,
  setSettings,
  triggerToast,
  inputClass,
  cardClass,
  handleResetData,
  handleSettingsSave
}) => {
  return (
    <div className="space-y-6">
      <div className={`${cardClass} rounded-2xl p-6 shadow-sm`}>
        <h2 className="font-semibold text-lg mb-4">Settings</h2>

        <div className="divide-y divide-gray-100">
          {/* Theme */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Dark Mode</p>
              <p className="text-xs text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <SettingsToggle
              enabled={darkMode}
              onToggle={() => setDarkMode((prev) => !prev)}
            />
          </div>

          <SettingsRow
            title="Low Stock Alerts"
            description="Highlight products when stock is below threshold"
            enabled={settings.lowStockAlerts}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                lowStockAlerts: !prev.lowStockAlerts,
              }))
            }
          />

          <SettingsRow
            title="Email Notifications"
            description="Receive important alerts via email"
            enabled={settings.emailNotifications}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                emailNotifications: !prev.emailNotifications,
              }))
            }
          />

          <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Low Stock Threshold
              </p>
              <p className="text-xs text-gray-400">
                Products below this stock are considered low stock
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                className={`${inputClass} w-24 text-sm`}
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    lowStockThreshold: Math.max(
                      1,
                      Number(e.target.value || 1)
                    ),
                  }))
                }
              />
              <span className="text-xs text-gray-400">units</span>
            </div>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Tax Rate</p>
              <p className="text-xs text-gray-400">
                Applied to invoices after discount
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={`${inputClass} w-24 text-sm`}
                value={(settings.taxRate * 100).toFixed(1)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    taxRate:
                      Math.max(
                        0,
                        Math.min(100, Number(e.target.value || 0))
                      ) / 100,
                  }))
                }
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Default Discount
              </p>
              <p className="text-xs text-gray-400">
                Used for manual invoices & scanner default
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                className={`${inputClass} w-24 text-sm`}
                value={settings.defaultDiscountRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultDiscountRate: Math.max(
                      0,
                      Math.min(100, Number(e.target.value || 0))
                    ),
                  }))
                }
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
          </div>

          <SettingsRow
            title="Privacy Mode"
            description="Hide sensitive customer and notification details"
            enabled={settings.privacyMode}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                privacyMode: !prev.privacyMode,
              }))
            }
          />

          <SettingsRow
            title="Hide Customer Contacts"
            description="Hide customer email and phone from customer list"
            enabled={settings.hideCustomerContacts}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                hideCustomerContacts: !prev.hideCustomerContacts,
              }))
            }
          />

          <SettingsRow
            title="Password for Exports"
            description="Ask for password before exporting data"
            enabled={settings.requirePasswordForExport}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                requirePasswordForExport:
                  !prev.requirePasswordForExport,
              }))
            }
          />

          <SettingsRow
            title="Show Notification Details"
            description="Show full notification messages in the list"
            enabled={settings.showNotificationDetails}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                showNotificationDetails:
                  !prev.showNotificationDetails,
              }))
            }
          />

          <SettingsRow
            title="Automatic Backups"
            description="Enable automatic daily backups (visual only)"
            enabled={settings.autoBackup}
            onToggle={() =>
              setSettings((prev) => {
                const next = {
                  ...prev,
                  autoBackup: !prev.autoBackup,
                };
                triggerToast(
                  next.autoBackup
                    ? "Auto backup enabled"
                    : "Auto backup disabled"
                );
                return next;
              })
            }
          />
        </div>
      </div>

      {/* Danger Zone: Reset All Data */}
      <div className={`${cardClass} rounded-2xl p-6 shadow-sm border border-red-500/20`}>
        <h2 className="font-semibold text-lg mb-2 text-red-500 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={20} /> Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete all your products, orders, invoices, suppliers, and customers. This action cannot be undone and will reset your dashboard stats to zero.
        </p>
        <button
          onClick={handleResetData}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition shadow-md w-full sm:w-auto"
        >
          Reset All Data To 0
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSettingsSave}
          className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
