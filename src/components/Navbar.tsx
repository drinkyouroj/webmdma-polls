import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FiMenu, FiX, FiHome, FiPlusCircle, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">WebMDMA Polls</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
              <FiHome className="mr-1" /> Home
            </Link>
            {user ? (
              <>
                <Link to="/create-poll" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                  <FiPlusCircle className="mr-1" /> Create Poll
                </Link>
                <Link to="/profile" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                  <FiUser className="mr-1" /> {profile?.username || 'Profile'}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                >
                  <FiLogOut className="mr-1" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                  <FiLogIn className="mr-1" /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm btn-icon">
                  <FiUserPlus className="mr-1" /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHome className="mr-2" /> Home
            </Link>
            {user ? (
              <>
                <Link 
                  to="/create-poll" 
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPlusCircle className="mr-2" /> Create Poll
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser className="mr-2" /> {profile?.username || 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                >
                  <FiLogOut className="mr-2" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="mr-2" /> Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUserPlus className="mr-2" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;