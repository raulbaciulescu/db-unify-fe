import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConnectionType, DatabaseConnection } from '../types/connection';
import { fetchConnections } from '../services/api';

interface ConnectionContextType {
  connections: DatabaseConnection[];
  loading: boolean;
  error: string | null;
  refreshConnections: () => Promise<void>;
  getConnectionById: (id: number) => DatabaseConnection | undefined;
}

const ConnectionContext = createContext<ConnectionContextType>({
  connections: [],
  loading: false,
  error: null,
  refreshConnections: async () => {},
  getConnectionById: () => undefined,
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

  const getConnectionById = (id: number) => {
    return connections.find(conn => conn.id === id);
  };

  return (
    <ConnectionContext.Provider value={{ 
      connections, 
      loading,
      error,
      refreshConnections,
      getConnectionById,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};