import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Search, HelpCircle, Phone, Mail, ChevronRight, ShoppingBag, Truck, Gift } from 'lucide-react';

const Chatbot = ({ darkMode, externalOpen, setExternalOpen, initialMessage, context, role = 'admin' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');

  // Custom config based on role
  const isCustomer = role === 'customer';
  // USER REQUESTED GREEN THEME
  const themeColor = 'from-green-500 to-emerald-600';
  const botTitle = isCustomer ? 'Grocery Stock Support' : 'Inventory Assistant';
  const botStatus = isCustomer ? 'Customer Expert • Online' : 'Smart AI • Online';
  const welcomeMsg = isCustomer
    ? 'Welcome to Grocery Stock! I am here to help you with your shopping. How can I assist you today?'
    : 'Hi! I am your Grocery Stock Inventory Assistant. How can I help you manage your store today?';

  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: welcomeMsg }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true);
      setActiveTab('chat');
      if (initialMessage) {
        handleSendMessage(null, initialMessage);
      }
      setExternalOpen(false);
    }
  }, [externalOpen, initialMessage, setExternalOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') scrollToBottom();
  }, [chatHistory, activeTab]);

  const handleSendMessage = async (e, directMessage = null) => {
    if (e) e.preventDefault();
    const msgToSend = directMessage || message;
    if (!msgToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: msgToSend };
    setChatHistory(prev => [...prev, userMessage]);
    if (!directMessage) setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: context,
          role: role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.data }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Server connection failed'}` }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Connection error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const adminChips = [
    { label: '🚨 Low Stock', query: 'Which products are low on stock?' },
    { label: '📊 Sales', query: 'Give today sales summary' },
    { label: '🏆 Top Item', query: 'Most sold product?' },
  ];

  const customerChips = [
    { label: '📦 Track Order', query: 'How can I track my recent order?' },
    { label: '🎁 Offers', query: 'Are there any active discount offers?' },
    { label: '🔄 Returns', query: 'What is your return policy?' },
  ];

  const quickChips = isCustomer ? customerChips : adminChips;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-green-500 overflow-hidden p-1"
        >
          <img
            src="https://thumbs.dreamstime.com/b/robot-icon-chat-bot-sign-support-service-concept-chatbot-character-flat-style-robot-icon-chat-bot-sign-support-service-121644324.jpg"
            alt="Chatbot"
            className="w-full h-full object-cover"
          />
        </button>
      )}

      {/* Main Window */}
      {isOpen && (
        <div className={`w-80 sm:w-96 h-[550px] flex flex-col rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border transition-all duration-300 ${darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
          }`}>
          {/* Header */}
          <div className={`p-4 bg-gradient-to-r ${themeColor} text-white`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  {isCustomer ? <ShoppingBag size={20} /> : <Bot size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{botTitle}</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">{botStatus}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Tabs System */}
            <div className="flex gap-2 bg-black/10 p-1 rounded-full w-fit">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${activeTab === 'chat' ? 'bg-white/20 shadow-sm' : 'opacity-60 hover:opacity-100'
                  }`}
              >
                <MessageSquare size={14} />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('helpdesk')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${activeTab === 'helpdesk' ? 'bg-white/20 shadow-sm' : 'opacity-60 hover:opacity-100'
                  }`}
              >
                <Search size={14} />
                Helpdesk
              </button>
            </div>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Quick Actions */}
              {!isLoading && (
                <div className={`px-4 py-3 flex gap-2 overflow-x-hidden ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                  }`}>
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(null, chip.query)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm ${darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500 hover:text-green-600'
                        }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-500 text-white' : (darkMode ? 'bg-gray-700 text-green-400' : 'bg-white text-green-500 border border-gray-200 shadow-sm')
                        }`}>
                        {msg.role === 'user' ? <User size={16} /> : (isCustomer ? <ShoppingBag size={16} /> : <Bot size={16} />)}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-tr-none'
                          : (darkMode ? 'bg-gray-700 text-gray-200 rounded-tl-none border border-gray-600' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm')
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-gray-700 text-green-400' : 'bg-white text-green-500 border'
                        }`}>
                        {isCustomer ? <ShoppingBag size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-white text-gray-800 border shadow-sm'
                        }`}>
                        <Loader2 size={16} className="animate-spin text-green-500" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={`flex-1 p-2 rounded-xl text-sm outline-none transition-all ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                        : 'bg-gray-100 border-gray-100 text-gray-800 focus:border-green-500'
                      } border-2`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Helpdesk View */
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="text-center mb-4">
                <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{isCustomer ? 'Customer Support' : 'How can we help?'}</h4>
                <p className="text-xs text-gray-500">Search for help or contact our team</p>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <Phone size={20} className="mx-auto mb-2 text-green-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>+977 9840864356</p>
                </div>
                <div className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <Mail size={20} className="mx-auto mb-2 text-green-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>support@grocerystock.com</p>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <h5 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Common Questions</h5>
                {(isCustomer ? [
                  { q: 'How to track my order?', a: 'Check the Order History tab for live status updates.' },
                  { q: 'What are the delivery charges?', a: 'We offer free delivery for orders over Rs. 500!' },
                  { q: 'Can I cancel my order?', a: 'Yes, as long as the order is still in "Pending" status.' },
                  { q: 'Payment methods?', a: 'We accept Cash, eSewa, and Khalti for all orders.' }
                ] : [
                  { q: 'How to add new products?', a: 'Go to Products > Add Product and fill the form.' },
                  { q: 'How to manage orders?', a: 'All orders appear in the Orders section instantly.' },
                  { q: 'Where are the reports?', a: 'Check the Dashboard for a live summary or Reports tab.' },
                  { q: 'Setting up QR Payment?', a: 'Configure your credentials in the Settings page.' }
                ]).map((faq, i) => (
                  <button key={i} className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' : 'bg-white border-gray-100 hover:border-green-500 shadow-sm'
                    }`}>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{faq.q}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{faq.a}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                <HelpCircle size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">Need more help? Our experts are here 24/7.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
