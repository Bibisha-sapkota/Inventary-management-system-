import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans pt-24 pb-20">
            {/* Navbar Placeholder */}
            <nav className="fixed top-0 left-0 w-full bg-white border-b z-[100] px-6 md:px-10 py-4 flex justify-between items-center shadow-sm">
                <Link to="/" className="flex items-center gap-2">
                    <div className="text-xl md:text-2xl font-extrabold tracking-wide text-gray-800 uppercase tracking-tighter">
                        Stock <span className="text-green-600">Inventory</span>
                    </div>
                </Link>
                <div className="hidden md:flex gap-8 text-gray-600 font-bold text-xs uppercase tracking-widest">
                    <Link to="/" className="hover:text-green-600 transition-all">Home</Link>
                    <Link to="/pricing" className="hover:text-green-600 transition-all">Pricing</Link>
                    <Link to="/contact" className="hover:text-green-600 transition-all">Contact</Link>
                </div>
                <Link to="/signup" className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-md">
                    Get Started
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-12 text-center">
                    <span className="inline-block bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        Updated April 2024
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase">
                        Terms & <span className="text-green-600">Conditions</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Please read these terms carefully before using our inventory management system.</p>
                </div>

                <div className="prose prose-green max-w-none space-y-10 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Stock Inventory System, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use the system.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">2. Subscription & Payments</h2>
                        <p>
                            Our services are billed on a subscription basis (monthly or annually). Payments are non-refundable unless otherwise specified. Failure to pay may result in suspension of access to your store data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">3. Data Privacy & Security</h2>
                        <p>
                            We take data security seriously. Your inventory, sales, and customer data are encrypted and stored securely. However, you are responsible for maintaining the confidentiality of your account password.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">4. Usage Restrictions</h2>
                        <p>
                            You may not use the system for any illegal activities or to store prohibited goods data. We reserve the right to terminate accounts that violate our usage policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">5. Limitation of Liability</h2>
                        <p>
                            While we strive for 99.9% uptime, Stock Inventory System is not liable for any business losses resulting from temporary system downtime or data errors.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 uppercase mb-4">Questions?</h2>
                        <p className="mb-6">If you have any questions regarding these terms, please contact our legal team.</p>
                        <Link to="/contact" className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">
                            Contact Support
                        </Link>
                    </section>
                </div>
            </div>

            {/* Footer Copy */}
            <div className="mt-20 py-10 border-t border-gray-100 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                © 2024 Stock Inventory System · Kathmandu, Nepal
            </div>
        </div>
    );
};

export default TermsPage;
