// src/components/customer/ToggleSetting.jsx

export default function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}