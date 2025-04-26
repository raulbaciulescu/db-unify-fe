import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Database, FileCode, TableProperties, Settings, Blocks } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isOpen }) => {
  const { darkMode } = useTheme();
  
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center py-3 px-4 rounded-md mb-1 transition-all duration-200
        ${isActive 
          ? `${darkMode ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800'}`
          : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
        }
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      {isOpen && <span className="ml-3 transition-opacity duration-200">{label}</span>}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { darkMode } = useTheme();
  
  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out z-10
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        ${isOpen ? 'w-64' : 'w-16'}
        shadow-md overflow-hidden`}
    >
      <div className="p-4">
        <nav>
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" isOpen={isOpen} />
          <NavItem to="/connections" icon={<Database size={20} />} label="Connections" isOpen={isOpen} />
          <NavItem to="/query-builder" icon={<FileCode size={20} />} label="Query Builder" isOpen={isOpen} />
          <NavItem to="/visual-query-builder" icon={<Blocks size={20} />} label="Visual Builder" isOpen={isOpen} />
          <NavItem to="/table-explorer" icon={<TableProperties size={20} />} label="Table Explorer" isOpen={isOpen} />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" isOpen={isOpen} />
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;