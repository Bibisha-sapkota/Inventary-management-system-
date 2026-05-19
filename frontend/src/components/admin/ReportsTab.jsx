import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, FileText, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ReportsTab = ({ products, orders, invoices, totalRevenue, darkMode, cardClass }) => {
  const [reportPeriod, setReportPeriod] = useState('Daily');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Admin Reports", 14, 20);
    doc.save("admin_reports.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "admin_reports.xlsx");
  };

  // Grouping data based on period for Area Chart
  const chartData = useMemo(() => {
    const groups = {};
    const safeInvoices = invoices || [];
    
    // 1. Pre-seed the last 15 periods so the chart always has a range
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      let key = '';
      let sortVal = 0;

      if (reportPeriod === 'Yearly') {
        d.setFullYear(now.getFullYear() - i);
        key = d.getFullYear().toString();
        sortVal = new Date(d.getFullYear(), 0, 1).getTime();
      } else if (reportPeriod === 'Monthly') {
        d.setMonth(now.getMonth() - i);
        key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        sortVal = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      } else if (reportPeriod === 'Daily') {
        d.setDate(now.getDate() - i);
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        sortVal = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else if (reportPeriod === 'Weekly') {
        d.setDate(now.getDate() - (i * 7));
        const first = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d - first) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((d.getDay() + 1 + days) / 7);
        key = `W${week} ${d.getFullYear()}`;
        sortVal = new Date(d.getFullYear(), 0, 1).getTime() + (week * 7 * 24 * 60 * 60 * 1000);
      }
      groups[key] = { label: key, Revenue: 0, sortVal };
    }

    // 2. Aggregate actual data
    safeInvoices.forEach(i => {
      const date = new Date(i.date || i.createdAt);
      let key = '';
      if (reportPeriod === 'Yearly') key = date.getFullYear().toString();
      else if (reportPeriod === 'Monthly') key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      else if (reportPeriod === 'Daily') key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else if (reportPeriod === 'Weekly') {
        const first = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - first) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((date.getDay() + 1 + days) / 7);
        key = `W${week} ${date.getFullYear()}`;
      }

      if (groups[key]) {
        groups[key].Revenue += (i.totalAmount || 0);
      }
    });

    return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
  }, [invoices, reportPeriod]);

  // Sales Overview bar chart — dynamic based on reportPeriod
  const salesOverviewData = useMemo(() => {
    const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const groups = {};
    if (reportPeriod === 'Daily') {
      DAY_ORDER.forEach(d => { groups[d] = { name: d, Sales: 0, Revenue: 0, sortVal: DAY_ORDER.indexOf(d) }; });
    }

    const getGroupData = (date) => {
      if (reportPeriod === 'Daily') return { key: DAY_MAP[date.getDay()], sortVal: DAY_ORDER.indexOf(DAY_MAP[date.getDay()]) };
      if (reportPeriod === 'Weekly') {
        const first = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - first) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((date.getDay() + 1 + days) / 7);
        return { key: `W${week}`, sortVal: week };
      }
      if (reportPeriod === 'Monthly') {
        return { key: date.toLocaleDateString('en-US', { month: 'short' }), sortVal: date.getMonth() };
      }
      return { key: date.getFullYear().toString(), sortVal: date.getFullYear() };
    };

    const cutoff = new Date();
    if (reportPeriod === 'Daily') cutoff.setDate(cutoff.getDate() - 7);
    else if (reportPeriod === 'Weekly') cutoff.setDate(cutoff.getDate() - 56);
    else if (reportPeriod === 'Monthly') cutoff.setMonth(cutoff.getMonth() - 12);
    else cutoff.setFullYear(cutoff.getFullYear() - 5);

    (invoices || []).forEach(i => {
      const date = new Date(i.date || i.createdAt);
      if (date < cutoff) return;
      const { key, sortVal } = getGroupData(date);
      if (!groups[key]) groups[key] = { name: key, Sales: 0, Revenue: 0, sortVal };
      groups[key].Revenue += (i.totalAmount || 0);
    });

    (orders || []).forEach(o => {
      if (o.status === 'Cancelled') return;
      const date = new Date(o.date || o.createdAt);
      if (date < cutoff) return;
      const { key, sortVal } = getGroupData(date);
      if (!groups[key]) groups[key] = { name: key, Sales: 0, Revenue: 0, sortVal };
      groups[key].Sales += 1;
    });

    if (reportPeriod === 'Daily') {
      return DAY_ORDER.map(d => groups[d]);
    }
    return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
  }, [invoices, orders, reportPeriod]);

  // Category Revenue Distribution Data
  const categoryRevenueData = useMemo(() => {
    const cats = {};
    (invoices || []).forEach(inv => {
      const items = inv.itemsList || inv.items || [];
      items.forEach(item => {
        const product = (products || []).find(p => p._id === item.productId || p.name === item.product);
        const cat = product?.category || 'General';
        if (!cats[cat]) cats[cat] = { name: cat, value: 0, products: new Set() };
        cats[cat].value += (item.qty * (item.price || 0));
        if (product) cats[cat].products.add(product._id);
      });
    });
    return Object.values(cats)
      .filter(c => c.value > 0)
      .map(c => ({ ...c, productCount: c.products.size }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [invoices, products]);

  const totalOrdersCount = orders?.filter(o => o.status !== 'Cancelled').length || 0;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(0) : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

  const renderCategoryLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, name, percent, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if ((percent * 100) < 4) return null; // skip tiny labels
    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="700">
        {name} {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const textClass = darkMode ? "text-white" : "text-gray-900";
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBorderClass = darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-white";
  const selectBgClass = darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100";
  const dropdownClass = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100";
  const hoverClass = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row justify-between items-center p-4 rounded-2xl shadow-sm gap-4 ${cardClass}`}>
        <h2 className={`text-xl font-black px-2 ${textClass}`}>Reports & Analytics</h2>
        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className={`flex items-center gap-2 px-4 py-2 border text-sm font-bold rounded-xl transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
            <Download size={16} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className={`flex items-center gap-2 px-4 py-2 border text-sm font-bold rounded-xl transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
            <FileText size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`rounded-2xl border shadow-sm p-6 ${cardBorderClass}`}>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex-1 w-full relative">
            <label className={`text-[10px] font-black uppercase mb-2 block tracking-widest ${subTextClass}`}>Analysis Period</label>
            <div 
              className={`w-full md:w-64 px-4 py-3 border rounded-xl cursor-pointer flex justify-between items-center ${selectBgClass}`}
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            >
              <span className={`text-sm font-bold ${textClass}`}>{reportPeriod}</span>
              <ChevronDown size={16} className={subTextClass} />
            </div>
            {periodDropdownOpen && (
              <div className={`absolute top-full left-0 mt-2 w-full md:w-64 border shadow-xl rounded-xl z-50 overflow-hidden ${dropdownClass}`}>
                {periods.map(p => (
                  <div 
                    key={p} 
                    className={`px-4 py-3 text-sm font-bold cursor-pointer ${textClass} ${hoverClass}`}
                    onClick={() => { setReportPeriod(p); setPeriodDropdownOpen(false); }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 border rounded-2xl flex flex-col justify-center ${cardBorderClass}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${subTextClass}`}>Total Revenue</p>
            <p className={`text-3xl font-black ${textClass}`}>Rs {totalRevenue.toLocaleString()}</p>
          </div>
          <div className={`p-6 border rounded-2xl flex flex-col justify-center ${cardBorderClass}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${subTextClass}`}>Total Orders</p>
            <p className={`text-3xl font-black ${textClass}`}>{totalOrdersCount}</p>
          </div>
          <div className={`p-6 border rounded-2xl flex flex-col justify-center ${cardBorderClass}`}>
            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${subTextClass}`}>Avg Order Value</p>
            <p className={`text-3xl font-black ${textClass}`}>Rs {avgOrderValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* SALES ANALYSIS AREA CHART */}
      <div className={`rounded-2xl border shadow-sm p-6 ${cardBorderClass}`}>
        <h3 className={`text-sm font-black mb-8 uppercase tracking-widest ${textClass}`}>SALES ANALYSIS</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorRevArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#f1f5f9"} />
              <XAxis dataKey="label" axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <YAxis axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : val} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }} 
                itemStyle={{
                  color: "#10b981",
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
                formatter={(val) => [`Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Revenue"]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevArea)" 
                name="Revenue" 
                strokeWidth={3.5} 
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SALES OVERVIEW BAR & STOCK PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl border shadow-sm p-6 ${cardBorderClass}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-sm font-black ${textClass}`}>Sales Overview</h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>{reportPeriod}</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesOverviewData} barCategoryGap="20%" barGap={4} margin={{ top: 10, right: 50, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis yAxisId="rev" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v >= 1000 ? (v/1000).toFixed(0)+'k' : v} />
                <YAxis yAxisId="sal" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '12px', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val, name) => name === 'Revenue (Rs)' ? [`Rs ${val.toLocaleString()}`, 'Revenue'] : [val, 'Sales']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="rev" dataKey="Revenue" fill="#10b981" name="Revenue (Rs)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar yAxisId="sal" dataKey="Sales" fill="#3b82f6" name="Sales" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl border shadow-sm p-6 ${cardBorderClass}`}>
          <h3 className={`text-sm font-black mb-1 ${textClass}`}>Revenue by Category</h3>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${subTextClass}`}>Live revenue share per category</p>
          <div className="h-72 flex items-center justify-center">
            {categoryRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenueData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={renderCategoryLabel}
                  >
                    {categoryRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val, name, props) => [`Rs ${val.toLocaleString()} (${props.payload.productCount} items)`, props.payload.name]}
                    contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '10px', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }}
                  />
                  <Legend
                    formatter={(value, entry) => <span style={{ color: entry.color, fontSize: '11px', fontWeight: 700 }}>{value}</span>}
                    wrapperStyle={{ paddingTop: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className={`text-xs font-bold ${subTextClass}`}>No revenue data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED SALES TABLE */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBorderClass}`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-black ${textClass}`}>Detailed Sales Report</h3>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Invoice ID</th>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Date</th>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Customer</th>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Items</th>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Total Amount</th>
                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {(invoices || []).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).map((inv, idx) => (
                <tr key={inv._id || idx} className={`${hoverClass} transition-colors`}>
                  <td className={`px-6 py-4 text-xs font-bold ${textClass}`}>{inv.sno || inv.invoiceId || '-'}</td>
                  <td className={`px-6 py-4 text-xs font-medium ${subTextClass}`}>{new Date(inv.date || inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${textClass}`}>{typeof inv.customer === 'object' ? inv.customer?.name : inv.customer || 'Guest'}</td>
                  <td className={`px-6 py-4 text-xs font-medium ${subTextClass}`}>{inv.items?.length || 0} items</td>
                  <td className={`px-6 py-4 text-xs font-black text-emerald-500`}>Rs {inv.totalAmount?.toLocaleString() || 0}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${textClass}`}>
                    <span className={`px-2 py-1 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textClass}`}>{inv.paymentMethod || 'Cash'}</span>
                  </td>
                </tr>
              ))}
              {(!invoices || invoices.length === 0) && (
                <tr>
                  <td colSpan="6" className={`px-6 py-8 text-center text-xs font-bold ${subTextClass}`}>No sales data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
