import React, { useState } from 'react';
import { Plus, Search, Trash2, RefreshCw, Database } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { ConnectionType, ConnectionStatus, DatabaseConnection } from '../types/connection';
import ConnectionCard from '../components/connections/ConnectionCard';
import AddConnectionModal from '../components/connections/AddConnectionModal';
import { testConnection, deleteConnection } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Connections: React.FC = () => {
  const { connections, removeConnection, updateConnection } = useConnections();
  const { darkMode } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleRemoveConnection = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      try {
        await deleteConnection(id);
        removeConnection(id);
      } catch (error) {
        console.error('Error deleting connection:', error);
        alert('Failed to delete connection. Please try again.');
      }
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      updateConnection(id, { status: ConnectionStatus.Testing });
      const result = await testConnection(parseInt(id));
      updateConnection(id, {
        status: result.connected ? ConnectionStatus.Connected : ConnectionStatus.Failed,
        lastConnected: result.connected ? new Date() : undefined
      });
    } catch (error) {
      updateConnection(id, { status: ConnectionStatus.Failed });
      console.error('Error testing connection:', error);
    }
  };

  const handleToggleFavorite = (id: string, currentValue: boolean) => {
    updateConnection(id, { favorite: !currentValue });
  };

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = (conn.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conn.host || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conn.database || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || conn.databaseType === filterType;

    return matchesSearch && matchesType;
  });

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Database Connections</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your database connections
            </p>
          </div>
          <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add Connection
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className={`relative flex-grow md:max-w-md ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
              ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
          <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
            ${darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="all">All Types</option>
            <option value={ConnectionType.PostgreSQL}>PostgreSQL</option>
            <option value={ConnectionType.MySQL}>MySQL</option>
            <option value={ConnectionType.Oracle}>Oracle</option>
            <option value={ConnectionType.SQLServer}>SQL Server</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnections.map(connection => (
              <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onRemove={() => handleRemoveConnection(connection.id)}
                  onTest={() => handleTestConnection(connection.id)}
                  onToggleFavorite={() => handleToggleFavorite(connection.id, connection.favorite)}
              />
          ))}

          {filteredConnections.length === 0 && (
              <div className={`col-span-3 py-12 flex flex-col items-center justify-center rounded-lg border border-dashed
            ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
              >
                <Database size={48} className="mb-4 opacity-30" />
                <p className="text-lg mb-1">No connections found</p>
                <p className="mb-4 text-sm text-gray-500">
                  {connections.length === 0
                      ? "You haven't added any database connections yet"
                      : "No connections match your search criteria"}
                </p>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Connection
                </button>
              </div>
          )}
        </div>

        {showAddModal && (
            <AddConnectionModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
  );
};

export default Connections;