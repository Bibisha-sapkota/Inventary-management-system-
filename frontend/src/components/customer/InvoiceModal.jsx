import React, { useState } from "react";
import Icons from "./Icons";

export default function InvoiceModal({
  cart,
  subtotal,
  discountAmount,
  tax,
  total,
  taxRate,
  discountRate,
  profile,
  onClose,
  onConfirm,
}) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const invoiceId = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString();

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(paymentMethod);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #10B981; margin: 0; }
          .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f9fafb; font-weight: 600; }
          .totals { text-align: right; }
          .totals p { margin: 5px 0; }
          .total-amount { font-size: 1.5em; color: #10B981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #10B981; margin: 0; font-size: 24px; text-transform: uppercase;">Stock <span style="color: #064e3b;">Inventory</span></h1>
          <p>Customer Portal Invoice</p>
        </div>
        <div class="info">
          <div>
            <p><strong>Invoice ID:</strong> ${invoiceId}</p>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> ${profile.name}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${cart.map(item => `<tr><td>${item.name}</td><td>${item.qty}</td><td>Rs. ${item.price}</td><td>Rs. ${item.price * item.qty}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="totals">
          <p>Subtotal: Rs. ${subtotal.toLocaleString()}</p>
          <p>Discount (${discountRate || 0}%): - Rs. ${discountAmount.toFixed(2)}</p>
          <p>Tax (${taxRate || 0}%): Rs. ${tax.toFixed(2)}</p>
          <p>Shipping: Free</p>
          <p class="total-amount">Total: Rs. ${total.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceId}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const paymentOptions = [
    { id: "Cash", name: "Cash", icon: "💵" },
    { id: "eSewa", name: "eSewa Wallet", icon: "🟢" },
    { id: "Khalti", name: "Khalti Wallet", icon: "🟣" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-8 text-white text-center shrink-0">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Check className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold">Order Summary</h3>
          <p className="text-emerald-100 mt-1">Review your items and choose payment</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Invoice Info */}
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Invoice: {invoiceId}</span>
            <span>{invoiceDate}</span>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Particulars</h4>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.qty}
                </span>
                <span className="font-medium text-gray-800">
                  Rs. {(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Order Summary (Totals) */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100 mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Final Summary</h4>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount ({discountRate || 0}%)</span>
              <span className="text-red-500">- Rs. {discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxRate || 0}%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span className="text-emerald-700">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection (Moved Tala) */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Payment Method</h4>
            <div className="grid grid-cols-1 gap-3">
              {paymentOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => !isProcessing && setPaymentMethod(opt.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.id
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                    : "border-gray-100 hover:border-gray-200"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`font-semibold ${paymentMethod === opt.id ? "text-emerald-700" : "text-gray-700"}`}>
                      {opt.name}
                    </span>
                  </div>
                  {paymentMethod === opt.id && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Icons.Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Icons.Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Icons.Print className="w-4 h-4" />
              Print
            </button>
          </div>

          <button
            onClick={handleConfirmAction}
            disabled={isProcessing}
            className={`w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isProcessing ? "opacity-75 cursor-wait" : ""}`}
          >
            {isProcessing ? (
              <>
                <Icons.Refresh className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm & Place Order"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full mt-2 text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors disabled:opacity-50"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}
