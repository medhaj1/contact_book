import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-8 bg-gradient-to-r from-cyan-100 to-white">
      <div className="text-center max-w-3xl text-gray-800">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-900">Contact Book</h1>
        <p className="text-lg mb-8 text-gray-700">
          Organize your contacts beautifully. Connect with people that matter.
        </p>
        <button
          onClick={onGetStarted}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(25,118,210,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(25,118,210,0.3)';
          }}
          className="bg-gradient-to-r from-blue-700 to-blue-400 text-white border-none px-8 py-4 text-lg rounded-full cursor-pointer shadow-lg transition-all duration-300"
        >
          Get Started
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-blue-100">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Easy Management</h3>
            <p className="text-sm text-gray-600">
              Add, edit, and organize your contacts with intuitive interface
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-blue-100">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600">
              Find contacts instantly with powerful search and filtering
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-blue-100">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Categories</h3>
            <p className="text-sm text-gray-600">
              Organize contacts into custom categories for better management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
