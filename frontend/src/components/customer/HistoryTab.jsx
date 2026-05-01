// src/components/customer/CartTab.jsx

import Icons from "./Icons";
import { DISCOUNT_PERCENTAGE } from "./config";

export default function CartTab({ cart, cartCount, subtotal, discountAmount, tax, total, updateQty, removeFromCart, clearCart, setShowInvoice, setActiveTab }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          <p className="text-gray-500">{cartCount} items in your cart</p>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
            <Icons.Trash /> Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
          <button onClick={() => setActiveTab("products")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold">Browse Products</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-6">
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">{item.image}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600"><Icons.Minus /></button>
                      <span className="font-semibold text-gray-800 w-8 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600"><Icons.Plus /></button>
                    </div>
                    <span className="text-xl font-bold text-gray-800">Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Discount ({DISCOUNT_PERCENTAGE * 100}%)</span><span className="text-red-500">- Rs. {discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (13%)</span><span>Rs. {tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-emerald-600">Free</span></div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-xl font-bold text-gray-800"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
            </div>
            <button onClick={() => setShowInvoice(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2">
              <Icons.Check /> Proceed to Checkout
            </button>
            <button onClick={() => setActiveTab("products")} className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium">Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}