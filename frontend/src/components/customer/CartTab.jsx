// src/components/customer/CartTab.jsx

import Icons from "./Icons";
import { DISCOUNT_PERCENTAGE } from "./config";

export default function CartTab({
  cart,
  selectedCart,
  cartCount,
  subtotal,
  discountAmount,
  tax,
  total,
  updateQty,
  removeFromCart,
  clearCart,
  toggleSelection,
  toggleAllSelection,
  removeSelected,
  setShowInvoice,
  setActiveTab,
}) {
  const allSelected = cart.length > 0 && selectedCart?.length === cart.length;

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shopping Cart</h2>
          <p className="text-gray-500 mt-1 text-sm">
            You have {cartCount} items in your cart
          </p>
        </div>
        {cart.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedCart?.length > 0 && (
              <button
                onClick={removeSelected}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              >
                <Icons.Trash className="w-4 h-4" />
                Remove Selected
              </button>
            )}
            <button
              onClick={clearCart}
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 px-4 py-2 text-sm transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        // Empty Cart
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center max-w-2xl mx-auto mt-8">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
            🛒
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => setActiveTab("products")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        // Cart with Items
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {/* Select All */}
            <div className="bg-gray-50 rounded-lg p-3 px-4 flex items-center justify-between border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAllSelection(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-medium text-gray-700 text-sm">
                  Select All ({selectedCart?.length || 0} items)
                </span>
              </label>
            </div>

            <div className="space-y-4">
              {cart.map((item) => {
                const isSelected = item.selected !== false;
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-5 transition-colors ${
                      isSelected ? "border-emerald-500 ring-1 ring-emerald-500" : "border-gray-200 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Item Checkbox */}
                    <div className="flex items-start pt-1 sm:pt-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 mt-1 sm:mt-0 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
                      {typeof item.image === "string" && item.image.startsWith("data:") ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        item.image || "📦"
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            Rs. {item.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-8 h-8 hover:bg-gray-50 rounded flex items-center justify-center text-gray-600 transition-colors"
                          >
                            <Icons.Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium text-gray-900 w-8 text-center text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-8 h-8 hover:bg-gray-50 rounded flex items-center justify-center text-gray-600 transition-colors"
                          >
                            <Icons.Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-500">
                            Total: <span className="text-gray-900">Rs. {(item.price * item.qty).toLocaleString()}</span>
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-medium">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount ({DISCOUNT_PERCENTAGE * 100}%)</span>
                    <span className="text-emerald-600 font-medium">- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (13%)</span>
                  <span className="text-gray-900 font-medium">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-200">
                  <span>Shipping</span>
                  <span className="text-gray-900 font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="text-2xl font-bold text-gray-900">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (total <= 0) {
                    alert("Order total must be greater than Rs. 0 to proceed.");
                    return;
                  }
                  setShowInvoice(true);
                }}
                className={`w-full py-3.5 rounded-lg font-medium text-base transition-colors ${
                  total > 0 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className="w-full mt-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                Continue Shopping
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                 <Icons.Check className="w-4 h-4" />
                 <span className="text-xs">Secure Checkout Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}