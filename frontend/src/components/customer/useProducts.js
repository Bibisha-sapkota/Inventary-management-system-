// src/components/customer/useProducts.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const res = await axios.get('http://localhost:5000/api/products', config);
      
      // Map backend products to match frontend expectations if necessary
      // Backend: _id, name, price, stock, description, category, image
      // Frontend expects: id, name, price, stock, description, category, image, rating
      const mappedProducts = res.data.data.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description || "",
        category: p.category || "General",
        image: p.image || "📦", // Fallback to emoji if no image
        rating: 4.5, // Mock rating as backend doesn't have it
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refreshProducts: fetchProducts
  };
}
