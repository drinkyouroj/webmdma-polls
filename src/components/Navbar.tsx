import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">WebMDMA Polls</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/create-poll" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white">
                  Create Poll
                </Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
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
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  to="/create-poll" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Poll
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
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