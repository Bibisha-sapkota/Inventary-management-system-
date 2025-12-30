import { Link } from "react-router-dom";

// Reusable Feature Card Component
function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-[#94EFF7]">
      <h3 className="text-xl font-bold mb-2 text-[#0b5560]">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const features = [
    {
      title: "Stock Management",
      desc: "Track your grocery items, monitor quantities and get alerts when stock is low",
    },
    
    {
      title: "Expiry Alerts",
      desc: "Prevent waste by receiving automatic expiry notifications",
    },
    {
      title: "Warehouse",
      desc: "Manage multiple store locations from a single dashboard",
    },
    {
      title: "Customer",
      desc: "Track customer profiles, purchase history, and engagement.",
    },
    {
      title: "Discount Alerts",
      desc: "Receive notifications on ongoing promotions and discount expiries",
    },
    {
      title: "Orders",
      desc: "Monitor and manage all store orders in real-time.",
    },
    {
      title: "Reporting & Analytics",
      desc: "Generate sales, revenue, and inventory reports.",
    },


  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#94EFF7] via-white to-white font-sans">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 md:px-10 py-4 shadow-sm bg-white fixed top-0 left-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="text-2xl font-extrabold tracking-wide text-[#0b5560] animate-pulse">
          Stock Inventary System 
        </div>

        <div className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a href="#home" className="hover:text-[#0b5560] transition-all">Home</a>
          <a href="#features" className="hover:text-[#0b5560] transition-all">Features</a>
          <a href="#jobseekers" className="hover:text-[#0b5560] transition-all">Job Seekers</a>
          <a href="#employers" className="hover:text-[#0b5560] transition-all">Employers</a>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 border border-[#0b5560] text-[#0b5560] rounded-lg font-semibold hover:bg-[#94EFF7] transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 bg-[#94EFF7] text-[#0b5560] rounded-lg font-semibold hover:bg-[#7bdde8] transition-all duration-300 shadow-md"
          >
            Create Free Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-28 pb-20 px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRroPBlbXE7XM4Oq3iPJtwfJ4MFqBItUs2DFg&s')] bg-cover bg-center"
      >
        {/* Left Text */}
        <div className="animate-fadeInUp bg-black/40 p-6 rounded-xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-white drop-shadow-sm">
            Stock Inventary
          </h1>

          <p className="mt-6 text-white text-lg max-w-md leading-relaxed">
            <b>
              Streamline store operations with the Grocery Management System.
              Handle inventory, billing, supplier management, and customer loyalty
              programs effortlessly.
            </b>
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-[#94EFF7] text-[#0b5560] rounded-xl text-lg font-semibold shadow-lg hover:bg-[#7bdde8] hover:scale-105 transition-transform"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border border-[#0b5560] text-[#0b5560] rounded-xl text-lg font-semibold hover:bg-[#94EFF7] hover:scale-105 transition-transform"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center animate-float">
          <img
            src="https://images.unsplash.com/photo-1598514983332-46a4cf891c64?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="w-full max-w-lg drop-shadow-lg rounded-xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-10 bg-gradient-to-b from-white to-[#94EFF7]">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-[#0b5560]">
          Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      
       
      
      {/* Call to Action Section */}
      <section className="text-center py-16 bg-orange-500 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">
          Join thousands of grocery shop owners using modern inventory software.
        </p>

        <Link
          to="/register"
          className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold"
        >
          Create Free Account
        </Link>
        </section>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </div>


  );
}
