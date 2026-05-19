// src/components/customer/DocumentationTab.jsx

export default function DocumentationTab() {
  const sections = [
    {
      title: "Getting Started",
      
      items: [
        { q: "How to browse products?", a: "Navigate to the 'Browse Products' tab to view all available items. Use filters to narrow down your search." },
        { q: "How to add items to cart?", a: "Click the 'Add to Cart' button on any product card. You can adjust quantities in the cart." },
      ],
    },
    {
      title: "Orders & Checkout",
      
      items: [
        { q: "How to place an order?", a: "Add items to your cart, go to the Cart tab, and click 'Proceed to Checkout'." },
        { q: "How to track my order?", a: "Visit the 'Order History' tab to see real-time status updates for all your orders." },
        { q: "Can I cancel an order?", a: "Yes, orders can be cancelled while they are in 'Pending' or 'Processing' status." },
      ],
    },
    {
      title: "Account Management",
      
      items: [
        { q: "How to update my profile?", a: "Go to the 'Profile' section to update your personal information and profile photo." },
        { q: "How to change notification settings?", a: "Visit 'Settings' to manage your email and SMS notification preferences." },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Help & Documentation</h2>
        <p className="text-gray-500">Find answers to common questions</p>
      </div>

      {/* Quick Help */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: "💬", title: "Live Chat", desc: "Chat with our support team" },
          { icon: "📧", title: "Email Support", desc: "support@stockinventory.com" },
          { icon: "📞", title: "Phone Support", desc: "+977 1234567890" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-3xl mb-2 block">{item.icon}</span>
            <h4 className="font-semibold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ Sections */}
      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            {section.title}
          </h3>
          <div className="space-y-4">
            {section.items.map((item, i) => (
              <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <h4 className="font-medium text-gray-800 mb-1">{item.q}</h4>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}