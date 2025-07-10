import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner dark:bg-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} WebMDMA Polls. All rights reserved.
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Home
            </Link>
            <Link to="/about" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;