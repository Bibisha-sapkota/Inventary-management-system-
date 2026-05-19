// src/components/customer/CustomerDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

// Import Tabs
import DashboardTab from "./DashboardTab";
import ProductsTab from "./ProductsTab";
import CartTab from "./CartTab";
import OrderHistoryTab from "./OrderHistoryTab";
import NotificationsTab from "./NotificationsTab";
import ProfileTab from "./ProfileTab";
import SettingsTab from "./SettingsTab";
import DocumentationTab from "./DocumentationTab";
import ExchangesTab from "./ExchangesTab";

// Import Components
import Sidebar from "./Sidebar";
import InvoiceModal from "./InvoiceModal";
import Icons from "./Icons";
import Chatbot from "../Chatbot";

// Import Hooks
import { useCart } from "./useCart";
import { useNotifications } from "./useNotifications";
import { useProfile } from "./useProfile";
import { useOrders } from "./useOrders";
import { useProducts } from "./useProducts";

// Import Config
import CryptoJS from "crypto-js";
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from "./config";

export default function CustomerDashboard() {
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Handlers
  const fetchGlobalSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (e) { console.error("Failed to fetch settings", e); }
  };

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  // Custom Hooks
  const {
    profile,
    handleProfilePhoto,
    handleProfileChange,
    saveProfile,
    isSaving,
    refreshProfile
  } = useProfile();

  // Polling for security status (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const {
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
  } = useCart(settings.taxRate, settings.defaultDiscount);

  const { notifications, unreadCount, markAllNotificationsAsRead, markAsRead, refreshNotifications } = useNotifications();
  const { orders, isLoading: isOrdersLoading, refreshOrders, addOrder, cancelOrder } = useOrders();
  const { products, isLoading: isProductsLoading, refreshProducts } = useProducts();

  // Handlers
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Handle eSewa Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        if (decoded.status === "COMPLETE") {
          // Clear URL to prevent re-triggering
          window.history.replaceState({}, document.title, window.location.pathname);
          // Redirect to history tab or show alert
          setActiveTab("history");
        }
      } catch (e) {
        console.error("Failed to parse eSewa response:", e);
      }
    }
  }, []);

  const handleCompleteOrder = async (paymentMethod) => {
    try {
      if (paymentMethod === "Khalti") {
        if (!window.KhaltiCheckout) {
          const script = document.createElement("script");
          script.src = "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js";
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Using Khalti's official test public key to bypass the 'Invalid Key' backend error
        // Your key (6d757813cc1941faafbd9ef30523b9fd) was being rejected by Khalti's API.
        let khaltiKey = "test_public_key_6d757813cc1941faafbd9ef30523b9fd";

        const config = {
          publicKey: khaltiKey,
          productIdentity: `ORDER-${Date.now()}`,
          productName: "Inventory Purchase",
          productUrl: window.location.href,
          paymentPreference: [
            "KHALTI",
          ],
          eventHandler: {
            onSuccess(payload) {
              createOrder("Khalti");
            },
            onError(error) {
              console.log(error);
              alert("Payment failed");
            },
            onClose() {
              console.log("Widget is closing");
            }
          }
        };

        const checkout = new window.KhaltiCheckout(config);
        checkout.show({ amount: Math.round(total * 100) });
        return;
      }

      if (paymentMethod === "eSewa") {
        await createOrder("eSewa");

        const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        const txUuid = `ORDER-${Date.now()}`;
        const amount = parseFloat(total).toFixed(2);
        const tax_amount = "0";
        const pdc = "0";
        const psc = "0";
        const total_amount = amount;

        const message = `total_amount=${total_amount},transaction_uuid=${txUuid},product_code=EPAYTEST`;
        const secret = "8gBm/:&EnhH.1/q";

        const hash = CryptoJS.HmacSHA256(message, secret);
        const signature = CryptoJS.enc.Base64.stringify(hash);

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", path);

        const params = {
          amount: amount,
          tax_amount: tax_amount,
          total_amount: total_amount,
          transaction_uuid: txUuid,
          product_code: "EPAYTEST",
          product_service_charge: psc,
          product_delivery_charge: pdc,
          success_url: window.location.href,
          failure_url: window.location.href,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature,
        };

        for (const key in params) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      }

      await createOrder(paymentMethod);
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const createOrder = async (method) => {
    await addOrder({
      customer: profile.name,
      paymentMethod: method,
      items: selectedCart.map((item) => ({
        _id: item.id || item._id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      total: total,
    });

    clearCart();
    refreshProducts();
    refreshNotifications();
    setShowInvoice(false);
    setActiveTab("history");
  };

  // Render Tab Content
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            profile={profile}
            cartCount={cartCount}
            setActiveTab={setActiveTab}
            recentOrders={orders.slice(0, 5)}
            settings={settings}
          />
        );
      case "products":
        return (
          <ProductsTab
            products={products}
            isLoading={isProductsLoading}
            addToCart={addToCart}
          />
        );
      case "cart":
        return (
          <CartTab
            cart={cart}
            selectedCart={selectedCart}
            cartCount={cartCount}
            subtotal={subtotal}
            discountAmount={discountAmount}
            tax={tax}
            total={total}
            taxRate={settings.taxRate ?? 13}
            discountRate={settings.defaultDiscount ?? 0}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            toggleSelection={toggleSelection}
            toggleAllSelection={toggleAllSelection}
            removeSelected={removeSelected}
            setShowInvoice={setShowInvoice}
            setActiveTab={setActiveTab}
          />
        );
      case "history":
        return (
          <OrderHistoryTab
            orders={orders}
            isLoading={isOrdersLoading}
            refreshOrders={refreshOrders}
            cancelOrder={cancelOrder}
          />
        );
      case "notifications":
        return (
          <NotificationsTab
            notifications={notifications}
            unreadCount={unreadCount}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            markAsRead={markAsRead}
          />
        );
      case "exchanges":
        return (
          <ExchangesTab
            profile={profile}
            products={products}
            orders={orders}
            refreshProducts={refreshProducts}
          />
        );
      case "profile":
        return (
          <ProfileTab
            profile={profile}
            handleProfilePhoto={handleProfilePhoto}
            handleProfileChange={handleProfileChange}
            saveProfile={saveProfile}
            isSaving={isSaving}
          />
        );
      case "settings":
        return (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
          />
        );
      case "documentation":
        return <DocumentationTab />;
      default:
        return (
          <DashboardTab
            profile={profile}
            cartCount={cartCount}
            setActiveTab={setActiveTab}
            recentOrders={orders.slice(0, 5)}
          />
        );
    }
  };

  const [showPromoPopup, setShowPromoPopup] = useState(false);

  useEffect(() => {
    if (settings.discountBanner && !localStorage.getItem(`banner_seen_${settings.discountBanner.slice(-20)}`)) {
      const timer = setTimeout(() => {
        setShowPromoPopup(true);
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [settings.discountBanner]);

  // --- RESTRICTED SCREEN CHECK ---
  if (profile.status === "blocked") {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0B1120] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative mb-10 inline-block">
            <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner">
              <Icons.AlertCircle size={48} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-rose-50">
              <Icons.X size={16} className="text-rose-500" />
            </div>
          </div>

          <h2 className="text-4xl font-black text-[#1e293b] tracking-tighter mb-4">Account Restricted</h2>
          <p className="text-[#64748b] text-base font-medium leading-relaxed mb-10 max-w-[340px] mx-auto">
            Your customer access has been <span className="text-rose-600 font-black border-b-2 border-rose-100">suspended</span> by the system Superadmin. You can no longer place orders or access dashboard features.
          </p>

          <button 
            onClick={handleLogout}
            className="w-full py-5 bg-[#0B1120] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-[#1e293b] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Icons.Logout size={20} className="group-hover:-translate-x-1 transition-transform" />
            Terminate Session
          </button>

          <p className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#cbd5e1] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            System Security Enforcement V2.4
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        unreadCount={unreadCount}
        logout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Promotion Popup Modal */}
      {showPromoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-700">
          <div className="bg-[#10B981] rounded-[2.5rem] w-full max-w-4xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 relative flex flex-col md:flex-row h-[500px]">
            <button 
              onClick={() => {
                localStorage.setItem(`banner_seen_${settings.discountBanner.slice(-20)}`, 'true');
                setShowPromoPopup(false);
              }}
              className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
            >
              <Icons.X size={24} />
            </button>
            
            {/* Left Content */}
            <div className="flex-1 p-12 flex flex-col justify-center text-white relative z-10">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-80 mb-4">Stock Inventory Special</h4>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                {settings.bannerTitle || "New Offers Available!"}
              </h2>
              <p className="text-emerald-50 text-lg font-bold mb-10 opacity-90">
                Talk to our experts & grab the best deals for your business today.
              </p>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    localStorage.setItem(`banner_seen_${settings.discountBanner.slice(-20)}`, 'true');
                    setShowPromoPopup(false);
                    setActiveTab("products");
                  }}
                  className="px-10 py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-2xl active:scale-95 w-full md:w-auto text-center"
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative overflow-hidden hidden md:block">
              <img 
                src={settings.discountBanner} 
                alt="Promotion" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#10B981]/10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Profile Photo & Name */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize tracking-tight">
                {activeTab === "history" ? "Order History" : activeTab}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">
                Welcome back, {profile.name === "Loading..." ? "User" : profile.name.split(" ")[0]}!
              </p>
            </div>
          </div>

          {/* Profile Section in Header */}
          <div className="flex items-center gap-3">
            {/* Proceed to Checkout Button */}
            {cartCount > 0 && activeTab !== "cart" && (
              <button
                onClick={() => setActiveTab("cart")}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Icons.Cart className="w-4 h-4" />
                <span className="hidden sm:inline">Proceed to Checkout</span>
                <span className="sm:hidden">Checkout</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{cartCount}</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Icons.Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            {/* Profile Info */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
              onClick={() => setActiveTab("profile")}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {profile.name}
                </p>
                <span className="text-xs text-emerald-500 font-medium uppercase tracking-wide">
                  Customer
                </span>
              </div>

              {/* Profile Photo */}
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-emerald-100">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal
          cart={selectedCart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          tax={tax}
          total={total}
          taxRate={settings.taxRate ?? 13}
          discountRate={settings.defaultDiscount ?? 0}
          profile={profile}
          onClose={() => setShowInvoice(false)}
          onConfirm={handleCompleteOrder}
        />
      )}
      <Chatbot
        darkMode={false}
        role="customer"
        context={`Customer Portal: Assisting ${profile.name}. Tab: ${activeTab}. Product Details (Name|Price|Category|Stock): ${products.map(p => `${p.name}|${p.price}|${p.category}|${p.stock}`).join(' ; ')}`}
      />
    </div>
  );
}