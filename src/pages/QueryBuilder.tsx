import React, { useState, useEffect } from 'react';
import QueryEditor from '../components/query-builder/QueryEditor';
import ResultsTable from '../components/query-builder/ResultsTable';
import QueryHistory from '../components/query-builder/QueryHistory';
import { Play, Save, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { executeSqlQuery } from '../services/api';

const QueryBuilder: React.FC = () => {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<{id: string, query: string, timestamp: Date}[]>([]);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const handleRunQuery = async (loadMore: boolean = false, explicitOffset?: number) => {
    if (!query.trim() && !loadMore) {
      setError('Query cannot be empty');
      return;
    }

    if (!loadMore) {
      setIsRunning(true);
      setError(null);
      setResults(null);
      setCurrentOffset(0);
      setHasMoreData(true);
    }

    try {
      const offset = explicitOffset ?? (loadMore ? currentOffset : 0);
      const response = await executeSqlQuery('default', query, offset);

      setResults(prevResults => {
        if (loadMore && prevResults) {
          return [...prevResults, ...response.results];
        }
        return response.results;
      });

      setCurrentOffset(response.offset);
      setHasMoreData(!response.isDone);

      if (!response.isDone) {
        // Pass the updated offset explicitly
        handleRunQuery(true, response.offset);
      }

      if (!loadMore) {
        const newHistoryItem = {
          id: `query-${Date.now()}`,
          query,
          timestamp: new Date()
        };
        setQueryHistory([newHistoryItem, ...queryHistory]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query');
      setResults(null);
      setHasMoreData(false);
    } finally {
      if (!loadMore) {
        setIsRunning(false);
      }
    }
  };


  const handleQuerySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowHistory(false);
    setCurrentOffset(0);
    setHasMoreData(true);
    setResults(null);
    setIsRunning(false);
    setError(null);
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
                      onClick={() => handleRunQuery(false)}
                      disabled={isRunning}
                      className={`px-3 py-1.5 rounded-md flex items-center text-sm
                    ${isRunning
                          ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                      }`}
                  >
                    <Play size={14} className={`mr-1 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Running...' : 'Run Query'}
                  </button>
                  <button
                      disabled={!query.trim()}
                      className={`px-3 py-1.5 rounded-md flex items-center text-sm
                    ${!query.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                    ${darkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
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
                {isRunning && hasMoreData && <span className="ml-2 text-blue-500">(Loading more...)</span>}
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
                    <p className="text-center">Enter a query and click Run to see results</p>
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