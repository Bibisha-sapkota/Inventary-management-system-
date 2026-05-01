import React from "react";
import { Link } from "react-router-dom";
import InquiryForm from "../components/InquiryForm";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans pt-24 pb-20 overflow-x-hidden">
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
                    <Link to="/login" className="hover:text-green-600 transition-all">Login</Link>
                </div>
                <Link to="/signup" className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-md">
                    Get Started
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-6 mt-16">
                <div className="text-center mb-20">
                    <span className="inline-block bg-[#e6f7ed] text-[#1db054] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        📞 Contact Us
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter uppercase">
                        GET IN <span className="text-[#1db054]">TOUCH</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
                        Have a question about our features or pricing? Our team is here to help you scale your grocery business.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Contact Info */}
                    <div className="lg:w-1/2 space-y-12">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">Our Offices</h3>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest text-green-600">Kathmandu</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        123 New Road, Ward 24<br />
                                        Kathmandu, Nepal
                                    </p>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest text-green-600">Lalitpur</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        45 Pulchowk, Ward 3<br />
                                        Lalitpur, Nepal
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">Direct Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-green-500 transition-all">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Us</p>
                                        <p className="text-gray-900 font-bold">+977 1 4XXXXXX</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-green-500 transition-all">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Us</p>
                                        <p className="text-gray-900 font-bold">support@stockinventory.com.np</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:w-1/2 w-full">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative z-10">
                                <InquiryForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="mt-32 pt-16 pb-10 bg-gray-900 text-white px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm text-gray-500">© 2024 Stock Inventary System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
