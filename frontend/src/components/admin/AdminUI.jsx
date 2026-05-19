import React, { useEffect } from "react";
import { X, Activity } from "lucide-react";

export function SidebarItem({ icon, label, active, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 uppercase text-xs font-black tracking-widest ${active
        ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      {icon}
      <span>{label}</span>
    </li>
  );
}

export function SidebarSubItem({ label, active, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-[11px] font-bold tracking-wide ${active
        ? "text-white bg-white/5"
        : "text-slate-500 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-400 animate-pulse" : "bg-current opacity-40"}`} />
      <span>{label}</span>
    </li>
  );
}

export function StatCard({ label, value, gradient, icon }) {
  const isLight = gradient.includes('-50') || gradient.includes('bg-white') || gradient.includes('bg-amber-100') || gradient.includes('bg-emerald-50') || gradient.includes('bg-blue-50');

  return (
    <div
      className={`${gradient} p-6 rounded-[2.5rem] flex flex-col justify-center h-44 transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden active:scale-95 border ${isLight ? 'border-gray-100 shadow-xl' : 'border-white/10 shadow-2xl'}`}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-gray-500' : 'text-white/80'}`}>
            {label}
          </h4>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl border ${isLight ? 'bg-black/5 border-black/5 text-gray-700' : 'bg-white/10 border-white/10 text-white'} group-hover:rotate-12 transition-transform duration-500`}>
            {icon || <Activity size={20} />}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-black tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left ${isLight ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

export function QuickActionBtn({ icon, label, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`${darkMode
        ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
        } p-4 rounded-xl shadow-sm border transition flex items-center justify-center gap-3 font-extrabold text-xs uppercase`}
    >
      {icon} {label}
    </button>
  );
}

export function Modal({
  title,
  children,
  onClose,
  onConfirm,
  darkMode,
  maxWidth = "max-w-md",
  showButtons = true,
  confirmText = "Save Changes",
  confirmDisabled = false,
  loading = false,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`${darkMode
          ? "bg-gray-800 text-white border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          : "bg-white text-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
          } p-6 rounded-[2rem] ${maxWidth} w-full animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
        {showButtons && (
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmDisabled || loading}
              className={`bg-green-600 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-green-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 ${confirmDisabled || loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-green-500/20"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${enabled ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
        }`}
    >
      <div className="w-4 h-4 bg-white rounded-full shadow" />
    </button>
  );
}

export function SettingsRow({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
      <SettingsToggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}


export function Pagination({ currentPage, totalItems, pageSize = 10, onPageChange, darkMode }) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-b-2xl`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 border rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm border-blue-600' : `${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} border`}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 border rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
      >
        Next
      </button>
    </div>
  );
}
