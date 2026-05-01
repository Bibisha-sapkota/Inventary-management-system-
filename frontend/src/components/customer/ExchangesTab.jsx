// src/components/customer/ExchangesTab.jsx

import React, { useState, useEffect, useMemo } from "react";
import Icons from "./Icons";

export default function ExchangesTab({ profile, products, orders, refreshProducts }) {
  const [exchanges, setExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    returnedProductId: "",
    newProductId: "",
    quantity: 1,
    reason: "",
    purchaseDate: "",
    billNumber: "",
    membershipId: ""
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      const res = await fetch(`${API_URL}/exchanges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExchanges(data.data);
      }
    } catch (err) {
      console.error("Error fetching exchanges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products to only those that were actually purchased
  const purchasedProducts = useMemo(() => {
    const purchasedNames = new Set();
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => purchasedNames.add(item.name));
      } else if (order.products) {
        order.products.forEach(pName => purchasedNames.add(pName));
      }
    });
    return products.filter(p => purchasedNames.has(p.name));
  }, [products, orders]);

  const [returnSearch, setReturnSearch] = useState("");
  const [wantedSearch, setWantedSearch] = useState("");

  const filteredReturnOptions = purchasedProducts.filter(p => 
    p.name.toLowerCase().includes(returnSearch.toLowerCase())
  );

  const filteredWantedOptions = products.filter(p => 
    p.name.toLowerCase().includes(wantedSearch.toLowerCase())
  );

  const handleRequestExchange = async (e) => {
    e.preventDefault();
    if (!formData.returnedProductId || !formData.newProductId || !formData.reason) {
      return alert("Please select products and provide a reason");
    }

    try {
      const res = await fetch(`${API_URL}/exchanges`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          type: "customer",
          customerName: profile.name,
          restocked: false,
        })
      });

      if (res.ok) {
        alert("Exchange request submitted successfully!");
        setShowForm(false);
        setFormData({ 
          returnedProductId: "", 
          newProductId: "", 
          quantity: 1, 
          reason: "", 
          purchaseDate: "", 
          billNumber: "", 
          membershipId: "" 
        });
        setReturnSearch("");
        setWantedSearch("");
        if (typeof refreshProducts === 'function') refreshProducts();
        fetchExchanges();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit request");
      }
    } catch (err) {
      alert("Error submitting request");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Exchanges</h2>
          <p className="text-gray-500">View and request product swaps</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
        >
          <Icons.Plus className="w-4 h-4" />
          Request Exchange
        </button>
      </div>

      {/* Exchanges List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Icons.Refresh className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : exchanges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No exchanges yet</h3>
          <p className="text-gray-500">You haven't requested any product exchanges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exchanges.map((ex) => (
            <div key={ex._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                  {new Date(ex.date).toLocaleDateString()}
                </span>
                {ex.billNumber && (
                   <span className="text-[10px] font-black text-emerald-500 uppercase">
                     Bill: {ex.billNumber}
                   </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50/80 rounded-2xl mb-4 border border-gray-100">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-red-500 font-bold uppercase mb-1 tracking-tighter">Returned</p>
                  <p className="font-bold text-gray-700 text-sm truncate">{ex.returnedProduct?.name}</p>
                  <p className="text-[9px] font-black text-gray-400 mt-0.5">ID: {ex.returnedProduct?.productId || 'N/A'}</p>
                </div>
                <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <Icons.Exchange className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-green-500 font-bold uppercase mb-1 tracking-tighter">Wanted</p>
                  <p className="font-bold text-gray-700 text-sm truncate">{ex.newProduct?.name}</p>
                  <p className="text-[9px] font-black text-gray-400 mt-0.5">ID: {ex.newProduct?.productId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Reason</p>
                <p className="text-sm text-gray-600 italic line-clamp-2">"{ex.reason}"</p>
              </div>

              {ex.purchaseDate && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                  <Icons.Dashboard className="w-3 h-3" />
                  Purchased on: {new Date(ex.purchaseDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-emerald-50/30 to-white">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">New Exchange</h3>
                <p className="text-sm text-gray-400 font-medium">Please provide original purchase details</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRequestExchange} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              
              {/* Purchase Details Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-400 ml-1">Purchase Date</label>
                  <input 
                    type="date"
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-400 ml-1">Bill Number</label>
                  <input 
                    type="text"
                    placeholder="INV-XXXX"
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all font-mono"
                    value={formData.billNumber}
                    onChange={(e) => setFormData({...formData, billNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* Membership ID */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-gray-400 ml-1">Membership ID (Optional)</label>
                <input 
                  type="text"
                  placeholder="Your membership code"
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                  value={formData.membershipId}
                  onChange={(e) => setFormData({...formData, membershipId: e.target.value})}
                />
              </div>

              {/* Item to Return */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-gray-400 ml-1">What are you returning?</label>
                <div className="relative group">
                  <Icons.Search className="absolute left-4 top-4 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search your purchased items..."
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100 no-scrollbar">
                  {filteredReturnOptions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-4 text-center">No matching purchased items found</p>
                  ) : (
                    filteredReturnOptions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, returnedProductId: p.id});
                          setReturnSearch(p.name);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border ${
                          formData.returnedProductId === p.id 
                            ? "bg-emerald-500 text-white font-bold border-emerald-600 shadow-md shadow-emerald-200 translate-x-1" 
                            : "bg-white text-gray-600 hover:bg-white hover:border-emerald-200 border-gray-50 hover:shadow-sm"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Item Wanted */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-gray-400 ml-1">What do you want instead?</label>
                <div className="relative group">
                  <Icons.Search className="absolute left-4 top-4 w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search all store products..."
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                    value={wantedSearch}
                    onChange={(e) => setWantedSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100 no-scrollbar">
                  {filteredWantedOptions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-4 text-center">No products found</p>
                  ) : (
                    filteredWantedOptions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, newProductId: p.id});
                          setWantedSearch(p.name);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border ${
                          formData.newProductId === p.id 
                            ? "bg-emerald-500 text-white font-bold border-emerald-600 shadow-md shadow-emerald-200 translate-x-1" 
                            : "bg-white text-gray-600 hover:bg-white hover:border-emerald-200 border-gray-50 hover:shadow-sm"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-gray-400 ml-1">Reason for Exchange</label>
                <textarea 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                  rows="3"
                  placeholder="Tell us why you'd like to swap this item..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>

              <div className="pt-6 flex gap-4 sticky bottom-0 bg-white pb-2">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 font-bold rounded-[1.5rem] hover:bg-gray-100 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-emerald-500 text-white font-black rounded-[1.5rem] hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
