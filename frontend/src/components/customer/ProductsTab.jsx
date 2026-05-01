// src/components/customer/ProductsTab.jsx

import { useState, useMemo } from "react";
import Icons from "./Icons";

export default function ProductsTab({ products = [], isLoading = false, addToCart }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("name");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p?.category || "Uncategorized"));
    return ["All Categories", ...cats];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const productName = (product?.name || "").toLowerCase();
      const productCategory = product?.category || "";

      const matchesSearch = productName.includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product) => {
    if (product.stock >= 1) {
      addToCart(product);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading amazing products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Browse Products</h2>
        <p className="text-gray-500">Explore our fresh collection of products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stock === undefined || product.stock < 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
           <img 
             src={product.image} 
             alt={product.name} 
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
           />
        ) : (
          <span className="text-6xl transform transition-transform duration-500 group-hover:scale-110">
            {product.image || "📦"}
          </span>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}
          {product.isExpiring && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              Expiring Soon
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
          {product.category || "Uncategorized"}
        </p>
        
        <h3 className="font-semibold text-gray-800 mt-1 group-hover:text-emerald-600 transition-colors">
          {product.name || "No Name"}
        </h3>

        {product.brand && (
          <p className="text-sm text-gray-500">{product.brand}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-2">
            <Icons.Star />
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-emerald-600">
            Rs. {product.price?.toLocaleString() || 0}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs. {product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        <p className="text-xs text-gray-500 mt-1">
          {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`w-full mt-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          <Icons.Cart className="w-4 h-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}