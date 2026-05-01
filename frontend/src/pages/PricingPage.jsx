import React, { useState } from "react";
import { Link } from "react-router-dom";
import contactImg from "../images/contact.png";

// Pricing Card Component
function PricingCard({ plan, price, period, description, features, isPopular, buttonText, highlighted }) {
    return (
        <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 
      ${highlighted
                ? "bg-[#1db054] text-white shadow-2xl scale-105 z-10"
                : "bg-white text-gray-900 border border-gray-100 shadow-xl"
            }`}>

            {isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-32">
                    <img src="https://www.zoho.com/inventory/images/pricing/most-popular.svg" alt="Most Popular" className="w-full" />
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-xl font-black uppercase tracking-wide mb-2 ${highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan}
                </h3>
                <p className={`text-sm leading-relaxed min-h-[40px] ${highlighted ? "text-green-50" : "text-gray-500"}`}>
                    {description}
                </p>
            </div>

            <div className="mb-6 border-b pb-6 border-gray-100/20">
                <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${highlighted ? "text-white" : "text-gray-900"}`}>
                        {price === 0 ? "Free" : `Rs. ${price.toLocaleString()}`}
                    </span>
                    {price !== 0 && (
                        <span className={`text-sm ${highlighted ? "text-green-100" : "text-gray-400"}`}>
                            /{period}
                        </span>
                    )}
                </div>
                {price !== 0 && (
                    <p className={`text-[10px] mt-2 uppercase font-bold tracking-wider ${highlighted ? "text-green-100" : "text-gray-400"}`}>
                        Billed annually · GST extra
                    </p>
                )}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 text-xs font-bold leading-relaxed ${highlighted ? "text-white" : "text-gray-600"}`}>
                        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
              ${highlighted ? "text-white" : "text-green-500"}`}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                className={`w-full text-center py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all
          ${highlighted
                        ? "bg-white text-[#1db054] hover:bg-gray-100 shadow-lg"
                        : "bg-[#1db054] text-white hover:bg-green-700 shadow-md"
                    }`}
            >
                {buttonText}
            </button>
        </div>
    );
}

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState("monthly");

    const plans = {
        monthly: [
            {
                plan: "Free",
                price: 0,
                period: "month",
                description: "Perfect for startups & small stores just getting started.",
                features: ["Up to 50 products", "1 store location", "Basic stock tracking", "Expiry date alerts", "1 admin user", "Email support", "Basic sales report", "Mobile responsive dashboard"],
                buttonText: "Get Started Free",
            },
            {
                plan: "Standard",
                price: 1499,
                period: "month",
                description: "For growing grocery stores needing more power and control.",
                features: ["Up to 500 products", "2 store locations", "Advanced stock management", "Expiry & low stock alerts", "Up to 3 users", "Customer management", "Order management", "Discount & promo alerts", "Priority email support", "Sales & revenue reports"],
                buttonText: "Start Free Trial",
            },
            {
                plan: "Professional",
                price: 3999,
                period: "month",
                description: "Best for established grocery chains with advanced needs.",
                isPopular: true,
                highlighted: true,
                features: ["Unlimited products", "Up to 5 store locations", "Real-time inventory sync", "Advanced expiry tracking", "Up to 10 users", "Customer loyalty programs", "Bulk order management", "Advanced discount management", "Custom reports & analytics", "API access", "24/7 phone & chat support", "Supplier management"],
                buttonText: "Start Free Trial",
            },
            {
                plan: "Enterprise",
                price: 9999,
                period: "month",
                description: "For large chains, supermarkets & franchise businesses.",
                features: ["Unlimited everything", "Unlimited store locations", "Multi branch management", "Custom user roles", "Unlimited users", "Dedicated account manager", "Custom integrations", "White label option", "On premise deployment", "SLA guarantee (99.9% uptime)", "Custom onboarding & training", "Priority 24/7 support"],
                buttonText: "Contact Sales",
            },
        ],
        yearly: [
            { plan: "Free", price: 0, period: "year", description: "Perfect for startups & small stores.", features: ["Up to 50 products", "1 store location", "Basic tracking"], buttonText: "Get Started Free" },
            { plan: "Standard", price: 14990, period: "year", description: "Growing grocery stores power.", features: ["Up to 500 products", "2 store locations", "Priority support"], buttonText: "Start Free Trial" },
            { plan: "Professional", price: 39990, period: "year", description: "Established grocery chains.", isPopular: true, highlighted: true, features: ["Unlimited products", "5 store locations", "24/7 Support"], buttonText: "Start Free Trial" },
            { plan: "Enterprise", price: 99990, period: "year", description: "Large chains & supermarkets.", features: ["Unlimited everything", "SLA Guarantee", "Priority Support"], buttonText: "Contact Sales" },
        ]
    };

    return (
        <div className="min-h-screen bg-white font-sans pt-20 pb-20 overflow-x-hidden">

            {/* Navbar Placeholder - Adjust to match your real navbar */}
            <nav className="fixed top-0 left-0 w-full bg-white border-b z-[100] px-6 md:px-10 py-4 flex justify-between items-center shadow-sm">
                <Link to="/" className="flex items-center gap-2">
                    <div className="text-xl md:text-2xl font-extrabold tracking-wide text-gray-800 uppercase tracking-tighter">
                        Stock <span className="text-green-600">Inventory</span>
                    </div>
                </Link>
                <div className="hidden md:flex gap-8 text-gray-600 font-bold text-xs uppercase tracking-widest">
                    <Link to="/" className="hover:text-green-600 transition-all">Home</Link>
                    <Link to="/contact" className="hover:text-green-600 transition-all">Contact</Link>
                    <Link to="/login" className="hover:text-green-600 transition-all">Login</Link>
                </div>
                <Link to="/signup" className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-md">
                    Get Started
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-6 text-center mt-16">
                <span className="inline-block bg-[#e6f7ed] text-[#1db054] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    💰 Simple Pricing
                </span>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter">
                    CHOOSE YOUR <span className="text-[#1db054]">PLAN</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12 font-medium">
                    Start free. Scale as you grow. No hidden fees, no surprises. All plans include a <strong className="text-gray-900">14-day free trial.</strong>
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-20">
                    <span className={`text-xs font-black uppercase tracking-widest ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                        className={`w-14 h-7 rounded-full transition-all relative ${billingPeriod === 'yearly' ? 'bg-[#1db054]' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${billingPeriod === 'yearly' ? 'left-8' : 'left-1'}`} />
                    </button>
                    <span className={`text-xs font-black uppercase tracking-widest ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-32">
                    {plans[billingPeriod].map((p, idx) => <PricingCard key={idx} {...p} />)}
                </div>

                {/* Features Highlight Section */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32 bg-gray-50 rounded-[3rem] p-12 text-left border border-gray-100">
                    <div className="lg:w-1/2">
                        <img 
                            src={contactImg} 
                            alt="Features Highlight" 
                            className="w-full h-auto drop-shadow-2xl animate-float"
                        />
                    </div>
                    <div className="lg:w-1/2 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                            Everything you need to <br /><span className="text-[#1db054]">Grow your Business</span>
                        </h2>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed">
                            Our plans are designed to provide maximum value for grocery stores of all sizes. From automated inventory tracking to advanced sales analytics, we've got you covered.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { title: "24/7 Support", desc: "Expert help whenever you need it." },
                                { title: "Data Security", desc: "Your business data is always safe." },
                                { title: "Daily Backups", desc: "Never lose your important records." },
                                { title: "Free Updates", desc: "Get all new features automatically." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-green-600">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">{item.title}</h4>
                                        <p className="text-gray-500 text-[11px] font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-32 opacity-70">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><span className="text-orange-400 text-base">🔒</span> Secure & Encrypted</div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><span className="text-red-400 text-base">🚀</span> 14-Day Free Trial</div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><span className="text-blue-400 text-base">💳</span> No Credit Card Required</div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><span className="text-blue-500 text-base">🔄</span> Cancel Anytime</div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><span className="font-bold text-gray-900 text-base">NP</span> Nepal Based Support</div>
                </div>

                {/* Green Footer CTA */}
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#1db054] rounded-[2.5rem] p-16 text-white text-center shadow-2xl relative overflow-hidden">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase">Still not sure? Start for free!</h2>
                        <p className="text-green-50 text-xl max-w-2xl mx-auto mb-10 font-medium">
                            No commitment, no credit card. Try our full system free for 14 days and see the difference yourself.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link to="/signup" className="bg-white text-[#1db054] px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-xl">Start Free Trial →</Link>
                            <Link to="/login" className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">View Demo</Link>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}