import React from 'react';
import {DatabaseConnection, ConnectionStatus, ConnectionType} from '../../types/connection';
import { Trash2, RefreshCw, Star, Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface ConnectionCardProps {
  connection: DatabaseConnection;
  onRemove: () => void;
  onTest: () => void;
  onToggleFavorite: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ 
  connection, 
  onRemove, 
  onTest, 
  onToggleFavorite 
}) => {
  const { darkMode } = useTheme();
  
  const getTypeConfig = () => {
    switch (connection.databaseType) {
      case ConnectionType.PostgreSQL:
        return {
          name: 'PostgreSQL',
          color: 'text-blue-600',
          bgColor: darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-100'
        };
      case ConnectionType.MySQL:
        return {
          name: 'MySQL',
          color: 'text-orange-600',
          bgColor: darkMode ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-100'
        };
      case ConnectionType.Oracle:
        return {
          name: 'Oracle',
          color: 'text-red-600',
          bgColor: darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-100'
        };
      case ConnectionType.SQLServer:
        return {
          name: 'SQL Server',
          color: 'text-purple-600',
          bgColor: darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-100'
        };
      default:
        return {
          name: 'Unknown',
          color: 'text-gray-600',
          bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-100'
        };
    }
  };

  const getStatusConfig = () => {
    switch (connection.status) {
      case ConnectionStatus.Connected:
        return {
          label: 'Connected',
          color: 'text-green-600',
          bgColor: darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-100'
        };
      case ConnectionStatus.Testing:
        return {
          label: 'Testing...',
          color: 'text-yellow-600',
          bgColor: darkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-100'
        };
      case ConnectionStatus.Failed:
        return {
          label: 'Failed',
          color: 'text-red-600',
          bgColor: darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-100'
        };
      default:
        return {
          label: 'Disconnected',
          color: 'text-gray-600',
          bgColor: darkMode ? 'bg-gray-700' : 'bg-gray-200'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const statusConfig = getStatusConfig();
  
  return (
    <div className={`rounded-lg overflow-hidden border shadow transition-transform duration-200 hover:shadow-md
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${typeConfig.bgColor} ${typeConfig.color} mr-2`}>
              <Database size={16} />
            </div>
            <h3 className="font-semibold text-lg">{connection.name}</h3>
          </div>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded-full transition-colors
              ${connection.favorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : `${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'}`
              }`
            }
          >
            <Star size={18} fill={connection.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="text-sm mb-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} mr-2`}>
            {statusConfig.label}
          </span>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
            {typeConfig.name}
          </span>
        </div>
        
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
          <div>{connection.host}:{connection.port}</div>
          <div>Database: {connection.database}</div>
          <div>Username: {connection.username}</div>
        </div>
        
        <div className="flex justify-between pt-2 border-t mt-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={onTest}
            className={`flex items-center text-sm font-medium ${
              connection.status === ConnectionStatus.Testing 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:underline'
            } ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
            disabled={connection.status === ConnectionStatus.Testing}
          >
            <RefreshCw size={14} className={`mr-1 ${connection.status === ConnectionStatus.Testing ? 'animate-spin' : ''}`} />
            Test
          </button>
          
          <Link
            to={`/query-builder?connectionId=${connection.id}`}
            className={`flex items-center text-sm font-medium hover:underline ${darkMode ? 'text-green-400' : 'text-green-600'}`}
          >
            Query <ExternalLink size={14} className="ml-1" />
          </Link>
          
          <button
            onClick={onRemove}
            className={`flex items-center text-sm font-medium hover:underline ${darkMode ? 'text-red-400' : 'text-red-600'}`}
          >
            <Trash2 size={14} className="mr-1" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;