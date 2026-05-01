// src/components/customer/StatCard.jsx

import Icons from "./Icons";

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  iconBg, 
  iconColor, 
  mainBg, 
  textColor 
}) {
  const isIncrease = change.includes("Increase");
  const isDecrease = change.includes("Decrease");

  return (
    <div className={`${mainBg} rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col justify-between`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          {Icon && <Icon className={iconColor} />}
        </div>
        <span
          className={`text-sm font-medium flex items-center gap-1 ${
            isIncrease ? "text-emerald-600" : isDecrease ? "text-red-600" : "text-gray-500"
          }`}
        >
          {isIncrease && <Icons.TrendingUp className="w-4 h-4" />}
          {isDecrease && <Icons.TrendingUp className="w-4 h-4 transform rotate-180 text-red-600" />}
          {change}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">{label}</h3>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}