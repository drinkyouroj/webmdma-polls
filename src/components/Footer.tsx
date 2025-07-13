import { Link } from 'react-router-dom';
import { FiHome, FiInfo, FiShield, FiFileText, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                WebMDMA Polls
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center md:text-left">
              Create and share polls with the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    <FiHome className="mr-2" size={14} /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/create-poll" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    <FiFileText className="mr-2" size={14} /> Create Poll
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    <FiShield className="mr-2" size={14} /> Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    <FiFileText className="mr-2" size={14} /> Terms
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    <FiInfo className="mr-2" size={14} /> About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://github.com/drinkyouroj/webmdma-polls" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <span className="sr-only">GitHub</span>
              <svg className="h-1 w-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {currentYear} WebMDMA Polls. All rights reserved.
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
              Made with <FiHeart className="inline text-red-500" size={12} /> by the community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;