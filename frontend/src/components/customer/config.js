// src/components/customer/config.js

export const TAX_RATE = 0.13;
export const DISCOUNT_PERCENTAGE = 0.10;

export const STATUS_CONFIG = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
  Processing: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  Shipped: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  Delivered: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  Completed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Invoiced: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export const INITIAL_PRODUCTS = [
  { id: 1, name: "Organic Apples", price: 250, stock: 50, description: "Crisp and juicy organic apples", rating: 4.8, image: "🍎", category: "Fruits" },
  { id: 2, name: "Fresh Milk (1L)", price: 120, stock: 20, description: "Pasteurized fresh cow's milk", rating: 4.5, image: "🥛", category: "Dairy" },
  { id: 3, name: "Whole Wheat Bread", price: 80, stock: 15, description: "Freshly baked whole wheat bread", rating: 4.9, image: "🍞", category: "Bakery" },
  { id: 4, name: "Eggs (1 dozen)", price: 180, stock: 0, description: "Farm-fresh large eggs", rating: 4.3, image: "🥚", category: "Dairy" },
  { id: 5, name: "Basmati Rice (5kg)", price: 850, stock: 25, description: "Premium long-grain Basmati rice", rating: 4.6, image: "🍚", category: "Grains" },
  { id: 6, name: "Broccoli (500g)", price: 150, stock: 10, description: "Fresh and tender broccoli", rating: 4.4, image: "🥦", category: "Vegetables" },
  { id: 7, name: "Cheddar Cheese", price: 300, stock: 30, description: "Rich and creamy cheddar cheese", rating: 4.7, image: "🧀", category: "Dairy" },
  { id: 8, name: "Bananas (1kg)", price: 100, stock: 40, description: "Fresh ripe bananas", rating: 4.6, image: "🍌", category: "Fruits" },
];

export const INITIAL_ORDERS = [
  { 
    id: "ORD-001", 
    customer: "Bibisha Sapkota",
    products: ["Organic Apples", "Fresh Milk"], 
    status: "Delivered", 
    date: "2025-01-15", 
    amount: 370,
    items: [{name: "Organic Apples", qty: 1, price: 250}, {name: "Fresh Milk", qty: 1, price: 120}] 
  },
  { 
    id: "ORD-002", 
    customer: "Bibisha Sapkota",
    products: ["Whole Wheat Bread"], 
    status: "Processing", 
    date: "2025-01-18", 
    amount: 80,
    items: [{name: "Whole Wheat Bread", qty: 1, price: 80}] 
  },
  { 
    id: "ORD-003", 
    customer: "Bibisha Sapkota",
    products: ["Basmati Rice (5kg)", "Eggs"], 
    status: "Shipped", 
    date: "2025-01-19", 
    amount: 1030,
    items: [{name: "Basmati Rice (5kg)", qty: 1, price: 850}, {name: "Eggs (1 dozen)", qty: 1, price: 180}] 
  },
  { 
    id: "ORD-004", 
    customer: "Bibisha Sapkota",
    products: ["Cheddar Cheese"], 
    status: "Pending", 
    date: "2025-01-20", 
    amount: 300,
    items: [{name: "Cheddar Cheese", qty: 1, price: 300}] 
  },
  { 
    id: "ORD-005", 
    customer: "Bibisha Sapkota",
    products: ["Bananas"], 
    status: "Completed", 
    date: "2025-01-10", 
    amount: 100,
    items: [{name: "Bananas (1kg)", qty: 1, price: 100}] 
  },
  { 
    id: "ORD-006", 
    customer: "Bibisha Sapkota",
    products: ["Broccoli"], 
    status: "Cancelled", 
    date: "2025-01-05", 
    amount: 150,
    items: [{name: "Broccoli (500g)", qty: 1, price: 150}] 
  },
];

export const INITIAL_SETTINGS = {
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false,
  twoFactorAuth: true,
  language: "English",
  currency: "NPR",
  taxRate: 13,        // default matches SystemSettings backend default
  defaultDiscount: 0, // superadmin sets this; 0 until fetched
};