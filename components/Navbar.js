import { FaInstagram } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 py-6 bg-primary-950/50 backdrop-blur-md border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-white to-primary-500 bg-clip-text text-transparent">
          LaunchAI
        </div>
        <div className="flex gap-4">
          <a 
            href="https://instagram.com/launchai.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-xl"
            aria-label="Follow us on Instagram"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </nav>
  );
} 