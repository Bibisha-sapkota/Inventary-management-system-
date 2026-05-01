import React, { useState, useRef } from "react";
import { X, Camera, Image as ImageIcon } from "lucide-react";

export default function ProductImageUpload({ image, onImageChange, darkMode }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <label
        className={`block text-xs font-bold uppercase mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"
          }`}
      >
        Product Image
      </label>

      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="Product preview"
            className="w-full h-40 object-cover rounded-xl border-2 border-green-500"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 shadow-lg flex items-center gap-1"
          >
            <Camera size={14} /> Change
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
            ? "border-green-500 bg-green-50"
            : darkMode
              ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
        >
          <div
            className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
          >
            <ImageIcon
              size={28}
              className={darkMode ? "text-gray-400" : "text-gray-500"}
            />
          </div>
          <p className="font-semibold text-sm mb-1">
            Click to upload or drag & drop
          </p>
          <p
            className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"
              }`}
          >
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
