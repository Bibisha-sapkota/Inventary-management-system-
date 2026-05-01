import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Chatbot from "../components/Chatbot";

// Reusable Feature Card Component
function FeatureCard({ title, desc, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full">
      <div className={`p-3 rounded-lg mb-4 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  // --- POPUP LOGIC ---
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll lock when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  const features = [
    {
      title: "Stock Management",
      desc: "Track your grocery items, monitor quantities and get alerts when stock is low.",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    },
    {
      title: "Expiry Alerts",
      desc: "Prevent waste by receiving automatic expiry notifications.",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    },

    {
      title: "Customer",
      desc: "Track customer profiles, purchase history, and engagement.",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      title: "Discount Alerts",
      desc: "Receive notifications on ongoing promotions and discount expiries.",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    },
    {
      title: "Orders",
      desc: "Monitor and manage all store orders in real-time.",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
    },
    {
      title: "Reporting & Analytics",
      desc: "Generate sales, revenue, and inventory reports.",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    },
    {
      title: "low Expiry Alerts",
      desc: "Prevent waste by receiving automatic expiry notifications.",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    },
    {
      title: "High Expiry Alerts",
      desc: "Prevent waste by receiving automatic expiry notifications.",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] font-sans scroll-smooth overflow-x-hidden">

      {/* --- GREEN WELCOME POPUP --- */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-gradient-to-r from-green-500 to-green-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-white hover:rotate-90 transition-all z-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className="p-10 md:w-3/5 text-white flex flex-col justify-center relative z-10 text-left">
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                New to Stock Inventary? <br />
                <span className="text-yellow-300 tracking-tighter">Talk to our experts</span>
              </h2>
              <div className="flex gap-4 mt-8">
                <Link to="/contact" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-900 transition-all">Schedule a call</Link>
                <button onClick={() => setShowPopup(false)} className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all">Explore demo</button>
              </div>
            </div>
            <div className="md:w-2/5 relative flex items-end justify-center bg-white/10">
              <img
                src="https://www.zoho.com/us/inventory/mobile-banner-img.png"
                alt="Expert"
                className="w-full h-auto object-contain scale-110 origin-bottom pt-10"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      )}
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 md:px-10 py-4 shadow-sm bg-white fixed top-0 left-0 z-50 border-b border-gray-100">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">

          {/* LOGO IMAGE */}
          <img
            src="images/logo.png"
            alt="Logo"
            className="w-50 h-14 object-contain bg-green-600 p-1 rounded"
          />

          {/* TEXT */}
          <div className="text-xl md:text-2xl font-extrabold tracking-wide text-gray-800 uppercase">
            Stock <span className="text-green-600">Inventory</span>
          </div>
        </div>

        {/* Menu */}
        <div className="hidden md:flex gap-8 text-gray-600 font-bold text-sm uppercase">
          <a href="#home" className="hover:text-green-600 transition-all">Home</a>
          <a href="#about" className="hover:text-green-600 transition-all">About</a>
          <a href="#features" className="hover:text-green-600 transition-all">Features</a>
          <Link to="/pricing" className="hover:text-green-600 transition-all">Pricing</Link>
          <Link to="/contact" className="hover:text-green-600 transition-all">Contact</Link>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-gray-600 font-semibold hover:text-green-600 transition-all">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md">
            Create Free Account
          </Link>
        </div>

      </nav>
      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-24 px-6 md:px-10 grid md:grid-cols-2 items-center bg-cover bg-center relative min-h-[85vh]"
        style={{ backgroundImage: "url('https://media.istockphoto.com/id/1391824162/photo/smart-augmented-reality-ar-warehouse-management-system.jpg?s=612x612&w=0&k=20&c=VhEA03xUH-WR9hnJTiaDSKNLZMTG8WoT_KaloAVVuX0=')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <div className="animate-fadeInUp relative z-10 max-w-2xl text-left md:ml-10">
          <div className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wider uppercase">
            Smart Management
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-white drop-shadow-lg mb-6 uppercase">
            Stock Inventary <br />
            <span className="text-green-400">System</span>
          </h1>
          <p className="text-gray-100 text-lg max-w-xl leading-relaxed mb-8 font-medium">
            Streamline store operations with the Grocery Management System.
            Handle inventory, billing, supplier management, and customer loyalty
            programs effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup" className="px-8 py-3.5 bg-green-600 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-green-700 transition-all">Get Started</Link>
            <Link to="/login" className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white text-white rounded-xl text-lg font-bold hover:bg-white hover:text-gray-900 transition-all">Login</Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative z-10 flex justify-center md:justify-end animate-float">
          <img
            src="https://www.zoho.com/us/inventory/mobile-banner-img.png"
            alt="Inventory Illustration"
            className="w-full max-w-md rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-4 border-white/10"
          />
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-10 bg-gradient-to-b from-blue-100 via-white to-blue-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 via-green-500 to-blue-600" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-12 uppercase tracking-tight">Powerful Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>


      {/* --- ABOUT US SECTION --- */}
      <section id="about" className="py-24 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwZcFNyHAu4kDoK7wHrVxQJaY4LQAJLXVfLg&s"
              alt="About our system"
              className="rounded-3xl shadow-xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-2xl hidden lg:block shadow-xl">
              <p className="text-2xl font-black">5+ Years</p>
              <p className="text-sm font-medium opacity-80">Industry Experience</p>
            </div>
          </div>
          <div className="text-left">
            <span className="text-green-600 font-bold uppercase tracking-widest text-sm">Who We Are</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 mb-6 uppercase">Efficiency at Your <span className="text-green-600">Fingertips</span></h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Our Stock Inventory System is built with one goal in mind: to simplify retail management. From tracking a single item to managing entire store chains, our platform provides the tools you need to grow your business without the manual stress.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-700 font-bold uppercase text-xs"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span> Automated Tracking & Smart Alerts</li>
              <li className="flex items-center gap-3 text-gray-700 font-bold uppercase text-xs"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span> Detailed Sales Analytics</li>
              <li className="flex items-center gap-3 text-gray-700 font-bold uppercase text-xs"><span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">✓</span> User-friendly Admin Dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- ADDED SECTION: WHY CHOOSE US (Bento Grid) --- */}
      <section className="py-24 bg-gray-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 uppercase tracking-tighter">Why you should use our <br /><span className="text-green-600">Management Software</span></h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-8 items-center border border-gray-100 overflow-hidden">
              <div className="md:w-1/2">
                <h3 className="text-3xl font-black mb-4 uppercase">Really easy to use</h3>
                <p className="text-gray-500 text-lg">Inventory presents inventory and orders beautifully, so anyone on your team can use it immediately.</p>
              </div>
              <div className="md:w-1/2">
                <img src="https://appcoup.com/assets/img/inventory/inventory.png" alt="UI" className="w-full" />
              </div>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-4 uppercase">Great for small business</h3>
                <p className="text-gray-500">Scale up or down to meet your business needs effortlessly.</p>
              </div>
              <div className="flex -space-x-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/thumb/men/${i + 10}.jpg`}
                    alt={`Team member ${i}`}
                    className="w-12 h-12 rounded-full border-4 border-white"
                  />
                ))}
                <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center font-bold text-white text-xs">+50</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ADDED SECTION: XERO STYLE ALTERNATING --- */}
      <section className="py-24 bg-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-32 text-left">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 uppercase leading-tight">Add items to invoices and orders</h2>
              <p className="text-gray-500 text-xl mb-10 leading-relaxed">Use inventory listings to speed up your paperwork. Save details once and reuse them forever.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-bold text-green-600 uppercase text-xs">✓ Speed up billing time</li>
                <li className="flex items-center gap-3 font-bold text-green-600 uppercase text-xs">✓ Automatic tax calculation</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img src="https://www.xero.com/content/dam/xero/pilot-images/features/inventory-plus/track-sales-and-profit.1697673617504.png" alt="Invoices" className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 uppercase leading-tight">Better stock decisions with visibility</h2>
              <p className="text-gray-500 text-xl mb-10 leading-relaxed">Inventory and billing are connected, giving you real-time data to make smart financial choices.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-bold text-green-600 uppercase text-xs">✓ Connect to your bank</li>
                <li className="flex items-center gap-3 font-bold text-green-600 uppercase text-xs">✓ Collaborative workspace</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img src="https://blog.equinix.com/wp-content/uploads/2021/07/AdobeStock_250695137-1024x576.jpeg" alt="Reports" className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
      {/* --- XERO STYLE STOCK CONTROL SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-slate-100">
        <div className="max-w-7xl mx-auto bg-slate-100 rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Stock control software for small businesses
          </h2>

          <p className="text-gray-600 max-w-3xl mb-16 text-lg">
            Our system brings all the items you buy and sell together in one place – so your inventory management is easier, quicker, and more precise.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-600 text-white font-bold">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Track your stock levels in real time</h3>
                <p className="text-gray-500 text-sm">
                  Monitor stock instantly and restock at the right time, every time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-600 text-white font-bold">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-2">See what’s selling</h3>
                <p className="text-gray-500 text-sm">
                  Identify your best-selling products and grow smarter.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-600 text-white font-bold">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-2">Add items to invoices & orders</h3>
                <p className="text-gray-500 text-sm">
                  Speed up billing by reusing saved product details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- XERO TESTIMONIAL STYLE SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-green-100">
        <div className="max-w-6xl mx-auto text-left">
          <h2 className="text-3xl md:text-4xl font-black mb-12">
            “I use this system to keep track of my company’s
            <span className="bg-white px-2 ml-2 rounded">financial health</span>”
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <img
              src="https://www.xero.com/content/dam/xero/pilot-images/people/customer-story/customer-story-moovas.1646877528358.png"
              alt="Business owner"
              className="rounded-2xl shadow-2xl w-full md:w-1/2"
            />

            <p className="text-gray-900 text-sm max-w-xs">
              Our inventory system helps businesses make confident financial decisions using real-time data.
            </p>

          </div>
        </div>
      </section>
      {/* --- GROCERY MANAGEMENT HIGHLIGHTS SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center">

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            The Grocery Store Management System Built for Your
            <span className="block mt-2">Grocery Chain</span>
          </h2>

          <p className="text-gray-600 max-w-4xl mx-auto mb-16 text-lg leading-relaxed">
            We have engineered our grocery store management system to fulfill all your
            grocery inventory needs. With real-time stock tracking and automatic stock
            replenishment, you can avoid stockouts and maintain high customer satisfaction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Card 1 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl group">
              <img
                src="https://t4.ftcdn.net/jpg/02/70/00/57/360_F_270005769_k9nENNRBjtDZJV1LOClnlh1NVy3mdQfD.jpg"
                alt="Technical Support"
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 text-left">
                <h3 className="text-xl font-black text-white mb-2">
                  Full Technical Support
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Our professional support team is available 24/7 to help you overcome
                  any technical challenges with ease.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl group">
              <img
                src="https://media.istockphoto.com/id/1358091848/photo/corporate-data-management-system-and-document-management-system-with-employee-privacy.jpg?s=612x612&w=0&k=20&c=STm4rk-rTAGtjfd1OqFlHrRgUweQNSHtxl03uqhU5II="
                alt="User Friendly Interface"
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 text-left">
                <h3 className="text-xl font-black text-white mb-2">
                  User-Friendly Interface
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Intuitive design that lets your team start using the system immediately
                  with minimal training.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl group">
              <img
                src="https://t3.ftcdn.net/jpg/18/09/86/12/360_F_1809861209_NAgvcNGkNKQkc2VyJ7qK9g9mJVS9wjeE.jpg"
                alt="High Scalability"
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 text-left">
                <h3 className="text-xl font-black text-white mb-2">
                  High Scalability
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Built on scalable cloud architecture to handle multiple stores,
                  locations, and rapid business growth.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-16">
            <Link
              to="/contact"
              className="inline-block bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg"
            >
              Get a Demo
            </Link>
          </div>

        </div>
      </section>

      {/* --- IMPROVED PROFESSIONAL FOOTER --- */}
      <footer className="bg-[#0B0D11] text-white pt-24 pb-12 px-6 md:px-12 text-left relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-green-600/20">S</div>
                <span className="text-2xl font-black uppercase tracking-tighter">Stock <span className="text-green-500">Inventory</span></span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm text-base">
                Empowering retailers in Nepal with world-class inventory, billing, and automated management solutions. Scale your business with confidence.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-gray-400">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-gray-400">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-gray-400">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-gray-400 font-semibold text-sm">
                <li><a href="#features" className="hover:text-green-500 transition-all">Features</a></li>
                <li><Link to="/pricing" className="hover:text-green-500 transition-all">Pricing Plans</Link></li>
                <li><Link to="/login" className="hover:text-green-500 transition-all">Free Demo</Link></li>
                <li><a href="#" className="hover:text-green-500 transition-all">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-gray-400 font-semibold text-sm">
                <li><a href="#about" className="hover:text-green-500 transition-all">About Us</a></li>
                <li><Link to="/contact" className="hover:text-green-500 transition-all">Contact Sales</Link></li>
                <li><a href="#" className="hover:text-green-500 transition-all">Privacy Policy</a></li>
                <li><Link to="/terms" className="hover:text-green-500 transition-all">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Support/Newsletter */}
            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Newsletter</h4>
              <p className="text-gray-400 text-xs font-medium mb-6 leading-relaxed">
                Stay updated with our latest features and retail tips.
              </p>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:border-green-500 focus:outline-none transition-all w-full"
                />
                <button className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-500 font-medium">
              © 2024 Stock Inventory System. Made with ❤️ in Kathmandu.
            </p>
            <div className="flex gap-8 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
                System Status: Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
      <Chatbot
        darkMode={false}
        role="customer"
        context="Customer Side: Use this to help customers with navigation, product queries, and general support. Currently viewing the Home Page."
      />
    </div>
  );
}