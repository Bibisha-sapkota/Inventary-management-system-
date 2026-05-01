import React, { useState, useRef } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Image as ImageIcon 
} from "lucide-react";
import { Modal } from "./AdminUI";

export default function CSVImportModal({ darkMode, onClose, onImport, existingProducts }) {
  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [importStats, setImportStats] = useState({
    valid: 0,
    invalid: 0,
    duplicate: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const requiredColumns = ["name", "price", "stock", "category"];

  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setErrors(["CSV file must have a header row and at least one data row"]);
      return [];
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingColumns.length > 0) {
      setErrors([`Missing required columns: ${missingColumns.join(", ")}`]);
      return [];
    }

    const products = [];
    const newErrors = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length !== headers.length) {
        newErrors.push(`Row ${i + 1}: Column count mismatch`);
        invalidCount++;
        continue;
      }

      const product = {};
      headers.forEach((header, index) => {
        product[header] = values[index].trim().replace(/['"]/g, "");
      });

      if (!product.name || product.name === "") {
        newErrors.push(`Row ${i + 1}: Missing product name`);
        invalidCount++;
        continue;
      }

      const price = Math.max(0, parseFloat(product.price) || 0);
      const stock = Math.max(0, parseInt(product.stock) || 0);

      const isDuplicate = existingProducts.some(
        (p) =>
          p.name.toLowerCase() === product.name.toLowerCase() ||
          (product.barcode && p.barcode === product.barcode)
      );

      let finalName = product.name;
      if (isDuplicate) {
        finalName = `${product.name} (New-${Math.floor(Math.random() * 1000)})`;
        duplicateCount++;
      }

      products.push({
        name: finalName,
        price: price,
        stock: stock,
        category: product.category || "General",
        barcode: product.barcode && !isDuplicate ? product.barcode : "", // Only keep barcode if not duplicate
        status: stock > 0 ? "Active" : "Unactive",
        image: product.image || null,
      });
      validCount++;
    }

    setErrors(newErrors);
    setImportStats({
      valid: validCount,
      invalid: invalidCount,
      duplicate: duplicateCount,
    });
    return products;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrors(["Please select a valid CSV file"]);
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setErrors([]);
    setCsvData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const products = parseCSV(text);
      setCsvData(products);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrors(["Error reading file"]);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (csvData.length > 0) {
      onImport(csvData);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = `name,price,stock,category,barcode,image
"Sample Product",100,50,"General","123456789012","https://example.com/image.jpg"
"Another Product",250,0,"Grocery","234567890123",""`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title="Import Products from CSV"
      onClose={onClose}
      onConfirm={handleImport}
      darkMode={darkMode}
      maxWidth="max-w-2xl"
      confirmText={`Import ${csvData.length} Products`}
      confirmDisabled={csvData.length === 0}
    >
      <div className="space-y-4">
        <div
          className={`p-4 rounded-xl border ${darkMode
            ? "bg-green-900/20 border-green-800 text-green-300"
            : "bg-green-50 border-green-200 text-green-800"
            }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
                <li>
                  Required columns:{" "}
                  <strong>name, price, stock, category</strong>
                </li>
                <li>
                  Optional columns: <strong>barcode, image</strong> (Status is automatic)
                </li>
                <li>Image can be a URL or left empty</li>
                <li>First row must be column headers</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={downloadTemplate}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${darkMode
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <Download size={16} />
          Download CSV Template
        </button>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${darkMode
            ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <FileSpreadsheet
            size={48}
            className={`mx-auto mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"
              }`}
          />
          <p className="font-semibold mb-1">
            {fileName ? fileName : "Click to select CSV file"}
          </p>
          <p
            className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"
              }`}
          >
            or drag and drop your file here
          </p>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Processing CSV file...</span>
          </div>
        )}

        {!isProcessing && fileName && (
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`p-3 rounded-lg text-center ${darkMode ? "bg-green-900/30" : "bg-green-50"
                }`}
            >
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Check size={16} />
                <span className="text-xs font-semibold uppercase">
                  Valid
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {importStats.valid}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${darkMode ? "bg-red-900/30" : "bg-red-50"
                }`}
            >
              <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                <AlertCircle size={16} />
                <span className="text-xs font-semibold uppercase">
                  Invalid
                </span>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {importStats.invalid}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${darkMode ? "bg-yellow-900/30" : "bg-yellow-50"
                }`}
            >
              <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                <AlertTriangle size={16} />
                <span className="text-xs font-semibold uppercase">
                  Duplicate
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {importStats.duplicate}
              </p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div
            className={`p-4 rounded-xl border max-h-40 overflow-y-auto ${darkMode
              ? "bg-red-900/20 border-red-800"
              : "bg-red-50 border-red-200"
              }`}
          >
            <p className="font-semibold text-red-500 mb-2 text-sm">
              Issues Found ({errors.length}):
            </p>
            <ul className="space-y-1">
              {errors.slice(0, 10).map((error, idx) => (
                <li
                  key={idx}
                  className="text-xs text-red-500 flex items-start gap-2"
                >
                  <span className="text-red-400">•</span>
                  {error}
                </li>
              ))}
              {errors.length > 10 && (
                <li className="text-xs text-red-400 italic">
                  ... and {errors.length - 10} more errors
                </li>
              )}
            </ul>
          </div>
        )}

        {csvData.length > 0 && (
          <div>
            <p className="font-semibold text-sm mb-2">
              Preview ({Math.min(csvData.length, 5)} of {csvData.length}{" "}
              products):
            </p>
            <div
              className={`border rounded-lg overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"
                }`}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className={`${darkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-100 text-gray-700"
                      } text-xs uppercase`}
                  >
                    <th className="py-2 px-3">Image</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((product, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                      <td className="py-2 px-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                          >
                            <ImageIcon size={14} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium">
                        {product.name}
                      </td>
                      <td className="py-2 px-3 text-xs">
                        {product.category}
                      </td>
                      <td className="py-2 px-3">Rs. {product.price}</td>
                      <td className="py-2 px-3">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
