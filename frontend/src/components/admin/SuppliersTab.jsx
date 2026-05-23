import React from "react";
import { Truck, Phone, Mail, FileText, Plus, FileSpreadsheet, Barcode, Clock, Trash2, Pencil, Package, Search, List, Grid, Ban, ShieldCheck, Edit3, User } from "lucide-react";
import { Pagination } from "./AdminUI";
import SupplierPaymentModal from "./modals/SupplierPaymentModal";
import CryptoJS from "crypto-js";

const SuppliersTab = ({
  suppliers,
  supplierDetailData,
  selectedSupplierForLots,
  setSelectedSupplierForLots,
  setSupplierFormData,
  setEditSupplierId,
  setShowSupplierForm,
  handleDeleteSupplier,
  handleUpdateSupplierStatus,
  handleDeleteLot,
  openLotForm,
  handleEditProduct,
  handleDeleteProduct,
  products,
  invoices,
  darkMode,
  cardClass,
  currentPage,
  onPageChange,
  fetchData,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState("cards");
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [initialPaymentSupplierId, setInitialPaymentSupplierId] = React.useState(null);
  const PAGE_SIZE = 10;

  const handleRecordPayment = async (supplierId, payAmt, paymentMethod, reference, paymentDate) => {
    try {
      const supplier = suppliers.find(s => s._id === supplierId);
      if (!supplier) return;
      const updatedAmountPaid = Number(supplier.amountPaid || 0) + Number(payAmt);

      const token = localStorage.getItem("token");
      const url = `https://inventory-backend-u3bi.onrender.com/api/suppliers/${supplierId}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...supplier,
          amountPaid: updatedAmountPaid
        })
      });

      if (res.ok) {
        alert(`Recorded payment of Rs. ${payAmt.toLocaleString()} to ${supplier.name} via ${paymentMethod}!`);
        setShowPaymentModal(false);
        if (fetchData) {
          fetchData();
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        alert(data.message || "Failed to record payment");
      }
    } catch (err) {
      alert("Error recording payment");
    }
  };

  // --- Global Sales Calculation ---
  const globalProductSales = {};
  (products || []).forEach(p => {
    globalProductSales[p._id] = 0;
  });

  if (invoices && invoices.length > 0) {
    invoices.forEach(inv => {
      const items = inv.itemsList || inv.items || [];
      items.forEach(item => {
        const itemProd = item.product?._id || item.product;
        if (!itemProd) return;
        
        const matchedProduct = (products || []).find(p =>
          p._id === itemProd ||
          (p.name && p.name.toLowerCase().trim() === itemProd.toString().toLowerCase().trim())
        );

        if (matchedProduct) {
          globalProductSales[matchedProduct._id] += Number(item.qty || 0);
        }
      });
    });
  }

  // --- Dynamic calculations for supplier detail view ---
  let totalItemsManaged = 0;
  let totalStockInHand = 0;
  let totalBuyAmount = 0;
  let totalSellAmount = 0;
  let netProfit = 0;
  let productRows = [];

  if (selectedSupplierForLots) {
    const supplierProducts = (products || []).filter(
      (p) => (p.supplier && p.supplier === selectedSupplierForLots._id) ||
        (p.supplierName && selectedSupplierForLots.name && p.supplierName.toLowerCase().trim() === selectedSupplierForLots.name.toLowerCase().trim())
    );

    totalItemsManaged = supplierProducts.length;

    productRows = supplierProducts.map((p) => {
      const sold = globalProductSales[p._id] || 0;
      const remaining = Number(p.stock || 0);
      const quantity = sold + remaining;

      totalStockInHand += remaining;

      const buyPrice = Number(p.buyingPrice || 0);
      const sellPrice = Number(p.price || 0);

      const totalBuy = quantity * buyPrice;
      const totalSell = quantity * sellPrice;
      const profit = totalSell - totalBuy;

      totalBuyAmount += totalBuy;
      totalSellAmount += totalSell;

      return {
        _id: p._id,
        name: p.name,
        batchNo: p.batchNo || "A1",
        date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        quantity,
        buyPrice,
        sellPrice,
        sold,
        remaining,
        totalBuy,
        totalSell,
        profit
      };
    });

    netProfit = productRows.reduce((sum, r) => sum + r.profit, 0);
  }


  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${darkMode ? "text-white" : "text-slate-900"}`}>
            Suppliers <span className="text-emerald-600">Network</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-11 pr-4 py-3 rounded-2xl text-xs font-bold w-64 transition-all outline-none border-2 ${darkMode
                ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500/50"
                : "bg-white border-gray-100 text-slate-900 focus:border-emerald-500/30 shadow-sm"
                }`}
            />
          </div>

          {!selectedSupplierForLots && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border-2 border-transparent">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Table View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Card View"
              >
                <Grid size={20} />
              </button>
            </div>
          )}

          {selectedSupplierForLots && (
            <button
              onClick={() => setSelectedSupplierForLots(null)}
              className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border ${darkMode
                ? "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                : "bg-white text-slate-500 border-gray-200 hover:text-slate-900 shadow-sm"
                }`}
            >
              Back to Overview
            </button>
          )}
          <button
            onClick={() => {
              setInitialPaymentSupplierId(selectedSupplierForLots?._id || null);
              setShowPaymentModal(true);
            }}
            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-700 active:scale-95 transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2 hover:-translate-y-1"
          >
            💳 Record Payment
          </button>
          <button
            onClick={() => {
              setEditSupplierId(null);
              setSupplierFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "General", status: "Active" });
              setShowSupplierForm(true);
            }}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2 hover:-translate-y-1"
          >
            <Plus size={16} /> Onboard Supplier
          </button>
        </div>
      </div>

      {!selectedSupplierForLots && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-1000">
          {(() => {
            let totalBuy = 0;
            let totalSell = 0;
            let totalPaid = 0;
            let totalDue = 0;

            suppliers.forEach(s => {
              // Calculate buy amount for this supplier
              let supplierBuyAmount = 0;
              products.forEach(p => {
                const matches = (p.supplier && p.supplier === s._id) ||
                  (p.supplierName && s.name && p.supplierName.toLowerCase().trim() === s.name.toLowerCase().trim());
                if (matches) {
                  const sold = globalProductSales[p._id] || 0;
                  const qty = (Number(p.stock) || 0) + sold;
                  const buyVal = qty * (Number(p.buyingPrice) || Number(p.price) || 0);
                  supplierBuyAmount += buyVal;
                  totalBuy += buyVal;
                  totalSell += qty * (Number(p.price) || 0);
                }
              });

              const paidVal = Number(s.amountPaid || 0);
              totalPaid += paidVal;
              totalDue += Math.max(0, supplierBuyAmount - paidVal);
            });

            const totalProfit = totalSell - totalBuy;

            return (
              <>
                <div className={`${cardClass} p-8 rounded-[2.5rem] border border-emerald-500/20 dark:border-emerald-500/30 shadow-2xl shadow-emerald-500/5 flex flex-col justify-center gap-2 group hover:border-emerald-500/50 transition-all overflow-hidden relative`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-35 text-emerald-600">Total Investment (Buy)</p>
                  <h3 className="text-3xl font-black tracking-tighter text-emerald-600">Rs. {totalBuy.toLocaleString()}</h3>
                </div>


                <div className={`${cardClass} p-8 rounded-[2.5rem] border border-purple-500/20 dark:border-purple-500/30 shadow-2xl shadow-purple-500/5 flex flex-col justify-center gap-2 group hover:border-purple-500/50 transition-all overflow-hidden relative`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-35 text-purple-600">Total Profit</p>
                  <h3 className="text-3xl font-black tracking-tighter text-purple-600">Rs. {totalProfit.toLocaleString()}</h3>
                </div>

                <div className={`${cardClass} p-8 rounded-[2.5rem] border border-teal-500/20 dark:border-teal-500/30 shadow-2xl shadow-teal-500/5 flex flex-col justify-center gap-2 group hover:border-teal-500/50 transition-all overflow-hidden relative`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-all" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-35 text-teal-600">Paid to Supplier</p>
                  <h3 className="text-3xl font-black tracking-tighter text-teal-600">Rs. {totalPaid.toLocaleString()}</h3>
                </div>

                <div className={`${cardClass} p-8 rounded-[2.5rem] border border-rose-500/20 dark:border-rose-500/30 shadow-2xl shadow-rose-500/5 flex flex-col justify-center gap-2 group hover:border-rose-500/50 transition-all overflow-hidden relative`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-all" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-35 text-rose-600">Remaining Due</p>
                  <h3 className="text-3xl font-black tracking-tighter text-rose-600">Rs. {totalDue.toLocaleString()}</h3>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!selectedSupplierForLots ? (
        viewMode === "cards" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedSuppliers.map((s, idx) => (
                <div
                  key={s._id}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className={`${cardClass} p-0 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500/30 transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-2xl shadow-black/5 flex flex-col hover:-translate-y-2 animate-in slide-in-from-bottom-4`}
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-3xl group-hover:scale-110 transition-transform duration-500">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-white'
                          } border border-white/20 shadow-sm`}>
                          {s.status}
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-3xl font-black tracking-tighter uppercase truncate mb-1 transition-colors duration-300 ${darkMode ? "text-white group-hover:text-emerald-400" : "text-black group-hover:text-emerald-600"}`}>
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">Procurement Partner</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Mail size={14} className="text-emerald-600/60" />
                        <span className="text-xs font-bold truncate">{s.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Phone size={14} className="text-emerald-600/60" />
                        <span className="text-xs font-bold">{s.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Category:</span>
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${darkMode
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                          : "bg-emerald-50 text-emerald-600 border-emerald-500/10"
                          }`}>
                          {s.category || 'General'}
                        </span>
                      </div>
                    </div>

                    {(() => {
                      const supplierProducts = products.filter(p =>
                        (p.supplier && p.supplier === s._id) ||
                        (p.supplierName && s.name && p.supplierName.toLowerCase().trim() === s.name.toLowerCase().trim())
                      );
                      let sBuy = 0; let sSell = 0;
                      supplierProducts.forEach(p => {
                        const sold = globalProductSales[p._id] || 0;
                        const qty = (Number(p.stock) || 0) + sold;
                        sBuy += qty * (Number(p.buyingPrice) || Number(p.price) || 0);
                        sSell += qty * (Number(p.price) || 0);
                      });
                      const sProfit = sSell - sBuy;

                      return (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-700/20 group-hover:border-blue-500/30 transition-all">
                          <p className="text-[9px] font-black uppercase opacity-50 mb-3 text-center text-blue-600 tracking-widest">{supplierProducts.length} Items Managed</p>
                          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-blue-100 dark:divide-blue-800">
                            <div>
                              <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Total Buy</p>
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">Rs.{sBuy.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Total Sell</p>
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">Rs.{sSell.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black uppercase text-purple-400 mb-0.5">Profit</p>
                              <p className="text-[11px] font-black text-purple-600">Rs.{sProfit.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={() => setSelectedSupplierForLots(s)}
                      className="col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      Explore Deliveries
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSupplierFormData(s); setEditSupplierId(s._id); setShowSupplierForm(true); }}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10"
                    >
                      <Pencil size={14} /> Edit Profile
                    </button>
                    {userRole === 'superadmin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s._id); }}
                        className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-rose-100 transition-all shadow-sm"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateSupplierStatus(s._id, s.status === 'Active' ? 'Inactive' : 'Active'); }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg ${s.status === 'Active' ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10'
                        }`}
                    >
                      {s.status === 'Active' ? <Ban size={14} /> : <ShieldCheck size={14} />} {s.status === 'Active' ? 'Restrict' : 'Authorize'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSuppliers.length}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
              darkMode={darkMode}
            />
          </div>
        ) : (
          <div className={`${cardClass} rounded-3xl border-2 overflow-hidden shadow-2xl shadow-black/5 animate-in fade-in duration-700`}>
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className={`${darkMode ? "bg-gray-800/50 text-gray-200 border-gray-700" : "bg-gray-50 text-gray-700 border-gray-100"} font-black text-[10px] uppercase tracking-widest border-b-2`}>
                  <th className="py-5 px-8 text-emerald-600">Supplier Identity</th>
                  <th className="py-5 px-6">Category</th>
                  <th className="py-5 px-6">Contact Channels</th>
                  <th className="py-5 px-6 text-center">Live SKUs</th>
                  <th className="py-5 px-6 text-center">Financial Overview</th>
                  <th className="py-5 px-6 text-center">Status</th>
                  <th className="py-5 px-8 text-right">Operational Controls</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((s) => {
                  const supplierProducts = products.filter(p =>
                    (p.supplier && p.supplier === s._id) ||
                    (p.supplierName && s.name && p.supplierName.toLowerCase().trim() === s.name.toLowerCase().trim())
                  );
                  let sBuy = 0; let sSell = 0;
                  supplierProducts.forEach(p => {
                    const sold = globalProductSales[p._id] || 0;
                    const qty = (Number(p.stock) || 0) + sold;
                    sBuy += qty * (Number(p.buyingPrice) || Number(p.price) || 0);
                    sSell += qty * (Number(p.price) || 0);
                  });
                  const sProfit = sSell - sBuy;

                  return (
                    <tr key={s._id} className={`${darkMode ? "hover:bg-emerald-900/10 border-gray-700 text-gray-300" : "hover:bg-emerald-50/50 border-gray-100 text-gray-800"} border-b transition-all group`}>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all text-lg">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-lg uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors ${darkMode ? "text-white" : "text-black"}`}>{s.name}</span>
                            <span className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1">Global Partner</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[11px] font-bold">
                            <Mail size={12} className="text-emerald-500 opacity-50" />
                            <span>{s.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold">
                            <Phone size={12} className="text-emerald-500 opacity-50" />
                            <span>{s.phone || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-lg font-black text-blue-600">
                          {supplierProducts.length}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-bold w-32 mx-auto">
                            <span className="opacity-50">Buy:</span>
                            <span className="text-slate-700 dark:text-slate-300">Rs.{sBuy.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold w-32 mx-auto">
                            <span className="opacity-50">Sell:</span>
                            <span className="text-slate-700 dark:text-slate-300">Rs.{sSell.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black w-32 mx-auto mt-0.5 pt-0.5 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-purple-500 opacity-70">Profit:</span>
                            <span className="text-purple-600">Rs.{sProfit.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 text-white shadow-lg'
                          }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSupplierForLots(s)}
                            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          >
                            Network
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSupplierFormData(s); setEditSupplierId(s._id); setShowSupplierForm(true); }}
                            className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all hover:scale-110"
                            title="Update Profile"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateSupplierStatus(s._id, s.status === 'Active' ? 'Inactive' : 'Active'); }}
                            className={`p-2.5 rounded-xl transition-all hover:scale-110 ${s.status === 'Active' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                            title={s.status === 'Active' ? 'Block Partner' : 'Unblock Partner'}
                          >
                            {s.status === 'Active' ? <Ban size={18} /> : <ShieldCheck size={18} />}
                          </button>
                          {userRole === 'superadmin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s._id); }}
                              className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110"
                              title="Remove Partner"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSuppliers.length}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
              darkMode={darkMode}
            />
          </div>
        )
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">

          <div className="mb-6">
            <h2 className={`text-4xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              {selectedSupplierForLots.name}
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              {selectedSupplierForLots.email || "no-email@domain.com"} • {selectedSupplierForLots.phone || "No contact"}
            </p>
          </div>

          {(() => {
            const amountPaid = Number(selectedSupplierForLots.amountPaid || 0);
            const remainingDue = totalBuyAmount - amountPaid;

            return (
              <div className="space-y-6 mb-8">

                {/* Row 2: Supplier Ledger / Payment Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Buy Card */}
                  <div className={`${cardClass} p-6 rounded-[2rem] flex items-center justify-between border border-orange-500/10 shadow-lg shadow-orange-500/5`}>
                    <div>
                      <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1.5">Total Purchase (Buy)</p>
                      <h3 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>रु {totalBuyAmount.toLocaleString()}</h3>
                      <p className="text-[11px] font-bold text-gray-500 mt-1">Total amount of stock received</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-orange-950 text-orange-400" : "bg-orange-50 text-orange-500"}`}>
                      <Truck size={22} />
                    </div>
                  </div>

                  {/* Amount Paid Card */}
                  <div className={`${cardClass} p-6 rounded-[2rem] flex items-center justify-between border border-emerald-500/15 shadow-lg shadow-emerald-500/5 group hover:border-emerald-500/40 transition-all`}>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">Paid to Supplier</p>
                      <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">रु {amountPaid.toLocaleString()}</h3>
                      <button
                        onClick={() => {
                          setInitialPaymentSupplierId(selectedSupplierForLots._id);
                          setShowPaymentModal(true);
                        }}
                        className="text-[10px] font-black uppercase text-slate-400 group-hover:text-emerald-500 transition-all mt-1 flex items-center gap-1"
                      >
                        💳 Record Payment
                      </button>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                      <span className="text-xl">💳</span>
                    </div>
                  </div>

                  {/* Remaining Due Card */}
                  {(() => {
                    const isAdvanced = remainingDue < 0;
                    const isFullyPaid = remainingDue === 0;
                    const isDue = remainingDue > 0;
                    
                    let borderColor = "border-green-500/20 shadow-green-500/5";
                    let textColor = "text-green-600 dark:text-green-400";
                    let title = "Ledger Status";
                    let value = "Fully Paid, No Due";
                    let subtitle = "No outstanding dues";

                    if (isAdvanced) {
                      borderColor = "border-blue-500/20 shadow-blue-500/5";
                      textColor = "text-blue-600 dark:text-blue-400";
                      title = "Advanced Payment";
                      value = `रु ${Math.abs(remainingDue).toLocaleString()} (Adv)`;
                      subtitle = "Overpaid amount";
                    } else if (isDue) {
                      borderColor = "border-rose-500/20 shadow-rose-500/5";
                      textColor = "text-rose-600 dark:text-rose-400";
                      title = "Remaining Due";
                      value = `रु ${remainingDue.toLocaleString()}`;
                      subtitle = "Outstanding balance";
                    }

                    return (
                      <div className={`${cardClass} p-6 rounded-[2rem] flex items-center justify-between border ${borderColor} shadow-lg`}>
                        <div>
                          <p className={`text-[10px] font-black ${textColor} uppercase tracking-widest mb-1.5`}>
                            {title}
                          </p>
                          <h3 className={`text-3xl font-black ${textColor}`}>
                            {value}
                          </h3>
                          <p className="text-[11px] font-bold text-gray-500 mt-1">
                            {subtitle}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isDue ? (darkMode ? "bg-rose-950 text-rose-400" : "bg-rose-50 text-rose-500") :
                          isAdvanced ? (darkMode ? "bg-blue-950 text-blue-400" : "bg-blue-50 text-blue-500") :
                          (darkMode ? "bg-emerald-950 text-emerald-400" : "bg-green-50 text-green-500")
                        }`}>
                          <span className="text-xl">{isDue ? "⏳" : isAdvanced ? "💸" : "✅"}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          <div className={`${cardClass} p-8 rounded-[2rem]`}>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${darkMode ? "text-white" : "text-slate-800"}`}>Supplier Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{selectedSupplierForLots.address || "Kathmandu, Nepal"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Terms</p>
                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{selectedSupplierForLots.paymentTerms || "30 days"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Credit Limit</p>
                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>रु {selectedSupplierForLots.creditLimit ? selectedSupplierForLots.creditLimit.toLocaleString() : "10,000"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${darkMode ? "bg-emerald-950/50 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                  }`}>
                  {selectedSupplierForLots.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className={`${cardClass} rounded-[2rem] overflow-hidden mb-12`}>
            <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-800"}`}>Batch Management</h4>
              <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Track all product batches from this supplier</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead>
                  <tr className={`text-[10px] font-black border-b uppercase tracking-widest ${darkMode ? "bg-gray-900/50 border-gray-700 text-gray-400" : "bg-slate-50 border-gray-100 text-gray-500"
                    }`}>
                    <th className="py-4 px-6">Product Name</th>
                    <th className="py-4 px-6 text-center">Batch Number</th>
                    <th className="py-4 px-6 text-center">Date</th>
                    <th className="py-4 px-6 text-center">Quantity</th>
                    <th className="py-4 px-6 text-center">Buy Price</th>
                    <th className="py-4 px-6 text-center">Sell Price</th>
                    <th className="py-4 px-6 text-center">Sold</th>
                    <th className="py-4 px-6 text-center">Remaining</th>
                    <th className="py-4 px-6 text-center">Total Buy</th>
                    <th className="py-4 px-6 text-center">Total Sell</th>
                    <th className="py-4 px-6 text-center">Profit</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-bold ${darkMode ? "divide-gray-700 text-slate-300" : "divide-gray-100 text-slate-700"
                  }`}>
                  {productRows.map((row) => (
                    <tr key={row._id} className={`transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-slate-50/50"
                      }`}>
                      <td className={`py-4 px-6 font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{row.name}</td>
                      <td className="py-4 px-6 text-center text-xs text-gray-400 font-mono"># {row.batchNo}</td>
                      <td className="py-4 px-6 text-center text-xs text-gray-400">{row.date}</td>
                      <td className="py-4 px-6 text-center">{row.quantity}</td>
                      <td className="py-4 px-6 text-center">रु {row.buyPrice.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">रु {row.sellPrice.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-black text-[10px] ${darkMode ? "bg-green-950/40 text-emerald-400" : "bg-green-50 text-green-600"
                          }`}>
                          {row.sold}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-black text-[10px] ${row.remaining <= 5
                          ? (darkMode ? "bg-rose-950/40 text-rose-400" : "bg-rose-50 text-rose-600")
                          : (darkMode ? "bg-blue-950/40 text-blue-400" : "bg-blue-50 text-blue-600")
                          }`}>
                          {row.remaining}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">रु {row.totalBuy.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">रु {row.totalSell.toLocaleString()}</td>
                      <td className={`py-4 px-6 text-center font-black ${row.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        रु {row.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  <tr className={`font-black text-sm border-t-2 ${darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-slate-50 border-gray-200 text-slate-900"
                    }`}>
                    <td className="py-5 px-6 uppercase tracking-widest text-xs" colSpan="3">Totals:</td>
                    <td className="py-5 px-6 text-center">{productRows.reduce((sum, r) => sum + r.quantity, 0)}</td>
                    <td className="py-5 px-6" colSpan="4"></td>
                    <td className="py-5 px-6 text-center">रु {totalBuyAmount.toLocaleString()}</td>
                    <td className="py-5 px-6 text-center">रु {totalSellAmount.toLocaleString()}</td>
                    <td className={`py-5 px-6 text-center ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      रु {netProfit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <SupplierPaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        suppliers={suppliers}
        initialSupplierId={initialPaymentSupplierId}
        handleRecordPayment={handleRecordPayment}
        darkMode={darkMode}
        inputClass={darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300 text-slate-800"}
      />
    </div>
  );
};

export default SuppliersTab;
