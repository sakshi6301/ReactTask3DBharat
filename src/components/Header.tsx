import React from 'react';
import { Cuboid, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="flex items-center h-16 px-6 bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl z-20 relative"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="p-2 bg-gray-800 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] relative"
        >
          <svg width="0" height="0">
            <linearGradient id="indianFlag" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop stopColor="#FF9933" offset="0%" />
              <stop stopColor="#FFFFFF" offset="50%" />
              <stop stopColor="#138808" offset="100%" />
            </linearGradient>
          </svg>
          <Cuboid className="w-6 h-6" style={{ stroke: 'url(#indianFlag)' }} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 drop-shadow-md">
            <span style={{ 
              background: 'linear-gradient(180deg, #FF9933 10%, #FFFFFF 50%, #138808 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              3D Bharat
            </span>
          </h1>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
