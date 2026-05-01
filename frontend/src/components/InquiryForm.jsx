import React, { useState } from 'react';
import axios from 'axios';

const InquiryForm = ({ compact = false, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Demo',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axios.post('http://localhost:5000/api/inquiries', formData);
            if (res.data.success) {
                setStatus({ type: 'success', message: res.data.message });
                setFormData({ name: '', email: '', phone: '', subject: 'Demo', message: '' });
                if (onSuccess) setTimeout(onSuccess, 2000);
            }
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Something went wrong. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full ${compact ? '' : 'bg-white p-8 rounded-3xl shadow-xl border border-gray-100'}`}>
            {!compact && (
                <div className="mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Get in <span className="text-green-600">Touch</span></h3>
                    <p className="text-gray-500 font-medium">Have questions? Our experts are here to help you optimize your inventory.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-gray-900"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">Phone (Optional)</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+977 98XXXXXXXX"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">Subject</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-gray-900 appearance-none"
                        >
                            <option value="Demo">Request a Demo</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Tell us about your business needs..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-gray-900 resize-none"
                    ></textarea>
                </div>

                {status.message && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fadeIn ${
                        status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                        {status.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
                        {status.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </button>
            </form>
        </div>
    );
};

export default InquiryForm;
