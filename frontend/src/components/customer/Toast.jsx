// src/components/customer/Toast.jsx

import { useEffect } from "react";
import Icons from "./Icons";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-emerald-500",
      icon: "✓",
    },
    error: {
      bg: "bg-red-500",
      icon: "✕",
    },
    warning: {
      bg: "bg-yellow-500",
      icon: "⚠",
    },
    info: {
      bg: "bg-green-500",
      icon: "ℹ",
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className={`${style.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
          {style.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <Icons.X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}