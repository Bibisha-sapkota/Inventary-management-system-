import { Link } from "react-router-dom"; 

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-20">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
            Stock Inventory for Grocery Stores
          </h1>
          <p className="text-lg text-gray-700">
            Track stock, manage suppliers, handle billing & reduce waste with a 
            modern inventory system made for small and big grocery shops.
          </p>
          <div className="flex gap-4 mt-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-orange-400 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold 
                         hover:from-orange-500 hover:to-blue-600 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-500 to-orange-400 text-white px-6 py-3 rounded-lg font-semibold 
                         hover:from-blue-600 hover:to-orange-500 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-10 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Powerful Features for Grocery Shops
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="p-6 bg-blue-400 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Stock Management</h3>
            <p className="text-gray-800">
              Track your grocery items, monitor quantities and get alerts when stock is low.
            </p>
          </div>

          <div className="p-6 bg-green-400 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Expiry Alerts</h3>
            <p className="text-gray-800">
              Prevent waste by receiving automatic expiry notifications.
            </p>
          </div>

          <div className="p-6 bg-yellow-200 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Warehouse</h3>
            <p className="text-gray-800">
              Manage multiple store locations from a single dashboard.
            </p>
          </div>

          <div className="p-6 bg-blue-600 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Customer</h3>
            <p className="text-gray-800">
              Track customer profiles, purchase history, and engagement.
            </p>
          </div>

          <div className="p-6 bg-green-200 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Discount Alerts</h3>
            <p className="text-gray-800">
              Receive notifications on ongoing promotions and discount expiries.
            </p>
          </div>

          <div className="p-6 bg-purple-400 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Orders</h3>
            <p className="text-gray-800">
              Monitor and manage all store orders in real-time.
            </p>
          </div>

        </div>
      </section>

      <section className="text-center py-16 bg-orange-600 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">
          Join thousands of grocery shop owners using modern inventory software.
        </p>
        
        <Link
          to="/register"
          className="bg-gradient-to-r from-blue-500 to-orange-400 text-white px-8 py-3 rounded-lg font-semibold 
                     hover:from-blue-600 hover:to-orange-500 transition"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
