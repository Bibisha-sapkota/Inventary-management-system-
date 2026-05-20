import React from "react";
import {
  Package,
  ShoppingCart,
  Receipt,
  Users,
  Truck,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  Plus,
  Scan,
  FileText,
  Settings as SettingsIcon,
  Activity,
  User
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { StatCard, QuickActionBtn } from "./AdminUI";

const DashboardTab = ({
  profile,
  products,
  orders,
  invoices,
  customers,
  suppliers,
  totalRevenue,
  activeProductsCount,
  unactiveProductsCount,
  expirySoonProducts,
  recentProducts,
  recentOrders,
  recentInvoices,
  recentHistory,
  salesData,
  stockByCategoryData,
  categoryPieData,
  darkMode,
  cardClass,
  switchTab,
  handleEditProduct,
  openAddProduct,
  setShowScannerInvoice,
  statusColor,
  categoryColors
}) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Inventory Financials Calculation
  let totalBuy = 0; let totalSell = 0;
  (products || []).forEach(p => {
    totalBuy += (Number(p.stock) || 0) * (Number(p.buyingPrice) || Number(p.price) || 0);
    totalSell += (Number(p.stock) || 0) * (Number(p.price) || 0);
  });
  const expectedProfit = totalSell - totalBuy;

  return (
    <div className="space-y-8">
      <div
        className="rounded-2xl p-8 text-black shadow-lg relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundBlendMode: "overlay"
        }}
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 uppercase text-gray-900">
            Welcome back, <span className="text-emerald-600">{profile?.role === 'admin' ? 'Admin User' : (profile?.role || 'Admin')} {profile?.name || 'User'}!</span>
          </h2>
          <p className="opacity-90">
            Here's what's happening with your store today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Products"
          value={products.length}
          gradient="bg-blue-50"
          icon={<Package size={24} />}
        />

        <StatCard
          label="Total Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          gradient="bg-rose-50"
          icon={<DollarSign size={24} />}
        />
        <StatCard
          label="Low Stock Items"
          value={products.filter(p => p.stock <= 10 && p.stock > 0).length}
          gradient="bg-rose-50"
          icon={<AlertCircle size={24} className="text-rose-500" />}
        />

        <StatCard
          label="Expiry Soon"
          value={expirySoonProducts.length}
          gradient="bg-rose-50"
          icon={<Clock size={24} />}
        />
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold uppercase ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Recently Added Products
          </h3>
          <button
            onClick={() => switchTab("productView")}
            className="text-xs font-black text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 border border-green-100 uppercase tracking-widest"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {recentProducts.length === 0 ? (
            <p className="text-xs text-gray-400">No products yet.</p>
          ) : (
            recentProducts.map((p, idx) => (
              <div
                key={p._id || idx}
                onClick={() => {
                  handleEditProduct(p);
                }}
                className={`${cardClass} min-w-[200px] p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-lg transition-all flex flex-col items-center text-center cursor-pointer group`}
              >
                <div className="relative w-24 h-24 mb-4 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <Eye className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="font-bold text-sm truncate w-full mb-1 group-hover:text-green-600 transition-colors">{p.name}</p>
                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <span className={`text-[10px] font-bold ${p.stock <= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
                <p className="text-sm font-black text-green-600">Rs. {p.price}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3
          className={`text-lg font-bold mb-4 uppercase ${darkMode ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={openAddProduct}
            className="bg-green-500 text-white p-4 rounded-xl shadow-md hover:bg-green-600 flex items-center justify-center gap-2 font-bold uppercase"
          >
            <Plus size={20} /> ADD PRODUCT
          </button>
          <button
            onClick={() => setShowScannerInvoice(true)}
            className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 flex items-center justify-center gap-2 font-bold uppercase transition-all hover:scale-105 active:scale-95"
          >
            <Scan size={20} /> SCAN INVOICE
          </button>
          <QuickActionBtn
            icon={<FileText />}
            label="Reports"
            onClick={() => switchTab("reports")}
            darkMode={darkMode}
          />
          <QuickActionBtn
            icon={<SettingsIcon />}
            label="Settings"
            onClick={() => switchTab("settings")}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`${cardClass} p-6 rounded-3xl shadow-sm`}>
          <h3 className="text-lg font-bold mb-6 uppercase">
            Revenue & Order Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="99%" height={256}>
              <ComposedChart data={salesData}>
                <defs>
                  <linearGradient
                    id="colorUv"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? "#374151" : "#f0f0f0"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  yAxisId="revenue"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#ffffff",
                    borderColor: "transparent",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    padding: "12px 16px",
                    fontFamily: "sans-serif"
                  }}
                  itemStyle={{
                    fontSize: "12px",
                    fontWeight: "800"
                  }}
                  labelStyle={{
                    color: darkMode ? "#9ca3af" : "#4b5563",
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "4px"
                  }}
                  formatter={(val, name) => name === 'Orders' ? [val, name] : [`Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#22c55e"
                  strokeWidth={3}
                  activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
                <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="orders" 
                  name="Orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} p-6 rounded-3xl shadow-sm`}>
          <h3 className="text-lg font-bold mb-6 uppercase">
            Stock by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="99%" height={256}>
              <BarChart data={stockByCategoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? "#374151" : "#f0f0f0"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#fff",
                    borderColor: "transparent",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${cardClass} p-8 rounded-3xl shadow-sm`}>
          <h3 className="text-lg font-bold mb-6 uppercase">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="99%" height={256}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[index % categoryColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#fff",
                    borderColor: "transparent",
                    borderRadius: "12px",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} p-8 rounded-3xl shadow-sm`}>
          <h3 className={`text-lg font-black uppercase mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-widest border-b ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                    <th className="pb-3 px-1">Product</th>
                    <th className="pb-3 px-1">Date</th>
                    <th className="pb-3 px-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, idx) => (
                    <tr key={idx} className={`border-b ${darkMode ? "border-white/5" : "border-gray-50"} last:border-0 hover:bg-gray-500/5 transition-colors`}>
                      <td className="py-4 px-1">
                        <p className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{o.product}</p>
                      </td>
                      <td className={`py-4 px-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{o.date}</td>
                      <td className="py-4 px-1 text-right">
                        <p className={`font-black ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Rs. {o.totalPrice || o.amount}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor[o.status] || (o.status?.toLowerCase() === 'paid' ? statusColor.Paid : "bg-gray-100 text-gray-600")}`}>
                          {o.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* RECENT INVOICES */}
        <div className={`${cardClass} p-8 rounded-3xl shadow-sm`}>
          <h3 className="text-lg font-bold mb-6 uppercase">Recent Invoices</h3>
          {recentInvoices.length === 0 ? (
            <p className="text-xs text-gray-400">No invoices yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-3 px-1">ID</th>
                    <th className="pb-3 px-1">Customer</th>
                    <th className="pb-3 px-1">Total</th>
                    <th className="pb-3 px-1 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv, idx) => (
                    <tr key={idx} className={`border-b ${darkMode ? "border-white/5" : "border-gray-50"} last:border-0 hover:bg-gray-500/5 transition-colors`}>
                      <td className={`py-4 px-1 font-bold text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>#{inv.invoiceId?.slice(-6) || "INV"}</td>
                      <td className={`py-4 px-1 text-xs truncate max-w-[100px] ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{inv.customer}</td>
                      <td className={`py-4 px-1 text-xs font-black ${darkMode ? "text-green-400" : "text-green-600"}`}>Rs. {inv.totalAmount}</td>
                      <td className="py-4 px-1 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor[inv.status] || (inv.status?.toLowerCase() === 'paid' ? statusColor.Paid : "bg-gray-100 text-gray-600")}`}>
                          {inv.status || "Paid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SYSTEM HISTORY / ACTIVITY */}
        <div className={`${cardClass} p-8 rounded-3xl shadow-sm`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-lg font-black uppercase ${darkMode ? "text-white" : "text-gray-900"}`}>System History</h3>
            <button onClick={() => switchTab("history")} className={`text-[10px] font-bold ${darkMode ? "text-green-400" : "text-green-600"} hover:underline uppercase tracking-widest`}>
              View All
            </button>
          </div>
          {recentHistory.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No history available.</p>
          ) : (
            <div className="space-y-6">
              {recentHistory.map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start relative group">
                  {/* Timeline Connector */}
                  {idx !== recentHistory.length - 1 && (
                    <div className="absolute left-[15px] top-[30px] bottom-[-15px] w-0.5 bg-gray-100" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                    log.action === 'UPDATE' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {log.type === 'product' ? <Package size={14} /> :
                      log.type === 'order' ? <ShoppingCart size={14} /> :
                        log.type === 'customer' ? <User size={14} /> : <Activity size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-bold truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                      {log.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-black tracking-tighter ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {log.action}
                      </span>
                      <span className="text-[9px] text-gray-300">•</span>
                      <span className={`text-[10px] font-bold uppercase ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
