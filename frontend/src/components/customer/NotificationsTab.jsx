// src/components/customer/NotificationsTab.jsx

import Icons from "./Icons";

export default function NotificationsTab({
  notifications = [],
  unreadCount = 0,
  markAllNotificationsAsRead,
  markAsRead,
}) {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "📦";
      case "discount":
        return "🏷️";
      case "product":
        return "🛍️";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            <Icons.Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {safeNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up! Check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.read && markAsRead?.(item.id)}
              className={`bg-white rounded-xl shadow-sm border p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                item.read ? "border-gray-100" : "border-emerald-200 bg-emerald-50/30"
              }`}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {getNotificationIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`${item.read ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                  {item.message}
                </p>
                <p className="text-sm text-gray-400 mt-1">{item.time}</p>
              </div>

              {/* Unread Indicator */}
              {!item.read && (
                <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}