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
import { executeSqlQuery } from '../services/api';

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
    setQuery('SELECT * FROM users LIMIT 10;');
    setResults(null);
    setError(null);
  };

  const handleRunQuery = async () => {
    if (!selectedConnection) {
      setError('No database connection selected');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const data = await executeSqlQuery(selectedConnection.id, query);
      setResults(data);

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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query');
      setResults(null);

      // Update connection status to Failed
      updateConnection(selectedConnection.id, {
        status: ConnectionStatus.Failed
      });
    } finally {
      setIsRunning(false);
    }
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
                      // disabled={!selectedConnection || isRunning}
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