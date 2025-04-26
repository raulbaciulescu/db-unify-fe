import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConnections } from '../context/ConnectionContext';
import QueryEditor from '../components/query-builder/QueryEditor';
import ResultsTable from '../components/query-builder/ResultsTable';
import DatabaseSelector from '../components/query-builder/DatabaseSelector';
import QueryHistory from '../components/query-builder/QueryHistory';
import { DatabaseConnection, ConnectionStatus } from '../types/connection';
import { Play, Save, Clock, Database as DatabaseIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const QueryBuilder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const connectionId = searchParams.get('connectionId');
  const { connections, getConnectionById, updateConnection } = useConnections();
  const { darkMode } = useTheme();
  
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [query, setQuery] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<{id: string, query: string, timestamp: Date}[]>([]);
  
  // Load connection from URL param if provided
  useEffect(() => {
    if (connectionId) {
      const connection = getConnectionById(connectionId);
      if (connection) {
        setSelectedConnection(connection);
      }
    }
  }, [connectionId, getConnectionById]);

  const handleConnectionChange = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setQuery('SELECT * FROM users LIMIT 10;'); // Reset query
    setResults(null);
    setError(null);
  };

  const handleRunQuery = () => {
    if (!selectedConnection) {
      setError('No database connection selected');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    
    // Update connection status to Connected
    if (selectedConnection.status !== ConnectionStatus.Connected) {
      updateConnection(selectedConnection.id, { 
        status: ConnectionStatus.Connected,
        lastConnected: new Date() 
      });
    }
    
    // Add to query history
    const newHistoryItem = {
      id: `query-${Date.now()}`,
      query,
      timestamp: new Date()
    };
    
    setQueryHistory([newHistoryItem, ...queryHistory]);
    
    // Simulate query execution
    setTimeout(() => {
      try {
        // Mock data for demo
        if (query.toLowerCase().includes('select')) {
          const mockData = generateMockData(query);
          setResults(mockData);
          setError(null);
        } else {
          setResults([{ message: 'Query executed successfully', affectedRows: 5 }]);
          setError(null);
        }
      } catch (e) {
        setError('Error executing query: ' + e.message);
        setResults(null);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  // Generate mock data based on the query
  const generateMockData = (query: string) => {
    const lowerQuery = query.toLowerCase();
    let rows = [];
    
    if (lowerQuery.includes('users')) {
      rows = [
        { id: 1, username: 'johndoe', email: 'john@example.com', created_at: '2023-01-15' },
        { id: 2, username: 'janedoe', email: 'jane@example.com', created_at: '2023-02-20' },
        { id: 3, username: 'bobsmith', email: 'bob@example.com', created_at: '2023-03-10' },
        { id: 4, username: 'alicesmith', email: 'alice@example.com', created_at: '2023-04-05' },
        { id: 5, username: 'charliebrown', email: 'charlie@example.com', created_at: '2023-05-12' },
      ];
    } else if (lowerQuery.includes('products')) {
      rows = [
        { id: 1, name: 'Laptop', price: 1299.99, category: 'Electronics', stock: 45 },
        { id: 2, name: 'Smartphone', price: 799.99, category: 'Electronics', stock: 120 },
        { id: 3, name: 'Desk Chair', price: 249.99, category: 'Furniture', stock: 32 },
        { id: 4, name: 'Coffee Maker', price: 89.99, category: 'Appliances', stock: 67 },
        { id: 5, name: 'Headphones', price: 159.99, category: 'Electronics', stock: 98 },
      ];
    } else if (lowerQuery.includes('orders')) {
      rows = [
        { id: 1, user_id: 3, total: 1349.98, status: 'Completed', created_at: '2023-05-18' },
        { id: 2, user_id: 1, total: 899.97, status: 'Processing', created_at: '2023-05-19' },
        { id: 3, user_id: 2, total: 159.99, status: 'Shipped', created_at: '2023-05-20' },
        { id: 4, user_id: 5, total: 2499.95, status: 'Pending', created_at: '2023-05-21' },
        { id: 5, user_id: 4, total: 339.98, status: 'Completed', created_at: '2023-05-22' },
      ];
    } else {
      rows = [
        { column1: 'Value 1A', column2: 'Value 2A', column3: 'Value 3A' },
        { column1: 'Value 1B', column2: 'Value 2B', column3: 'Value 3B' },
        { column1: 'Value 1C', column2: 'Value 2C', column3: 'Value 3C' },
        { column1: 'Value 1D', column2: 'Value 2D', column3: 'Value 3D' },
        { column1: 'Value 1E', column2: 'Value 2E', column3: 'Value 3E' },
      ];
    }
    
    // If query contains a LIMIT clause, limit the results
    if (lowerQuery.includes('limit')) {
      const limitMatch = lowerQuery.match(/limit\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        const limit = parseInt(limitMatch[1], 10);
        return rows.slice(0, limit);
      }
    }
    
    return rows;
  };

  const handleQuerySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowHistory(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Query Builder</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Build and execute SQL queries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-md border transition-colors
              ${darkMode 
                ? 'border-gray-700 hover:bg-gray-700' 
                : 'border-gray-300 hover:bg-gray-100'
              }`}
          >
            <Clock size={18} />
          </button>
          <DatabaseSelector 
            connections={connections}
            selectedConnection={selectedConnection}
            onSelect={handleConnectionChange}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full gap-4">
        <div className={`flex-1 ${showHistory ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                SQL Query
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRunQuery}
                  disabled={!selectedConnection || isRunning}
                  className={`px-3 py-1.5 rounded-md flex items-center text-sm
                    ${!selectedConnection || isRunning
                      ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                    }
                  `}
                >
                  <Play size={14} className={`mr-1 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running...' : 'Run Query'}
                </button>
                <button
                  disabled={!query.trim()}
                  className={`px-3 py-1.5 rounded-md flex items-center text-sm
                    ${!query.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    }
                    ${darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                >
                  <Save size={14} className="mr-1" />
                  Save
                </button>
              </div>
            </div>
            
            <QueryEditor 
              value={query} 
              onChange={setQuery}
              darkMode={darkMode}
            />
          </div>

          <div className="h-[calc(100%-200px)]">
            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Results
            </div>
            
            {error ? (
              <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300 rounded-md">
                {error}
              </div>
            ) : results ? (
              <ResultsTable data={results} darkMode={darkMode} />
            ) : (
              <div className={`p-6 flex flex-col items-center justify-center rounded-md border border-dashed h-full
                ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
              >
                <DatabaseIcon size={36} className="mb-2 opacity-40" />
                <p className="text-center">
                  {selectedConnection 
                    ? 'Run a query to see results here'
                    : 'Select a database connection to begin'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        {showHistory && (
          <div className="lg:w-1/3 h-full">
            <QueryHistory 
              history={queryHistory}
              onSelectQuery={handleQuerySelect}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryBuilder;