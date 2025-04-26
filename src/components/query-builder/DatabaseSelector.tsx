import React, { useState } from 'react';
import { ChevronDown, Database } from 'lucide-react';
import { DatabaseConnection } from '../../types/connection';
import { useTheme } from '../../context/ThemeContext';

interface DatabaseSelectorProps {
  connections: DatabaseConnection[];
  selectedConnection: DatabaseConnection | null;
  onSelect: (connection: DatabaseConnection) => void;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({ 
  connections,
  selectedConnection,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'postgresql': return 'text-blue-600 dark:text-blue-400';
      case 'mysql': return 'text-orange-600 dark:text-orange-400';
      case 'oracle': return 'text-red-600 dark:text-red-400';
      case 'sqlserver': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-md border flex items-center justify-between min-w-52
          ${darkMode 
            ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center">
          {selectedConnection ? (
            <>
              <span className={`mr-2 ${getTypeColor(selectedConnection.type)}`}>
                <Database size={16} />
              </span>
              <span className="truncate max-w-32">
                {selectedConnection.name}
              </span>
            </>
          ) : (
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              Select a database
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 mt-1 w-64 max-h-96 overflow-y-auto z-10 rounded-md shadow-lg
            ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {connections.length > 0 ? (
            <div className="py-1">
              {connections.map(connection => (
                <button
                  key={connection.id}
                  onClick={() => {
                    onSelect(connection);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center
                    ${selectedConnection?.id === connection.id
                      ? (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className={`mr-2 ${getTypeColor(connection.type)}`}>
                    <Database size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{connection.name}</div>
                    <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {connection.host}:{connection.port} • {connection.database}
                    </div>
                  </div>
                  {connection.status === 'connected' && (
                    <span className="h-2 w-2 ml-2 rounded-full bg-green-500"></span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className={`py-4 px-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No connections available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseSelector;