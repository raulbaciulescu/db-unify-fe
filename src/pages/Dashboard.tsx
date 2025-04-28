import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Star, Database } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { ConnectionStatus, ConnectionType } from '../types/connection';
import RecentConnectionItem from '../components/dashboard/RecentConnectionItem';
import ConnectionTypeCard from '../components/dashboard/ConnectionTypeCard';
import StatsCard from '../components/dashboard/StatsCard';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const { connections } = useConnections();
  const { darkMode } = useTheme();
  const [recentConnections, setRecentConnections] = useState([]);
  const [favConnections, setFavConnections] = useState([]);

  useEffect(() => {
    // Get recent connections (sorted by lastConnected)
    const recent = [...connections]
      .filter(c => c.lastConnected)
      .sort((a, b) => new Date(b.lastConnected).getTime() - new Date(a.lastConnected).getTime())
      .slice(0, 5);
    
    setRecentConnections(recent);
    
    // Get favorite connections
    const favorites = connections.filter(c => c.favorite).slice(0, 5);
    setFavConnections(favorites);
  }, [connections]);

  // Count connections by type
  const connCounts = {
    [ConnectionType.PostgreSQL]: connections.filter(c => c.databaseType === ConnectionType.PostgreSQL).length,
    [ConnectionType.MySQL]: connections.filter(c => c.databaseType === ConnectionType.MySQL).length,
    [ConnectionType.Oracle]: connections.filter(c => c.databaseType === ConnectionType.Oracle).length,
    [ConnectionType.SQLServer]: connections.filter(c => c.databaseType === ConnectionType.SQLServer).length,
  };

  const activeConnections = connections.filter(c => c.status === ConnectionStatus.Connected).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Overview of your database connections
        </p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Connections" 
          value={connections.length} 
          icon={<Database className="text-blue-500" />} 
        />
        <StatsCard 
          title="Active Connections" 
          value={activeConnections} 
          icon={<Database className="text-green-500" />} 
        />
        <StatsCard 
          title="Favorite Connections" 
          value={favConnections.length} 
          icon={<Star className="text-yellow-500" />} 
        />
        <StatsCard 
          title="Recent Connections" 
          value={recentConnections.length} 
          icon={<Clock className="text-purple-500" />} 
        />
      </div>
      
      {/* Connection Types */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Database Types</h2>
          <Link to="/connections" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ConnectionTypeCard 
            type={ConnectionType.PostgreSQL} 
            count={connCounts[ConnectionType.PostgreSQL]} 
          />
          <ConnectionTypeCard 
            type={ConnectionType.MySQL} 
            count={connCounts[ConnectionType.MySQL]} 
          />
          <ConnectionTypeCard 
            type={ConnectionType.Oracle} 
            count={connCounts[ConnectionType.Oracle]} 
          />
          <ConnectionTypeCard 
            type={ConnectionType.SQLServer} 
            count={connCounts[ConnectionType.SQLServer]} 
          />
        </div>
      </div>
      
      {/* Recent Connections */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Connections</h2>
          <Link to="/connections" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {recentConnections.length > 0 ? (
            <div>
              {recentConnections.map((connection) => (
                <RecentConnectionItem key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No recent connections
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;