import React from "react";
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Package,
  DollarSign,
  Layers,
  Box
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";

const ReportsTab = ({
  products,
  categoryReport,
  reportRange,
  setReportRange,
  reportDataSets,
  darkMode,
  cardClass,
  handleExportPDF,
  handleExportExcel,
  CATEGORY_COLORS
}) => {
  return (
    <div className="space-y-6">
      <div className={`${cardClass} rounded-2xl p-6 shadow-sm no-print`}>
        {/* Header + Export Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Reports & Analytics</h2>
            <p className="text-xs opacity-50 font-bold uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} /> Comprehensive Business Insights
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-red-600 flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
            >
              <FileText size={18} /> Export PDF
            </button>
            <button
              onClick={() => handleExportExcel(categoryReport, `Category_Report_${new Date().toISOString().split('T')[0]}.csv`)}
              className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
            >
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        {/* Stats Boxes Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length, icon: Package, color: "blue" },
            { label: "Inventory Value", value: `Rs. ${products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0).toFixed(0)}`, icon: DollarSign, color: "green" },
            { label: "Total Categories", value: categoryReport.length, icon: Layers, color: "orange" },
            { label: "Total Stock Units", value: categoryReport.reduce((s, c) => s + c.totalStock, 0), icon: Box, color: "purple" }
          ].map((stat, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sales trend range selector + line chart */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Revenue Analysis ({reportRange} view)
            </p>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {["daily", "weekly", "monthly", "yearly"].map((r) => (
                <button
                  key={r}
                  onClick={() => setReportRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${reportRange === r
                    ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`rounded-3xl p-6 border ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50/50 border-gray-100 shadow-inner"
              }`}
          >
            <div className="h-64">
              <ResponsiveContainer width="99%" height={256} minWidth={0} minHeight={0}>
                <LineChart data={reportDataSets[reportRange]}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={darkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1F2937" : "#fff",
                      borderColor: "transparent",
                      borderRadius: "16px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: 700
                    }}
                    formatter={(value) => `Rs. ${Number(value).toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#22c55e"
                    strokeWidth={4}
                    dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIE CHART */}
          <div
            className={`rounded-3xl p-6 border ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-100 shadow-sm"
              }`}
          >
            <h3 className="text-xs font-black uppercase opacity-40 mb-6">Inventory Value Share</h3>
            <div className="h-64 flex items-center justify-center">
              {categoryReport.length ? (
                <ResponsiveContainer width="99%" height={256} minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={categoryReport}
                      dataKey="productCount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={5}
                      label={({ category, productCount }) => `${category}: ${productCount}`}
                    >
                      {categoryReport.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || "#3b82f6"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value} Products`}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm opacity-30 italic">No data available</p>
              )}
            </div>
          </div>

          {/* BAR CHART */}
          <div
            className={`rounded-3xl p-6 border ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-100 shadow-sm"
              }`}
          >
            <h3 className="text-xs font-black uppercase opacity-40 mb-6">Stock Level by Category</h3>
            <div className="h-64">
              {categoryReport.length ? (
                <ResponsiveContainer width="99%" height={256} minWidth={0} minHeight={0}>
                  <BarChart data={categoryReport}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#f3f4f6"} />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="totalStock" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm opacity-30 italic">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Table */}
      <div className={`rounded-3xl border overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-lg"}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-sm font-black uppercase tracking-widest">Inventory Breakdown</h3>
          <span className="text-[10px] opacity-40 font-bold uppercase">{new Date().toDateString()}</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${darkMode ? "bg-gray-900/50" : "bg-gray-50/50"}`}>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6 text-right">Qty</th>
              <th className="py-4 px-6 text-right">Products</th>
              <th className="py-4 px-6 text-right">Financial Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categoryReport.map((row) => (
              <tr key={row.category} className={darkMode ? "hover:bg-gray-800/40" : "hover:bg-gray-50/50"}>
                <td className="py-4 px-6 font-bold">{row.category}</td>
                <td className="py-4 px-6 text-right font-bold text-green-600">{row.totalStock}</td>
                <td className="py-4 px-6 text-right">{row.productCount}</td>
                <td className="py-4 px-6 text-right font-black text-green-600">Rs. {row.inventoryValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTab;
