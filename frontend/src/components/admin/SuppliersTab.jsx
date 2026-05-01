import React from "react";
import { Truck, Phone, Mail, FileText, Plus, FileSpreadsheet, Barcode, Clock, Trash2, Pencil, Package, Search, List, Grid, Ban, ShieldCheck, Edit3 } from "lucide-react";

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
  darkMode,
  cardClass
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState("cards");

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              className={`pl-11 pr-4 py-3 rounded-2xl text-xs font-bold w-64 transition-all outline-none border-2 ${
                darkMode 
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-1000">
          <div className={`${cardClass} p-8 rounded-[2.5rem] border shadow-2xl shadow-emerald-500/5 flex items-center gap-8 group hover:border-emerald-500/30 transition-all overflow-hidden relative`}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/20 group-hover:scale-110 transition-transform duration-500">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">Total Buying Price</p>
              <h3 className="text-4xl font-black tracking-tighter text-emerald-600">
                Rs. {Object.values(supplierDetailData).reduce((total, data) => {
                  return total + (data.lots?.reduce((lTotal, lot) => {
                    return lTotal + lot.items.reduce((iTotal, item) => iTotal + (Number(item.purchasePrice || 0) * Number(item.quantityReceived || 0)), 0);
                  }, 0) || 0);
                }, 0).toLocaleString()}
              </h3>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1">Total amount payable across all partners</p>
            </div>
          </div>

          <div className={`${cardClass} p-8 rounded-[2.5rem] border shadow-2xl shadow-blue-500/5 flex items-center gap-8 group hover:border-blue-500/30 transition-all overflow-hidden relative`}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-2xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
              <Package size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">Total Managed Products</p>
              <h3 className="text-4xl font-black tracking-tighter text-blue-600">
                {products.length} <span className="text-xl opacity-40">SKUs</span>
              </h3>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1">Unique catalog entries across all partners</p>
            </div>
          </div>
        </div>
      )}

      {!selectedSupplierForLots ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuppliers.map((s, idx) => (
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {s.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {s.category}
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-3xl font-black tracking-tighter uppercase truncate mb-1 transition-colors duration-300 ${darkMode ? "text-white group-hover:text-emerald-400" : "text-black group-hover:text-emerald-600"}`}>
                    {s.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">Procurement Partner</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500/70 transition-colors">
                      <Mail size={14} className="text-emerald-600/60" />
                      <span className="text-xs font-bold truncate">{s.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500/70 transition-colors">
                      <Phone size={14} className="text-emerald-600/60" />
                      <span className="text-xs font-bold">{s.phone || 'No phone provided'}</span>
                    </div>
                  </div>

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-700/20 group-hover:border-blue-500/30 transition-all text-center">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-1">Linked Products</p>
                      <p className="text-lg font-black text-blue-600">
                        {products.filter(p => p.supplier === s._id || p.supplierName === s.name).length} Items
                      </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedSupplierForLots(s)}
                    className="col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    View Network Detail
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSupplierFormData(s); setEditSupplierId(s._id); setShowSupplierForm(true); }}
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10"
                  >
                    <Edit3 size={14} /> Update
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUpdateSupplierStatus(s._id, s.status === 'Active' ? 'Inactive' : 'Active'); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg ${
                      s.status === 'Active' ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10'
                    }`}
                  >
                    {s.status === 'Active' ? <Ban size={14} /> : <ShieldCheck size={14} />} {s.status === 'Active' ? 'Block' : 'Unblock'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s._id); }}
                    className="col-span-2 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-600 transition-all mt-1 shadow-lg shadow-red-500/10"
                  >
                    <Trash2 size={14} /> Remove Partner
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${cardClass} rounded-3xl border-2 overflow-hidden shadow-2xl shadow-black/5 animate-in fade-in duration-700`}>
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className={`${darkMode ? "bg-gray-800/50 text-gray-200 border-gray-700" : "bg-gray-50 text-gray-700 border-gray-100"} font-black text-[10px] uppercase tracking-widest border-b-2`}>
                  <th className="py-5 px-8 text-emerald-600">Supplier Identity</th>
                  <th className="py-5 px-6">Category</th>
                  <th className="py-5 px-6">Contact Channels</th>
                  <th className="py-5 px-6 text-center">Batches</th>
                  <th className="py-5 px-6 text-center">Live SKUs</th>
                  <th className="py-5 px-6 text-center">Status</th>
                  <th className="py-5 px-8 text-right">Operational Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s) => (
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
                      <span className="text-lg font-black text-emerald-600">{supplierDetailData[s._id]?.lots?.length || 0}</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-lg font-black text-blue-600">
                        {products.filter(p => p.supplier === s._id || p.supplierName === s.name).length}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 text-white shadow-lg'
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
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s._id); }}
                          className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110"
                          title="Remove Partner"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-24 pt-4">
          <div className={`${cardClass} p-10 rounded-3xl border shadow-2xl shadow-black/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-700`}>
            <div className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none">
              <img src="/suppliers_header_bg_1777222482243.png" alt="Logistics" className="w-full h-full object-cover" />
            </div>
            <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/30 font-black text-5xl animate-bounce-subtle">
                  {selectedSupplierForLots.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-5xl font-black tracking-tighter uppercase leading-none mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                    {selectedSupplierForLots.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      {selectedSupplierForLots.category}
                    </span>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Procurement Partner</p>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-500/30 transition-all">
                      <Phone size={12} className="text-emerald-600" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{selectedSupplierForLots.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-500/30 transition-all">
                      <Mail size={12} className="text-emerald-600" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{selectedSupplierForLots.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">


            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-100 dark:border-gray-800 relative z-10">
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:scale-105 transition-transform duration-500 shadow-sm">
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Total Buying Price</p>
                <p className="text-2xl font-black text-slate-900 dark:text-emerald-400">
                  Rs. {(() => {
                    const lots = supplierDetailData[selectedSupplierForLots._id]?.lots || [];
                    const total = lots.reduce((sum, lot) => {
                      const lotTotal = (lot.items || []).reduce((lSum, it) => {
                        const q = Number(it.quantityReceived) || 0;
                        const p = Number(it.purchasePrice) || 0;
                        return lSum + (q * p);
                      }, 0);
                      return sum + lotTotal;
                    }, 0);
                    return total.toLocaleString();
                  })()}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 hover:scale-105 transition-transform duration-500 shadow-sm">
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Total Units Received</p>
                <p className="text-2xl font-black text-slate-900 dark:text-blue-400">
                  {(() => {
                    const lots = supplierDetailData[selectedSupplierForLots._id]?.lots || [];
                    const totalUnits = lots.reduce((sum, lot) => {
                      return sum + (lot.items || []).reduce((lSum, it) => lSum + (Number(it.quantityReceived) || 0), 0);
                    }, 0);
                    return totalUnits.toLocaleString();
                  })()} Units
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/30 hover:scale-105 transition-transform duration-500 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-1">Portfolio Status</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-400">{selectedSupplierForLots.status}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4 no-print">
              <button 
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
              >
                <FileText size={16} />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>



          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 text-slate-900 dark:text-white">Procurement Intelligence</h4>
              <div className="h-[1px] flex-1 mx-8 bg-gray-100 dark:bg-gray-800 opacity-50" />
              <p className="text-[10px] font-black opacity-30 uppercase">{supplierDetailData[selectedSupplierForLots._id]?.lots?.length || 0} Batches Tracked</p>
            </div>

            {(() => {
              const detail = supplierDetailData[selectedSupplierForLots._id];
              if (!detail || detail.lots.length === 0) {
                return (
                  <div className={`${cardClass} p-20 text-center rounded-3xl border-dashed border-2 opacity-20`}>
                    <FileSpreadsheet size={64} className="mx-auto mb-6 text-emerald-600/20" />
                    <p className="text-base font-black uppercase tracking-widest">No Deliveries Found</p>
                  </div>
                );
              }

              return (
                <div className={`${cardClass} rounded-3xl border shadow-xl shadow-black/5 overflow-hidden animate-in slide-in-from-bottom-8 duration-1000`}>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className={`text-[10px] font-black uppercase tracking-widest opacity-40 border-b ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50/50 border-gray-100"}`}>
                          <th className="py-5 px-8">Received Date</th>
                          <th className="py-5 px-6">Lot ID</th>
                          <th className="py-5 px-6">Product Details</th>
                          <th className="py-5 px-6 text-center">SKU / ID</th>
                          <th className="py-5 px-6 text-center">Barcode</th>
                          <th className="py-5 px-6 text-center">Qty</th>
                          <th className="py-5 px-6 text-center">Buy Price</th>
                          <th className="py-5 px-6 text-center">MRP (Sell)</th>
                          <th className="py-5 px-6 text-center text-emerald-600">Margin</th>
                          <th className="py-5 px-6 text-center font-bold">Total Cost</th>
                          <th className="py-5 px-6 text-center">Expiry</th>
                          <th className="py-5 px-8 text-right no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.lots.flatMap(lot =>
                          lot.items.map((it, idx) => {
                            const prod = products.find(p => p._id === it.product?._id || p._id === it.product);
                            return (
                              <tr key={`${lot._id}-${idx}`} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-emerald-500/[0.03] transition-colors">
                                <td className="py-5 px-8">
                                  <p className="text-[10px] font-black opacity-60 uppercase">{new Date(lot.receivedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </td>
                                <td className="py-5 px-6">
                                  <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-black text-[10px] border border-emerald-200/50">
                                    {lot.lotNumber}
                                  </span>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-600/20">
                                      {prod?.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                      <p className="font-black text-sm text-slate-800 dark:text-white">{prod?.name || 'Unknown Product'}</p>
                                      <p className="text-[9px] opacity-40 font-bold uppercase tracking-tight">{prod?.category || 'General'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-center font-bold text-[11px] opacity-50">
                                  {prod?.sku || prod?.pid || 'N/A'}
                                </td>
                                <td className="py-5 px-6 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Barcode size={12} className="opacity-30" />
                                    <span className="text-[10px] font-bold opacity-60 font-mono">{prod?.barcode || 'No Code'}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-center font-black">{it.quantityReceived}</td>
                                <td className="py-5 px-6 text-center font-bold text-emerald-600">Rs. {it.purchasePrice.toLocaleString()}</td>
                                <td className="py-5 px-6 text-center font-bold text-blue-600">Rs. {prod?.mrp?.toLocaleString() || '0'}</td>
                                <td className="py-5 px-6 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                                      +{(((prod?.mrp || 0) - it.purchasePrice) / it.purchasePrice * 100).toFixed(1)}%
                                    </span>
                                    <p className="text-[9px] font-bold opacity-30 mt-0.5">EST. ROI</p>
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-center font-black text-slate-900 dark:text-white">Rs. {(Number(it.quantityReceived || 0) * Number(it.purchasePrice || 0)).toLocaleString()}</td>
                                <td className="py-5 px-6 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Clock size={11} className={`opacity-30 ${it.expiryDate && new Date(it.expiryDate) < new Date() ? 'text-red-500 opacity-100' : ''}`} />
                                    <span className={`text-[10px] font-bold ${it.expiryDate && new Date(it.expiryDate) < new Date() ? 'text-red-500' : 'opacity-50'}`}>
                                      {it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : '—'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-8 text-right no-print">
                                  <button
                                    onClick={() => handleDeleteLot(lot._id, selectedSupplierForLots._id)}
                                    className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center ml-auto"
                                    title="Delete this entry"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersTab;
