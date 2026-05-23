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

  const isError = type === "error" || type === "warning";
  const iconColor = isError ? "bg-red-500" : "bg-emerald-500";
  const iconText = isError ? "!" : "✓";
  const progressBg = isError ? "bg-red-100" : "bg-emerald-100";
  const progressFill = isError ? "bg-red-500" : "bg-emerald-500";

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className="bg-white rounded shadow-[0_3px_10px_rgb(0,0,0,0.2)] flex flex-col w-[350px] max-w-sm overflow-hidden border border-gray-100">
        <div className="flex items-start gap-4 p-4">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${iconColor}`}>
            <span className="text-white text-sm font-bold">{iconText}</span>
          </div>
          <div className="flex-1 text-gray-500 text-[15px] font-normal leading-snug">
            {message}
          </div>
        </div>
        <div className={`h-1 w-full ${progressBg}`}>
          <div className={`h-full ${progressFill} animate-shrink origin-left`} style={{ animationDuration: `${duration}ms` }}></div>
        </div>
      </div>
    </div>
  );
}