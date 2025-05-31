import React from 'react';
import { Menu, Sun, Moon, Database } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header 
      className={`h-16 flex items-center justify-between px-4 shadow-md z-10 transition-colors duration-200
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
    >
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 mr-4 rounded-md hover:bg-opacity-10 hover:bg-gray-500 transition-colors duration-200"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Database size={24} className="text-teal-600" />
          <h1 className="text-xl font-bold">DB Unify</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-opacity-10 hover:bg-gray-500 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;