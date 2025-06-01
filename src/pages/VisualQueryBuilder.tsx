import React, { useState, useEffect } from 'react';
import { useConnections } from '../context/ConnectionContext';
import DatabaseSelector from '../components/query-builder/DatabaseSelector';
import ResultsTable from '../components/query-builder/ResultsTable';
import { DatabaseConnection, ConnectionStatus, TableSchema } from '../types/connection';
import { Play, Table as TableIcon, Plus, X, ArrowRight, Database, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchMetadata, executeSqlQuery } from '../services/api';

interface TableSelection {
  connectionId: string;
  name: string;
  alias: string;
  joinType?: 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN';
  joinCondition?: string;
}

interface ColumnSelection {
  connectionId: string;
  table: string;
  column: string;
  alias?: string;
  aggregate?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  condition?: string;
}

interface MetadataState {
  data: TableSchema[];
  error: string | null;
  loading: boolean;
}

const VisualQueryBuilder: React.FC = () => {
  const { connections } = useConnections();
  const { darkMode } = useTheme();

  const [tablesMetadata, setTablesMetadata] = useState<Map<string, MetadataState>>(new Map());
  const [selectedTables, setSelectedTables] = useState<TableSelection[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnSelection[]>([]);
  const [whereConditions, setWhereConditions] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<{column: string, direction: 'ASC' | 'DESC'}[]>([]);
  const [limit, setLimit] = useState<number>(100);
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load metadata for all connections
  useEffect(() => {
    const loadAllMetadata = async () => {
      const metadataMap = new Map<string, MetadataState>();

      for (const connection of connections) {
        // Initialize state for this connection
        metadataMap.set(connection.id, {
          data: [],
          error: null,
          loading: true
        });
        setTablesMetadata(new Map(metadataMap));

        try {
          const metadata = await fetchMetadata(parseInt(connection.id));
          metadataMap.set(connection.id, {
            data: metadata || [], // Ensure we always have an array
            error: null,
            loading: false
          });
        } catch (err) {
          console.error(`Failed to fetch metadata for connection ${connection.id}:`, err);
          metadataMap.set(connection.id, {
            data: [],
            error: 'Failed to load tables',
            loading: false
          });
        }
        setTablesMetadata(new Map(metadataMap));
      }
    };

    loadAllMetadata();
  }, [connections]);

  const handleAddTable = (connectionId: string, tableName: string) => {
    if (!tableName) return;

    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    const alias = `${tableName}_${selectedTables.length + 1}`;
    setSelectedTables([...selectedTables, {
      connectionId,
      name: tableName,
      alias
    }]);
  };

  const handleRemoveTable = (index: number) => {
    setSelectedTables(selectedTables.filter((_, i) => i !== index));
    setSelectedColumns(selectedColumns.filter(col =>
        col.table !== selectedTables[index].alias
    ));
  };

  const handleAddJoin = (index: number, type: TableSelection['joinType']) => {
    const updatedTables = [...selectedTables];
    updatedTables[index] = { ...updatedTables[index], joinType: type };
    setSelectedTables(updatedTables);
  };

  const handleAddColumn = (connectionId: string, table: string, column: string) => {
    if (!connectionId || !table || !column) return;
    setSelectedColumns([...selectedColumns, { connectionId, table, column }]);
  };

  const handleRemoveColumn = (index: number) => {
    setSelectedColumns(selectedColumns.filter((_, i) => i !== index));
  };

  const handleExecuteQuery = async () => {
    if (selectedTables.length === 0) {
      setError('Please select at least one table');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build the federated query
      let query = 'SELECT ';

      if (selectedColumns.length === 0) {
        query += '* ';
      } else {
        query += selectedColumns.map(col => {
          let columnStr = '';
          if (col.aggregate) {
            columnStr += `${col.aggregate}(${col.table}.${col.column})`;
          } else {
            columnStr += `${col.table}.${col.column}`;
          }
          if (col.alias) {
            columnStr += ` AS ${col.alias}`;
          }
          return columnStr;
        }).join(', ');
      }

      // Add connection-specific table references
      query += '\nFROM ' + selectedTables.map((table, index) => {
        const connection = connections.find(c => c.id === table.connectionId);
        if (index === 0) {
          return `${connection?.name}.${table.name} ${table.alias}`;
        }
        return `${table.joinType || 'INNER JOIN'} ${connection?.name}.${table.name} ${table.alias} ON ${table.joinCondition}`;
      }).join('\n');

      if (whereConditions.length > 0) {
        query += '\nWHERE ' + whereConditions.join(' AND ');
      }

      if (groupBy.length > 0) {
        query += '\nGROUP BY ' + groupBy.join(', ');
      }

      if (orderBy.length > 0) {
        query += '\nORDER BY ' + orderBy.map(o => `${o.column} ${o.direction}`).join(', ');
      }

      if (limit) {
        query += `\nLIMIT ${limit}`;
      }

      const data = await executeSqlQuery('federated', query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Visual Query Builder</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Build SQL queries visually across multiple databases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tables and Joins Panel */}
          <div className={`rounded-lg border p-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">Tables</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Add Table</label>
              <div className="space-y-4">
                {connections.map(connection => {
                  const metadata = tablesMetadata.get(connection.id);
                  return (
                      <div key={connection.id} className="space-y-2">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {connection.name}
                        </div>

                        {metadata?.loading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            </div>
                        ) : metadata?.error ? (
                            <div className={`flex items-center p-2 rounded-md text-sm
                        ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}
                            >
                              <AlertCircle size={16} className="mr-2" />
                              {metadata.error}
                            </div>
                        ) : (
                            <select
                                className={`w-full p-2 rounded-md border ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                onChange={(e) => handleAddTable(connection.id, e.target.value)}
                                value=""
                                disabled={isLoading}
                            >
                              <option value="" disabled>Select a table</option>
                              {metadata?.data.map(table => (
                                  <option key={table.tableName} value={table.tableName}>
                                    {table.tableName}
                                  </option>
                              ))}
                            </select>
                        )}
                      </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              {selectedTables.map((table, index) => {
                const connection = connections.find(c => c.id === table.connectionId);
                return (
                    <div
                        key={index}
                        className={`p-3 rounded-md border ${
                            darkMode
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Database size={16} className="mr-2" />
                          <span className="font-medium">{connection?.name}</span>
                          <ArrowRight size={12} className="mx-1" />
                          <span className="font-medium">{table.name}</span>
                          <span className="ml-2 text-sm text-gray-500">as {table.alias}</span>
                        </div>
                        <button
                            onClick={() => handleRemoveTable(index)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {index > 0 && (
                          <div className="mt-2">
                            <select
                                className={`w-full p-1 text-sm rounded border ${
                                    darkMode
                                        ? 'bg-gray-600 border-gray-500'
                                        : 'bg-white border-gray-300'
                                }`}
                                value={table.joinType || 'INNER JOIN'}
                                onChange={(e) => handleAddJoin(index, e.target.value as TableSelection['joinType'])}
                            >
                              <option value="INNER JOIN">INNER JOIN</option>
                              <option value="LEFT JOIN">LEFT JOIN</option>
                              <option value="RIGHT JOIN">RIGHT JOIN</option>
                              <option value="FULL JOIN">FULL JOIN</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Join condition..."
                                className={`w-full mt-2 p-1 text-sm rounded border ${
                                    darkMode
                                        ? 'bg-gray-600 border-gray-500 placeholder-gray-400'
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                }`}
                                value={table.joinCondition || ''}
                                onChange={(e) => {
                                  const updatedTables = [...selectedTables];
                                  updatedTables[index] = { ...table, joinCondition: e.target.value };
                                  setSelectedTables(updatedTables);
                                }}
                            />
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>

          {/* Columns Panel */}
          <div className={`rounded-lg border p-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">Columns</h2>

            {selectedTables.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Column</label>
                    <div className="flex gap-2">
                      <select
                          className={`flex-1 p-2 rounded-md border ${
                              darkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          onChange={(e) => {
                            const [connectionId, table, column] = e.target.value.split('.');
                            if (connectionId && table && column) {
                              handleAddColumn(connectionId, table, column);
                            }
                          }}
                          value=""
                      >
                        <option value="" disabled>Select a column</option>
                        {selectedTables.map(table => {
                          const connection = connections.find(c => c.id === table.connectionId);
                          const metadata = tablesMetadata.get(table.connectionId);
                          const tableSchema = metadata?.data.find(t => t.tableName === table.name);

                          if (metadata?.loading) {
                            return (
                                <optgroup key={`${table.connectionId}.${table.name}`} label="Loading...">
                                  <option disabled>Loading columns...</option>
                                </optgroup>
                            );
                          }

                          if (metadata?.error) {
                            return (
                                <optgroup key={`${table.connectionId}.${table.name}`} label={`${connection?.name} - Error`}>
                                  <option disabled>Failed to load columns</option>
                                </optgroup>
                            );
                          }

                          return (
                              <optgroup key={`${table.connectionId}.${table.name}`} label={`${connection?.name} - ${table.name}`}>
                                {tableSchema?.columns.map(column => (
                                    <option
                                        key={`${table.connectionId}.${table.alias}.${column.columnName}`}
                                        value={`${table.connectionId}.${table.alias}.${column.columnName}`}
                                    >
                                      {column.columnName} ({column.dataType})
                                    </option>
                                ))}
                              </optgroup>
                          );
                        })}
                      </select>
                      <button
                          className={`p-2 rounded-md border ${
                              darkMode
                                  ? 'border-gray-600 hover:bg-gray-700'
                                  : 'border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedColumns.map((col, index) => {
                      const table = selectedTables.find(t => t.alias === col.table);
                      const connection = connections.find(c => c.id === table?.connectionId);
                      return (
                          <div
                              key={index}
                              className={`p-2 rounded-md border flex items-center justify-between ${
                                  darkMode
                                      ? 'bg-gray-700 border-gray-600'
                                      : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium">{connection?.name}</span>
                              <ArrowRight size={12} className="mx-1" />
                              <span className="font-medium">{col.table}</span>
                              <ArrowRight size={12} className="mx-1" />
                              <span>{col.column}</span>
                              {col.aggregate && (
                                  <span className="ml-2 text-sm text-gray-500">({col.aggregate})</span>
                              )}
                            </div>
                            <button
                                onClick={() => handleRemoveColumn(index)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          </div>
                      );
                    })}
                  </div>
                </div>
            ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add tables to select columns
                </div>
            )}
          </div>

          {/* Conditions Panel */}
          <div className={`rounded-lg border p-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">Conditions</h2>

            {selectedTables.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Where Conditions</label>
                    <input
                        type="text"
                        placeholder="Add condition..."
                        className={`w-full p-2 rounded-md border ${
                            darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            setWhereConditions([...whereConditions, e.currentTarget.value]);
                            e.currentTarget.value = '';
                          }
                        }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Group By</label>
                    <select
                        className={`w-full p-2 rounded-md border ${
                            darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        onChange={(e) => {
                          if (e.target.value) {
                            setGroupBy([...groupBy, e.target.value]);
                            e.target.value = '';
                          }
                        }}
                        value=""
                    >
                      <option value="" disabled>Add group by...</option>
                      {selectedColumns.map((col, index) => (
                          <option key={index} value={`${col.table}.${col.column}`}>
                            {col.table}.{col.column}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Order By</label>
                    <div className="flex gap-2">
                      <select
                          className={`flex-1 p-2 rounded-md border ${
                              darkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          onChange={(e) => {
                            if (e.target.value) {
                              setOrderBy([...orderBy, { column: e.target.value, direction: 'ASC' }]);
                              e.target.value = '';
                            }
                          }}
                          value=""
                      >
                        <option value="" disabled>Add order by...</option>
                        {selectedColumns.map((col, index) => (
                            <option key={index} value={`${col.table}.${col.column}`}>
                              {col.table}.{col.column}
                            </option>
                        ))}
                      </select>
                      <select
                          className={`w-24 p-2 rounded-md border ${
                              darkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      >
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Limit</label>
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                        className={`w-full p-2 rounded-md border ${
                            darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>

                  <button
                      onClick={handleExecuteQuery}
                      disabled={selectedTables.length === 0 || isLoading}
                      className={`w-full mt-4 px-4 py-2 rounded-md flex items-center justify-center
                  ${isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-700'
                      } bg-blue-600 text-white`}
                  >
                    <Play size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Executing...' : 'Execute Query'}
                  </button>
                </div>
            ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add tables to set conditions
                </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
              <ResultsTable data={results} darkMode={darkMode} />
            </div>
        )}

        {error && (
            <div className={`mt-6 p-4 rounded-md ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
        )}
      </div>
  );
};

export default VisualQueryBuilder;