import { Link } from 'react-router-dom';
import { FiHome, FiInfo, FiShield, FiFileText, FiHeart, FiGithub } from 'react-icons/fi';

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
              <FiGithub size={16} />
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