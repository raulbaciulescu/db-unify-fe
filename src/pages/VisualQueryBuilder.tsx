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

interface WhereCondition {
  id: string;
  condition: string;
}

interface MetadataState {
  data: TableSchema[];
  error: string | null;
  loading: boolean;
}

const VisualQueryBuilder: React.FC = () => {
  const { connections } = useConnections();
  const { darkMode } = useTheme();

  const [selectedTables, setSelectedTables] = useState<TableSelection[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnSelection[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [groupByColumns, setGroupByColumns] = useState<string[]>([]);
  const [limit, setLimit] = useState<number>(100);
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newWhereCondition, setNewWhereCondition] = useState('');
  const [newColumnAggregate, setNewColumnAggregate] = useState<string>('');
  const [newColumnSelection, setNewColumnSelection] = useState<string>('');
  const [tablesMetadata, setTablesMetadata] = useState<Map<string, MetadataState>>(new Map());

  useEffect(() => {
    const loadAllMetadata = async () => {
      const metadataMap = new Map<string, MetadataState>();

      for (const connection of connections) {
        metadataMap.set(connection.id, {
          data: [],
          error: null,
          loading: true
        });
        setTablesMetadata(new Map(metadataMap));

        try {
          const metadata = await fetchMetadata(parseInt(connection.id));
          metadataMap.set(connection.id, {
            data: metadata || [],
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

    const alias = tableName.toLowerCase();

    if (selectedTables.some(t => t.alias === alias)) {
      setError('Table already added');
      return;
    }

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

  const handleAddColumn = () => {
    if (!newColumnSelection && newColumnAggregate !== 'COUNT') return;
    if (newColumnAggregate === 'COUNT') {
      // For COUNT, we don't need a column selection
      const [connectionId, table] = newColumnSelection.split('.') || [selectedTables[0].connectionId, selectedTables[0].alias];
      setSelectedColumns([...selectedColumns, {
        connectionId,
        table,
        column: '*',
        aggregate: 'COUNT'
      }]);
    } else {
      const [connectionId, table, column] = newColumnSelection.split('.');
      if (!connectionId || !table || !column) return;

      setSelectedColumns([...selectedColumns, {
        connectionId,
        table,
        column,
        aggregate: newColumnAggregate as 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | undefined
      }]);
    }
    setNewColumnSelection('');
    setNewColumnAggregate('');
  };

  const handleRemoveColumn = (index: number) => {
    setSelectedColumns(selectedColumns.filter((_, i) => i !== index));
  };

  const handleAddWhereCondition = () => {
    if (!newWhereCondition.trim()) return;

    setWhereConditions([
      ...whereConditions,
      { id: Date.now().toString(), condition: newWhereCondition.trim() }
    ]);
    setNewWhereCondition('');
  };

  const handleRemoveWhereCondition = (id: string) => {
    setWhereConditions(whereConditions.filter(condition => condition.id !== id));
  };

  const handleAddGroupBy = (column: string) => {
    if (!groupByColumns.includes(column)) {
      setGroupByColumns([...groupByColumns, column]);
    }
  };

  const handleRemoveGroupBy = (column: string) => {
    setGroupByColumns(groupByColumns.filter(col => col !== column));
  };

  const handleExecuteQuery = async () => {
    if (selectedTables.length === 0) {
      setError('Please select at least one table');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = 'SELECT ';

      if (selectedColumns.length === 0) {
        query += '* ';
      } else {
        query += selectedColumns.map(col => {
          let columnStr = '';
          const table = selectedTables.find(t => t.alias === col.table);
          const connection = connections.find(c => c.id === table?.connectionId);

          if (col.aggregate === 'COUNT') {
            columnStr = `COUNT(*)`;
          } else if (col.aggregate) {
            columnStr = `${col.aggregate}(${connection?.name}.${col.table}.${col.column})`;
          } else {
            columnStr = `${connection?.name}.${col.table}.${col.column}`;
          }

          if (col.alias) {
            columnStr += ` AS ${col.alias}`;
          }
          return columnStr;
        }).join(', ');
      }

      // Build FROM clause
      const firstTable = selectedTables[0];
      const firstConnection = connections.find(c => c.id === firstTable.connectionId);
      query += `\nFROM ${firstConnection?.name}.${firstTable.name} ${firstTable.alias}`;

      // Add JOINs if any
      if (selectedTables.length > 1) {
        const joins = selectedTables.slice(1).map(table => {
          const connection = connections.find(c => c.id === table.connectionId);
          return `${table.joinType || 'INNER JOIN'} ${connection?.name}.${table.name} ${table.alias}${
              table.joinCondition ? ` ON ${table.joinCondition}` : ''
          }`;
        });
        query += '\n' + joins.join('\n');
      }

      // Add WHERE clause
      if (whereConditions.length > 0) {
        const conditions = whereConditions.map(wc => wc.condition).filter(Boolean);
        if (conditions.length > 0) {
          query += '\nWHERE ' + conditions.join('\n  AND ');
        }
      }

      // Add GROUP BY clause
      if (groupByColumns.length > 0) {
        // Ensure each group by column includes the database name
        const fullGroupByColumns = groupByColumns.map(column => {
          const [tableAlias, columnName] = column.split('.');
          const table = selectedTables.find(t => t.alias === tableAlias);
          const connection = connections.find(c => c.id === table?.connectionId);
          return `${connection?.name}.${tableAlias}.${columnName}`;
        });
        query += '\nGROUP BY ' + fullGroupByColumns.join(', ');
      }

      // Add LIMIT clause
      // if (limit > 0) {
      //   query += `\nLIMIT ${limit}`;
      // }

      console.log('Executing query:', query);

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
                        <div className="flex items-center overflow-hidden">
                          <Database size={16} className="mr-2 flex-shrink-0" />
                          <span className="font-medium truncate">{connection?.name}</span>
                          <ArrowRight size={12} className="mx-1 flex-shrink-0" />
                          <span className="font-medium truncate">{table.name}</span>
                          <span className="ml-2 text-sm text-gray-500 truncate">as {table.alias}</span>
                        </div>
                        <button
                            onClick={() => handleRemoveTable(index)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex-shrink-0"
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
                              {/*<option value="INNER JOIN">INNER JOIN</option>*/}
                              {/*<option value="LEFT JOIN">LEFT JOIN</option>*/}
                              {/*<option value="RIGHT JOIN">RIGHT JOIN</option>*/}
                              {/*<option value="FULL JOIN">FULL JOIN</option>*/}
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
                    <div className="space-y-2">
                      <select
                          className={`w-full p-2 rounded-md border ${
                              darkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          value={newColumnAggregate}
                          onChange={(e) => setNewColumnAggregate(e.target.value)}
                      >
                        <option value="">No Aggregate</option>
                        <option value="COUNT">COUNT(*)</option>
                        <option value="SUM">SUM</option>
                        <option value="MIN">MIN</option>
                        <option value="MAX">MAX</option>
                        <option value="AVG">AVG</option>
                      </select>

                      {newColumnAggregate !== 'COUNT' && (
                          <select
                              className={`w-full p-2 rounded-md border ${
                                  darkMode
                                      ? 'bg-gray-700 border-gray-600 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              value={newColumnSelection}
                              onChange={(e) => setNewColumnSelection(e.target.value)}
                          >
                            <option value="">Select a column</option>
                            {selectedTables.map(table => {
                              const connection = connections.find(c => c.id === table.connectionId);
                              const metadata = tablesMetadata.get(table.connectionId);
                              const tableSchema = metadata?.data.find(t => t.tableName === table.name);

                              return tableSchema?.columns.map(column => (
                                  <option
                                      key={`${table.connectionId}.${table.alias}.${column.columnName}`}
                                      value={`${table.connectionId}.${table.alias}.${column.columnName}`}
                                  >
                                    {`${connection?.name}.${table.name}.${column.columnName}`}
                                  </option>
                              ));
                            })}
                          </select>
                      )}

                      <button
                          onClick={handleAddColumn}
                          className={`w-full p-2 rounded-md border ${
                              darkMode
                                  ? 'border-gray-600 hover:bg-gray-700'
                                  : 'border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        Add Column
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
                            <div className="flex items-center overflow-hidden">
                              <span className="font-medium truncate">{connection?.name}</span>
                              <ArrowRight size={12} className="mx-1 flex-shrink-0" />
                              <span className="font-medium truncate">{col.table}</span>
                              <ArrowRight size={12} className="mx-1 flex-shrink-0" />
                              <span className="truncate">
                          {col.aggregate ? `${col.aggregate}(${col.column})` : col.column}
                        </span>
                            </div>
                            <button
                                onClick={() => handleRemoveColumn(index)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex-shrink-0"
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
                  {/* Where Conditions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Where Conditions</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                            type="text"
                            value={newWhereCondition}
                            onChange={(e) => setNewWhereCondition(e.target.value)}
                            placeholder="Enter condition..."
                            className={`flex-1 p-2 rounded-md border ${
                                darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddWhereCondition();
                              }
                            }}
                        />
                        <button
                            onClick={handleAddWhereCondition}
                            className={`p-2 rounded-md border ${
                                darkMode
                                    ? 'border-gray-600 hover:bg-gray-700'
                                    : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      {whereConditions.map((condition) => (
                          <div
                              key={condition.id}
                              className={`flex items-center justify-between p-2 rounded-md border ${
                                  darkMode
                                      ? 'bg-gray-700 border-gray-600'
                                      : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <span className="truncate">{condition.condition}</span>
                            <button
                                onClick={() => handleRemoveWhereCondition(condition.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Group By */}
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
                            handleAddGroupBy(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        value=""
                    >
                      <option value="" disabled>Add group by column...</option>
                      {selectedColumns
                          .filter(col => !col.aggregate)
                          .map((col, index) => (
                              <option
                                  key={index}
                                  value={`${col.table}.${col.column}`}
                                  disabled={groupByColumns.includes(`${col.table}.${col.column}`)}
                              >
                                {col.table}.{col.column}
                              </option>
                          ))
                      }
                    </select>

                    <div className="mt-2 space-y-2">
                      {groupByColumns.map((column, index) => (
                          <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded-md border ${
                                  darkMode
                                      ? 'bg-gray-700 border-gray-600'
                                      : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <span className="truncate">{column}</span>
                            <button
                                onClick={() => handleRemoveGroupBy(column)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/*/!* Limit *!/*/}
                  {/*<div>*/}
                  {/*  <label className="block text-sm font-medium mb-2">Limit</label>*/}
                  {/*  <input*/}
                  {/*      type="number"*/}
                  {/*      value={limit}*/}
                  {/*      onChange={(e) => setLimit(parseInt(e.target.value) || 0)}*/}
                  {/*      min="0"*/}
                  {/*      className={`w-full p-2 rounded-md border ${*/}
                  {/*          darkMode*/}
                  {/*              ? 'bg-gray-700 border-gray-600 text-white'*/}
                  {/*              : 'bg-white border-gray-300 text-gray-900'*/}
                  {/*      }`}*/}
                  {/*  />*/}
                  {/*</div>*/}

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