// src/components/customer/useCart.js

import { useState, useMemo } from "react";
export function useCart(taxRate = 13, discountRate = 0) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.qty + 1 > product.stock) {
          alert(`Only ${product.stock} units of ${product.name} are available.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1, selected: true }
            : item
        );
      }

      if (product.stock < 1) {
        alert("This item is currently out of stock.");
        return prev;
      }

      return [...prev, { ...product, qty: 1, selected: true }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            if (nextQty > item.stock) {
              alert(`Only ${item.stock} units available.`);
              return item;
            }
            return { ...item, qty: Math.max(1, nextQty) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleSelection = (id) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, selected: item.selected === false ? true : false } : item));
  };

  const toggleAllSelection = (isSelected) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected: isSelected })));
  };

  const removeSelected = () => {
    setCart((prev) => prev.filter((item) => item.selected === false));
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const selectedCart = useMemo(
    () => cart.filter((item) => item.selected !== false),
    [cart]
  );

  const subtotal = useMemo(
    () => selectedCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedCart]
  );

  const discountAmount = subtotal * (discountRate / 100);
  const tax = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + tax;

  return {
    cart,
    selectedCart,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleSelection,
    toggleAllSelection,
    removeSelected,
    subtotal,
    discountAmount,
    tax,
    total,
  };
}