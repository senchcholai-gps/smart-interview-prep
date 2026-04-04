import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartInterview.ai
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  HOME
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  ABOUT US
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  SERVICES
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  CONTACT
                </a>
              </div>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <a href="#" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow">
                  Take an Interview
                </a>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  LOGIN
                </button>
                <button 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
                >
                  SIGN UP
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;