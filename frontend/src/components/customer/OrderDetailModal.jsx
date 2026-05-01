// src/components/customer/OrderDetailModal.jsx

import Icons from "./Icons";
import { STATUS_CONFIG } from "./config";

export default function OrderDetailModal({ selectedOrder, setShowOrderDetailModal }) {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Order Details: {selectedOrder.id}</h3>
          <button onClick={() => setShowOrderDetailModal(false)} className="text-gray-500 hover:text-gray-700">
            <Icons.X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-gray-600 font-medium">Product:</p>
            <p className="text-gray-800">{selectedOrder.product}</p>
            <p className="text-gray-600 font-medium">Date:</p>
            <p className="text-gray-800">{selectedOrder.date}</p>
            <p className="text-gray-600 font-medium">Amount:</p>
            <p className="text-gray-800">Rs. {selectedOrder.amount.toLocaleString()}</p>
            <p className="text-gray-600 font-medium">Status:</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status].bg} ${STATUS_CONFIG[selectedOrder.status].text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedOrder.status].dot}`}></span>
              {selectedOrder.status}
            </span>
          </div>

          {selectedOrder.items?.length > 0 && (
            <>
              <h4 className="font-semibold text-gray-700 mt-4">Items:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>{item.name} (x{item.qty}) - Rs. {(item.qty * item.price).toLocaleString()}</li>
                ))}
              </ul>
            </>
          )}

          <button
            onClick={() => setShowOrderDetailModal(false)}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}