// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import GoogleSuccess from "./pages/auth/GoogleSuccess";

import AdminDashboard from "./pages/AdminDashboard";
// Changed import path here:
import CustomerDashboard from "./components/customer/CustomerDashboard";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Barcode from "./pages/Barcode";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";

function App() {
  return (
    <Router>
      <Routes>

        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth-success" element={<GoogleSuccess />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* ============ ADMIN ROUTES ============ */}
        {/* Default dashboard */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="dashboard" />
            </PrivateRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="dashboard" />
            </PrivateRoute>
          }
        />

        {/* Orders */}
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="orders" />
            </PrivateRoute>
          }
        />

        {/* Customers */}
        <Route
          path="/admin/customer"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="customers" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="customers" />
            </PrivateRoute>
          }
        />

        {/* Suppliers */}
        <Route
          path="/admin/suppliers"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="suppliers" />
            </PrivateRoute>
          }
        />

        {/* Products - List */}
        <Route
          path="/admin/products"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="productList" />
            </PrivateRoute>
          }
        />

        {/* Products - Card View */}
        <Route
          path="/admin/products/view"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="productView" />
            </PrivateRoute>
          }
        />

        {/* Invoices */}
        <Route
          path="/admin/invoices"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="invoices" />
            </PrivateRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="reports" />
            </PrivateRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/admin/notifications"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="notifications" />
            </PrivateRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="profile" />
            </PrivateRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="settings" />
            </PrivateRoute>
          }
        />

        {/* POS Scanner */}
        <Route
          path="/admin/pos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard initialTab="posScanner" />
            </PrivateRoute>
          }
        />

        {/* Standalone Barcode Page */}
        <Route
          path="/barcode"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Barcode />
            </PrivateRoute>
          }
        />

        {/* ============ SUPERADMIN ROUTES ============ */}
        <Route
          path="/superadmin"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <SuperadminDashboard />
            </PrivateRoute>
          }
        />

        {/* ============ FALLBACK ============ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;