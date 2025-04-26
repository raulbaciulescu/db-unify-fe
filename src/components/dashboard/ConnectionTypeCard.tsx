import React from 'react';
import { Database } from 'lucide-react';
import { ConnectionType } from '../../types/connection';
import { useTheme } from '../../context/ThemeContext';

interface ConnectionTypeCardProps {
  type: ConnectionType;
  count: number;
}

const ConnectionTypeCard: React.FC<ConnectionTypeCardProps> = ({ type, count }) => {
  const { darkMode } = useTheme();
  
  const getTypeConfig = () => {
    switch (type) {
      case ConnectionType.PostgreSQL:
        return {
          name: 'PostgreSQL',
          bgColor: darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100',
          textColor: darkMode ? 'text-blue-400' : 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case ConnectionType.MySQL:
        return {
          name: 'MySQL',
          bgColor: darkMode ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-100',
          textColor: darkMode ? 'text-orange-400' : 'text-orange-800',
          iconColor: 'text-orange-600'
        };
      case ConnectionType.Oracle:
        return {
          name: 'Oracle',
          bgColor: darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-100',
          textColor: darkMode ? 'text-red-400' : 'text-red-800',
          iconColor: 'text-red-600'
        };
      case ConnectionType.SQLServer:
        return {
          name: 'SQL Server',
          bgColor: darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-100',
          textColor: darkMode ? 'text-purple-400' : 'text-purple-800',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          name: 'Unknown',
          bgColor: darkMode ? 'bg-gray-800' : 'bg-gray-100',
          textColor: darkMode ? 'text-gray-300' : 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };
  
  const config = getTypeConfig();
  
  return (
    <div className={`${config.bgColor} rounded-lg p-5 transition-transform duration-200 hover:scale-105`}>
      <div className="flex items-center gap-3">
        <div className={`${config.iconColor}`}>
          <Database size={24} />
        </div>
        <div>
          <h3 className={`font-medium ${config.textColor}`}>{config.name}</h3>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTypeCard;