import React, { useState, useEffect } from "react";
import {
  X,
  Scan,
  Camera,
  Package,
  Plus
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";

export default function BarcodeScannerInvoiceModal({
  darkMode,
  onClose,
  products,
  onSaveInvoice,
  profile,
  taxRate = 0.13,
  defaultDiscountRate = 10,
  lowStockThreshold = 10,
  userRole,
  initialOrder = null,
  loading = false
}) {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    if (initialOrder) {
      const p = products.find(prod =>
        (initialOrder.productId && prod._id === initialOrder.productId) ||
        (prod.name && initialOrder.product && prod.name.toLowerCase().trim() === initialOrder.product.toLowerCase().trim())
      );
      if (p) {
        return [{
          cartKey: p._id || p.barcode || p.name,
          product: p.name,
          productId: p._id,
          batchNo: p.batchNo || "N/A",
          barcode: p.barcode || "",
          price: (initialOrder.totalPrice != null ? Number(initialOrder.totalPrice) : Number(initialOrder.amount || 0)) / (initialOrder.quantity || 1) || p.price,
          qty: initialOrder.quantity || 1,
          maxStock: p.stock,
          image: p.image,
        }];
      } else {
        // Fallback: If product was deleted from inventory but exists in the order
        return [{
          cartKey: initialOrder.productId || initialOrder.product || "unknown-product",
          product: initialOrder.product || "Unknown Product",
          productId: initialOrder.productId || null,
          batchNo: "N/A",
          barcode: "",
          price: (initialOrder.totalPrice != null ? Number(initialOrder.totalPrice) : Number(initialOrder.amount || 0)) / (initialOrder.quantity || 1) || 0,
          qty: initialOrder.quantity || 1,
          maxStock: 9999,
          image: null,
        }];
      }
    }
    return [];
  });
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || initialOrder?.customer?.name || (typeof initialOrder?.customer === 'string' ? initialOrder.customer : null) || profile?.name || "");
  const [customerEmail, setCustomerEmail] = useState(initialOrder?.customerEmail || initialOrder?.customer?.email || "");
  const [memberId, setMemberId] = useState(initialOrder?.customer?.membershipId || "");
  const [discountPercent, setDiscountPercent] = useState(() => {
    if (initialOrder) return 10;
    const val = defaultDiscountRate;
    return (val > 0 && val < 1) ? val * 100 : val;
  });

  const [taxPercent, setTaxPercent] = useState(() => {
    const val = taxRate;
    return (val > 0 && val < 1) ? val * 100 : val;
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCustomerConfirmed, setIsCustomerConfirmed] = useState(!!initialOrder);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [panNumber, setPanNumber] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);

  useEffect(() => {
    setAddQuantity(1);
  }, [scannedProduct]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleScan = (decodedText) => {
    if (decodedText) {
      setScanning(false);
      setBarcode(decodedText);
      checkProduct(decodedText);
    }
  };

  useEffect(() => {
    let html5QrCode = null;

    if (scanning) {
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleScan(decodedText);
            html5QrCode.stop().then(() => setScanning(false)).catch(console.error);
          },
          (errorMessage) => {
            // silent failure for frame processing
          }
        ).catch((err) => {
          console.error("Camera start failed:", err);
          alert("Failed to start camera. Please ensure you have granted camera permissions.");
          setScanning(false);
        });
      }, 100);
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const checkProduct = (code) => {
    if (!code) return;
    setScannedProduct(null);

    const found = products.find(
      (p) =>
        p.barcode === code ||
        p.name.toLowerCase().includes(code.toLowerCase())
    );

    if (found) {
      setScannedProduct(found);
    } else {
      alert("⚠️ Product not found!");
    }
  };

  const addToCart = () => {
    if (!scannedProduct) return;
    if (scannedProduct.stock <= 0) return alert("⚠️ Out of Stock!");

    const uniqueKey = scannedProduct._id || scannedProduct.barcode || scannedProduct.name;
    const qty = Math.max(1, Math.floor(addQuantity)) || 1;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.cartKey === uniqueKey);
      if (existing) {
        if (existing.qty + qty > scannedProduct.stock) {
          alert("⚠️ Stock Limit!");
          return prevCart;
        }
        return prevCart.map(item =>
          item.cartKey === uniqueKey ? { ...item, qty: item.qty + qty } : item
        );
      }
      if (qty > scannedProduct.stock) {
        alert("⚠️ Stock Limit!");
        return prevCart;
      }
      return [
        ...prevCart,
        {
          cartKey: uniqueKey,
          product: scannedProduct.name,
          productId: scannedProduct._id,
          batchNo: scannedProduct.batchNo || "N/A",
          barcode: scannedProduct.barcode || "",
          price: scannedProduct.price,
          qty: qty,
          maxStock: scannedProduct.stock,
          image: scannedProduct.image,
        },
      ];
    });
    setAddQuantity(1);
    setScannedProduct(null);
    setBarcode("");
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter((item) => item.cartKey !== cartKey));
  };

  const updateQty = (cartKey, newQty) => {
    setCart(prev =>
      prev.map((item) => {
        if (item.cartKey === cartKey) {
          const clampedQty = Math.max(1, newQty);
          if (clampedQty > item.maxStock) {
            alert(`⚠️ Only ${item.maxStock} units available in stock!`);
            return { ...item, qty: item.maxStock };
          }
          return { ...item, qty: clampedQty };
        }
        return item;
      })
    );
  };

  const handleConfirmCustomer = () => {
    if (!customerName.trim()) {
      return alert("❌ Customer Name Required!");
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    if (panNumber && !panRegex.test(panNumber)) {
      return alert("❌ Invalid PAN format! Use 5 letters, 4 digits, 1 letter.");
    }
    if (memberId.trim() !== "" && memberId.length !== 10) {
      return alert("❌ Member ID must be 10 digits!");
    }
    setIsCustomerConfirmed(true);
  };

  const subTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const discountAmount = (subTotal * (discountPercent || 0)) / 100;
  const taxAmount = (subTotal - discountAmount) * ((taxPercent || 0) / 100);
  const grandTotal = subTotal - discountAmount + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return alert("🛒 Cart is empty!");
    if (!isCustomerConfirmed) return alert("⚠️ Confirm customer first!");

    onSaveInvoice({
      sourceOrderId: initialOrder?._id,
      customer: customerName,
      membershipId: memberId,
      customerEmail: customerEmail,
      date: invoiceDate,
      items: cart,
      subtotal: subTotal,
      discount: discountAmount,
      tax: taxAmount,
      grandTotal: grandTotal,
      paymentMethod,
      discountRate: discountPercent,
      taxRate: taxPercent,
    });
    onClose();
  };

  const inputClass = darkMode
    ? "w-full border border-gray-600 bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
    : "w-full border border-gray-200 bg-white text-gray-800 p-2 rounded focus:ring-2 focus:ring-green-500 outline-none";

  const labelClass = darkMode
    ? "block text-xs font-bold text-gray-400 uppercase mb-1"
    : "block text-xs font-bold text-gray-500 uppercase mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`${darkMode
          ? "bg-gray-800 text-white border border-gray-700"
          : "bg-white text-gray-800"
          } rounded-2xl w-full max-w-6xl shadow-2xl max-h-[95vh] overflow-hidden flex`}
      >
        {/* LEFT - Scanner */}
        <div
          className={`w-1/2 p-6 border-r ${darkMode ? "border-gray-700" : "border-gray-200"
            } overflow-y-auto`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold uppercase flex items-center gap-2">
              <Scan size={24} className="text-green-600" />
              Barcode Scanner
            </h3>
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Customer Details */}
          <div
            className={`p-4 rounded-xl mb-6 border-2 ${isCustomerConfirmed
              ? "bg-green-50 border-green-400"
              : darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-green-50 border-green-200"
              }`}
          >
            <h4 className="font-bold text-sm mb-3 flex justify-between">
              1. Customer Details
              {isCustomerConfirmed && (
                <span className="text-green-600 bg-white px-2 py-1 rounded text-xs">
                  ✅ Verified
                </span>
              )}
            </h4>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  className={inputClass}
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isCustomerConfirmed}
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass}>Member ID</label>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="Optional (10 digits)"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    disabled={isCustomerConfirmed}
                  />
                </div>
                <div className="w-1/2">
                  <label className={labelClass}>Customer Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Email for Receipt"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={isCustomerConfirmed}
                  />
                </div>
              </div>

              {!isCustomerConfirmed ? (
                <button
                  onClick={handleConfirmCustomer}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
                >
                  Confirm Customer
                </button>
              ) : (
                <button
                  onClick={() => setIsCustomerConfirmed(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600"
                >
                  ✏️ Edit Details
                </button>
              )}
            </div>
          </div>

          {/* Scanner */}
          <div
            className={`p-4 rounded-xl border ${darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-200"
              }`}
          >
            <h4 className="font-bold text-sm mb-3">2. Scan Products</h4>

            <button
              onClick={() => setScanning(!scanning)}
              className={`w-full py-3 rounded-lg text-white font-bold mb-4 flex items-center justify-center gap-2 ${scanning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {scanning ? (
                <>
                  <X size={18} /> Stop Camera
                </>
              ) : (
                <>
                  <Camera size={18} /> Start Scanner
                </>
              )}
            </button>

            {scanning && (
              <div className="bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl border-4 border-green-500/20 group animate-in fade-in zoom-in duration-300 min-h-[300px]">
                <div id="reader"></div>
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2 shadow-lg z-10 pointer-events-none">
                  <div className="w-2 h-2 bg-white rounded-full" /> LIVE CAMERA READY
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                className={inputClass}
                placeholder="Barcode or product name..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkProduct(barcode)}
              />
              <button
                onClick={() => checkProduct(barcode)}
                className="bg-green-600 text-white px-4 rounded-lg font-bold hover:bg-green-700"
              >
                Search
              </button>
            </div>

            {scannedProduct && (
              <div
                className={`p-4 rounded-xl border-2 ${darkMode
                  ? "bg-green-900/30 border-green-700"
                  : "bg-green-50 border-green-300"
                  }`}
              >
                <div className="flex gap-3">
                  {scannedProduct.image ? (
                    <img
                      src={scannedProduct.image}
                      alt={scannedProduct.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                    >
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-bold text-lg">
                          {scannedProduct.name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {scannedProduct.category}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${scannedProduct.stock < lowStockThreshold
                          ? "text-red-500"
                          : "text-green-600"
                          }`}
                      >
                        Stock: {scannedProduct.stock}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={scannedProduct.stock}
                          value={addQuantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAddQuantity(Math.min(scannedProduct.stock, Math.max(1, val)));
                          }}
                          className="w-16 text-center border rounded px-1 py-0.5"
                          style={{ backgroundColor: darkMode ? '#2d3748' : '#fff', color: darkMode ? '#fff' : '#000' }}
                        />
                      </div>
                      <button
                        onClick={addToCart}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 text-sm"
                      >
                        <Plus size={16} /> Add
                      </button>

                    </div>
                  </div>
                </div>
              </div>

            )}

            {/* Quick Select */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                Quick Select:
              </p>
              <div className="flex flex-wrap gap-2">
                {products.filter(p => p.stock > 0).slice(0, 6).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setScannedProduct(p);
                      setBarcode(p.barcode || p.name);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 ${darkMode
                      ? "border-gray-600 hover:bg-gray-600"
                      : "border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    )}
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Invoice Preview */}
        <div
          className={`w-1/2 p-6 flex flex-col overflow-y-auto custom-scrollbar ${darkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
          style={{ maxHeight: '95vh' }}
        >
          <div className="text-center border-b pb-4 mb-3">
            <h1 className="text-xl font-extrabold tracking-wide uppercase">Stock Inventory Management System</h1>
            <p className="text-xs text-gray-500">Kathmandu, Nepal</p>
            <p className="text-xs text-gray-400">VAT No: 300142084 &nbsp;|&nbsp; PAN No: —</p>
            <div className={`mt-2 inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
              Tax Invoice
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px]">Bill To</p>
              <p className="font-bold">{customerName || "Walk-in Customer"}</p>
              {memberId && <p className="text-gray-500">Member: {memberId}</p>}
              {panNumber && <p className="text-gray-500">PAN: {panNumber}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-400 font-bold uppercase text-[9px]">Invoice Date</p>
              <input
                type="date"
                value={invoiceDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={`text-xs font-bold rounded-lg px-2 py-1 border mt-0.5 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              />
              <p className="text-gray-400 font-bold uppercase text-[9px] mt-1">Transaction Date</p>
              <p className="font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Cart List - Part of the main scrollable column now */}
          <div className="mb-4 border-b border-gray-100 pb-2">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-inherit z-10">
                <tr className={`border-b-2 text-xs ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center text-[9px] text-gray-400">Batch</th>
                  <th className="py-2 text-center">Price</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm italic">
                      Scan products to add to bill
                    </td>
                  </tr>
                ) : (
                  cart.map((item, index) => (
                    <tr key={index} className={`border-b text-sm ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <img src={item.image} alt="" className="w-6 h-6 rounded object-cover shadow-sm" />
                          )}
                          <div>
                            <span className="text-xs font-bold leading-none">{item.product}</span>
                            {item.batchNo && <p className="text-[8px] text-gray-400 font-mono">{item.batchNo}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 text-center text-[9px] text-gray-400 font-mono">{item.batchNo || '—'}</td>
                      <td className="py-2 text-center text-xs">Rs. {item.price}</td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.cartKey, item.qty - 1)} className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs">-</button>
                          <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.cartKey, item.qty + 1)} className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs">+</button>
                        </div>
                      </td>
                      <td className="py-2 text-right font-bold text-xs">Rs. {(item.price * item.qty).toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => removeFromCart(item.cartKey)} className="text-red-500 hover:text-red-700">×</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals - Compressed for visibility */}
          <div className={`p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-inner`}>
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 block">Disc %</label>
                  <input
                    type="number"
                    className={`w-full border border-gray-100 bg-gray-50/50 text-gray-800 p-1 rounded outline-none text-[10px] font-bold ${userRole !== 'superadmin' ? 'opacity-50' : ''}`}
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    disabled={userRole !== 'superadmin'}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 block">Tax %</label>
                  <input
                    type="number"
                    className={`w-full border border-gray-100 bg-gray-50/50 text-gray-800 p-1 rounded outline-none text-[10px] font-bold ${userRole !== 'superadmin' ? 'opacity-50' : ''}`}
                    value={taxPercent}
                    onChange={e => setTaxPercent(Number(e.target.value))}
                    disabled={userRole !== 'superadmin'}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Amount</span>
                  <span className="font-bold">Rs. {subTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-amber-500">
                  <span>Tax / VAT ({taxPercent}%)</span>
                  <span>+ Rs. {taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-500 font-bold">
                  <span>Total Qty</span>
                  <span>{cart.reduce((s, i) => s + i.qty, 0)} pcs</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t pt-2 mt-2">
                  <span className={darkMode ? "text-white" : "text-slate-900"}>Net Amount</span>
                  <span className="text-green-600">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method selection in Scanner Modal */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Payment Method</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black transition-all ${paymentMethod === 'Cash' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                CASH
              </button>
              <button
                onClick={() => setPaymentMethod('eSewa')}
                className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black transition-all ${paymentMethod === 'eSewa' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                eSEWA
              </button>
              <button
                onClick={() => setPaymentMethod('Khalti')}
                className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black transition-all ${paymentMethod === 'Khalti' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                KHALTI
              </button>
            </div>
          </div>

          {cart.length > 0 && isCustomerConfirmed && (
            <div className="mt-4 bg-white p-3 rounded-2xl flex items-center justify-center gap-4 border border-slate-100 shadow-sm animate-in zoom-in duration-200">
              <div className="bg-slate-100 p-1 rounded-lg">
                <QRCodeCanvas
                  value={`PAY-TO-STORE|${paymentMethod}|${grandTotal.toFixed(2)}`}
                  size={64}
                  level="H"
                />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Scan to Verify</p>
                <p className="text-sm font-black text-slate-800">Rs. {grandTotal.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{paymentMethod} Payment</p>
              </div>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || !isCustomerConfirmed || cart.length === 0}
            className={`mt-4 w-full py-3 rounded-xl font-bold text-lg shadow-lg ${loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : (isCustomerConfirmed && cart.length > 0
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed")
              }`}
          >
            {loading ? "⌛ Processing..." : (isCustomerConfirmed
              ? "✅ Checkout & Generate Invoice"
              : "⚠️ Confirm Customer First")}
          </button>
        </div>
      </div>
    </div>
  );
}
