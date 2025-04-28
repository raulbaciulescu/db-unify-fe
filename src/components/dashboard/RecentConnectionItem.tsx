import React from 'react';
import { Database, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DatabaseConnection } from '../../types/connection';
import { formatDistanceToNow } from '../../utils/date';
import { useTheme } from '../../context/ThemeContext';

interface RecentConnectionItemProps {
  connection: DatabaseConnection;
}

const RecentConnectionItem: React.FC<RecentConnectionItemProps> = ({ connection }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const getTypeColor = () => {
    switch (connection.databaseType) {
      case 'postgresql': return 'text-blue-600';
      case 'mysql': return 'text-orange-600';
      case 'oracle': return 'text-red-600';
      case 'sqlserver': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };
  
  const handleClick = () => {
    navigate(`/query-builder?connectionId=${connection.id}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-50
        ${darkMode 
          ? 'hover:bg-gray-700 border-b border-gray-700' 
          : 'hover:bg-gray-50 border-b border-gray-200'
        }
        ${connection.status === 'connected' ? 'border-l-4 border-l-green-500' : ''}
      `}
    >
      <div className="flex items-center space-x-4">
        <div className={`${getTypeColor()}`}>
          <Database size={20} />
        </div>
        <div>
          <h3 className="font-medium">{connection.name}</h3>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {connection.host}:{connection.port} • {connection.database}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center mr-4 text-sm text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>{connection.lastConnected && formatDistanceToNow(new Date(connection.lastConnected))}</span>
        </div>
        <ExternalLink size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default RecentConnectionItem;