import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConnectionType, DatabaseConnection, ConnectionStatus } from '../types/connection';
import { fetchConnections } from '../services/api';

interface ConnectionContextType {
  connections: DatabaseConnection[];
  loading: boolean;
  error: string | null;
  refreshConnections: () => Promise<void>;
  getConnectionById: (id: string) => DatabaseConnection | undefined;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => void;
  addConnection: (connection: DatabaseConnection) => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  connections: [],
  loading: false,
  error: null,
  refreshConnections: async () => {},
  getConnectionById: () => undefined,
  removeConnection: () => {},
  updateConnection: () => {},
  addConnection: () => {},
});

export const useConnections = () => useContext(ConnectionContext);

interface ConnectionProviderProps {
  children: React.ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConnections();
      setConnections(data);
    } catch (err) {
      setError('Failed to fetch database connections');
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConnections();
  }, []);

  const getConnectionById = (id: string) => {
    return connections.find(conn => conn.id === id);
  };

  const removeConnection = (id: string) => {
    setConnections(prevConnections =>
        prevConnections.filter(conn => conn.id !== id)
    );
  };

  const updateConnection = (id: string, updates: Partial<DatabaseConnection>) => {
    setConnections(prevConnections =>
        prevConnections.map(conn =>
            conn.id === id ? { ...conn, ...updates } : conn
        )
    );
  };

  const addConnection = (connection: DatabaseConnection) => {
    setConnections(prevConnections => [...prevConnections, connection]);
  };

  return (
      <ConnectionContext.Provider value={{
        connections,
        loading,
        error,
        refreshConnections,
        getConnectionById,
        removeConnection,
        updateConnection,
        addConnection,
      }}>
        {children}
      </ConnectionContext.Provider>
  );
};