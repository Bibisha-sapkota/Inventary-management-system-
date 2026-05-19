// src/components/customer/DashboardTab.jsx

import React from "react";
import Icons from "./Icons";

export default function DashboardTab({ profile, cartCount, setActiveTab, recentOrders = [], settings = {} }) {
  // Find the most recent active order for the Live Status tracker
  const activeOrder = recentOrders.find(
    (o) => o.status === "Pending" || o.status === "Processing" || o.status === "Shipped"
  ) || recentOrders[0];

  const heroImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="space-y-10 pb-10 max-w-7xl mx-auto">
      {/* TOP SECTION: Main Content (Left) + Live Status (Right) */}
      <div className="grid xl:grid-cols-3 gap-8">
        
        {/* LEFT MAIN CONTENT (Hero & Categories) */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* HERO SECTION */}
          <section className="relative rounded-2xl overflow-hidden shadow-sm h-[280px] flex items-center">
            <img 
              src={heroImage} 
              alt="Fresh Groceries" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
            
            <div className="relative z-10 p-8 md:p-10">
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 inline-block">
                Stock Inventory
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Welcome back, <br />
                <span className="text-emerald-400">
                  {profile.name === "Loading..." ? "User" : profile.name.split(" ")[0]}!
                </span>
              </h1>
              <p className="text-gray-200 mt-3 text-sm md:text-base max-w-md">
                Manage your stock, track live deliveries, and order wholesale supplies seamlessly.
              </p>
              <button
                onClick={() => setActiveTab("products")}
                className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
              >
                Order Stock <Icons.Check className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: "Free Delivery", 
                desc: "Orders over Rs. 500", 
                image: "https://www.shutterstock.com/image-vector/fast-delivery-service-concept-courier-260nw-2529822853.jpg" 
              },
              { 
                title: "100% Fresh", 
                desc: "Quality guaranteed", 
                image: "https://img.freepik.com/premium-vector/one-hundred-percent-100-fresh-label-white-background-vector-illustration_618588-253.jpg" 
              },
              { 
                title: "Secure Payment", 
                desc: "100% protected", 
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLXIeOW-ceSibT1zZXz5UqSO7UKWK_E2JWcg&s" 
              },
              { 
                title: "Same Day", 
                desc: "Express delivery", 
                image: "https://img.freepik.com/premium-vector/red-same-day-delivery-sticker-with-spin-arrow-arrow-vector-illustration_723710-1262.jpg" 
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center mb-4 p-1.5">
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </section>

          {/* REALISTIC CATEGORIES */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Shop by Category</h3>
                <p className="text-sm text-gray-500">Browse our wide selection</p>
              </div>
              <button onClick={() => setActiveTab("products")} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                View All <span className="ml-1">→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Fruits & Vegetables", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80" },
                { name: "Dairy & Eggs", img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80" },
                { name: "Meat & Seafood", img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80" },
                { name: "Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80" },
              ].map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setActiveTab("products")}
                  className="relative h-48 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/80 text-xs mb-1 group-hover:text-emerald-400 transition-colors">Shop Now</p>
                    <h4 className="font-bold text-white leading-tight">{cat.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR (Live Status Widget) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col relative overflow-hidden">
            {/* Blurry glow effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Live Order Status
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </h3>
            </div>

            {activeOrder ? (
              <div className="flex-1 flex flex-col">
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Active Order</p>
                  <p className="font-bold text-emerald-600 text-lg">{activeOrder.id}</p>
                  <p className="text-sm text-gray-700 mt-1 truncate">{activeOrder.products?.join(", ")}</p>
                  <p className="text-xs text-gray-400 mt-2">Placed on: {activeOrder.date}</p>
                </div>

                {/* Vertical Timeline */}
                <div className="flex-1 px-2">
                  <VerticalTimeline currentStatus={activeOrder.status} />
                </div>

                <button 
                  onClick={() => setActiveTab("history")}
                  className="w-full mt-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  View All Orders
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center flex-col text-gray-500">
                <Icons.Package className="w-12 h-12 mb-3 text-gray-300" />
                <p>No active orders right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SPECIAL OFFERS / FEATURED PRODUCTS */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-2 inline-block">Limited Time</span>
            <h3 className="text-xl font-bold text-gray-800">Special Offers</h3>
            <p className="text-sm text-gray-500">Don't miss these inventory deals</p>
          </div>
          <button onClick={() => setActiveTab("products")} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
            View All <span className="ml-1">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { cat: "Dairy & Eggs", name: "Whole Milk 1 Gallon", brand: "DairyPure", price: "Rs. 382", old: "Rs. 449", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", tag1: "-15%", tag2: "Expiring Soon" },
            { cat: "Meat & Seafood", name: "Fresh Atlantic Salmon", brand: "Ocean's Catch", price: "Rs. 1039", old: "Rs. 1299", img: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=400&q=80", tag1: "-20%", tag2: "Expiring Soon", stock: "Only 8 left" },
            { cat: "Bakery", name: "Artisan Sourdough Bread", brand: "Baker's Pride", price: "Rs. 539", old: "Rs. 599", img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80", tag1: "-10%" },
            { cat: "Dairy & Eggs", name: "Greek Yogurt Variety", brand: "Chobani", price: "Rs. 674", old: "Rs. 899", img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80", tag1: "-25%", tag2: "Expiring Soon", stock: "Only 5 left" },
          ].map((prod, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab("products")}>
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {prod.tag1 && <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">{prod.tag1}</span>}
                  {prod.tag2 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">{prod.tag2}</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-gray-500 mb-1">{prod.cat}</p>
                <h4 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-emerald-600 transition-colors">{prod.name}</h4>
                <p className="text-[11px] text-gray-400 mt-1">{prod.brand}</p>
                <div className="flex justify-between items-end mt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">{prod.price}</span>
                    <span className="text-xs text-gray-400 line-through">{prod.old}</span>
                  </div>
                  {prod.stock && <span className="text-[11px] text-orange-500 font-medium">{prod.stock}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US BANNER */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">About Us</span>
          <h2 className="text-2xl font-bold text-gray-800">Why Choose Stock Inventory?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We partner with local farmers and top suppliers to bring you the freshest produce, quality meats, and organic products for your inventory. Our commitment to sustainability and real-time stock management drives everything we do.
          </p>
          <button className="text-emerald-600 font-medium text-sm hover:underline flex items-center gap-1">
            Learn More About Us <Icons.Check className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 w-full">
          <img 
            src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80" 
            alt="Supermarket Shelf" 
            className="w-full h-48 object-cover rounded-xl shadow-inner"
          />
        </div>
      </section>

      {/* BLOG / NEWS SECTION */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">From Our Blog</h3>
            <p className="text-sm text-gray-500">Tips, recipes, and inventory strategies</p>
          </div>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
            View All <span className="ml-1">→</span>
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { type: "Tips", title: "10 Tips for Choosing Fresh Produce", img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80" },
            { type: "Management", title: "Budget-Friendly Stock Prep Ideas", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_9lmRZhKdebmHWAmXzrseYzBRaq1Un30XFg&s" },
            { type: "Community", title: "Supporting Local Farmers", img: "https://images.squarespace-cdn.com/content/v1/62e7a92f066fa3730dcd4604/45aac16c-2627-4849-b682-3dad14374687/support-local-market-1.jpg" },
          ].map((blog, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group shadow-sm">
              <div className="h-40 overflow-hidden">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-2">{blog.type}</p>
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{blog.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT ORDERS TABLE (Full Width at the Bottom) */}
      {recentOrders.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-bold text-[#1f2937]">Recent Orders</h3>
            <button onClick={() => setActiveTab("history")} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
              View All <span className="ml-1">→</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f9fafb] border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 font-bold text-[#6b7280] uppercase tracking-wider text-xs">ORDER ID</th>
                    <th className="px-8 py-5 font-bold text-[#6b7280] uppercase tracking-wider text-xs">PRODUCTS</th>
                    <th className="px-8 py-5 font-bold text-[#6b7280] uppercase tracking-wider text-xs">STATUS</th>
                    <th className="px-8 py-5 font-bold text-[#6b7280] uppercase tracking-wider text-xs text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-[#1f2937] whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-8 py-5 text-[#4b5563]">
                        {order.products?.join(", ") || order.product}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-8 py-5 font-medium text-[#1f2937] text-right whitespace-nowrap">
                        Rs. {order.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

// ------------------------------------------------------------------
// Status Badge Component
// ------------------------------------------------------------------
function StatusBadge({ status }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return "bg-[#ccfbf1] text-[#065f46]"; // Mint green
      case "Processing":
      case "Pending":
        return "bg-[#dbeafe] text-[#1e40af]"; // Light blue
      case "Shipped":
        return "bg-[#f3e8ff] text-[#6b21a8]"; // Light purple
      case "Cancelled":
        return "bg-[#fee2e2] text-[#991b1b]"; // Red
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
}

// ------------------------------------------------------------------
// Vertical Timeline Component for the Live Status Widget
// ------------------------------------------------------------------
function VerticalTimeline({ currentStatus }) {
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentIndex = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === "Cancelled";

  if (isCancelled) {
    return <div className="text-red-500 font-bold bg-red-50 p-3 rounded-lg text-center text-sm">Order Cancelled</div>;
  }

  return (
    <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 mt-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step} className="relative pl-6">
            {/* Dot Indicator */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
              isCompleted ? "border-emerald-500" : 
              isActive ? "border-emerald-500 ring-4 ring-emerald-100" : "border-gray-200"
            }`}>
              {isCompleted && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
              {isActive && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
            </div>

            {/* Step Text Content */}
            <div>
              <p className={`text-sm font-bold ${isActive ? "text-emerald-600" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                {step}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isActive 
                  ? "Currently processing this step" 
                  : isCompleted 
                  ? "Completed successfully" 
                  : "Waiting for update"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}