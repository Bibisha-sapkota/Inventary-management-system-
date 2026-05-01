import React, { useState } from "react";

function Barcode() {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Scanned Barcode: " + barcode);
    setBarcode("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Barcode Scanner
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter or Scan Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            Submit Barcode
          </button>
        </form>
      </div>
    </div>
  );
}

export default Barcode;