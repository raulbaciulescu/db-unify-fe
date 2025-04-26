import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DatabaseConnection, TableSchema } from '../types/connection';
import { useConnections } from '../context/ConnectionContext';
import { fetchMetadata } from '../services/api';
import DatabaseSelector from '../components/query-builder/DatabaseSelector';
import SchemaTreeView from '../components/table-explorer/SchemaTreeView';
import { FileSpreadsheet, Database as DatabaseIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TableExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const connectionId = searchParams.get('connectionId');
  const { connections, getConnectionById } = useConnections();
  const { darkMode } = useTheme();
  
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load connection from URL param if provided
  useEffect(() => {
    if (connectionId) {
      const connection = getConnectionById(Number(connectionId));
      if (connection) {
        setSelectedConnection(connection);
      }
    }
  }, [connectionId, getConnectionById]);
  
  // Fetch tables when connection changes
  useEffect(() => {
    const loadMetadata = async () => {
      if (selectedConnection) {
        try {
          setIsLoading(true);
          setError(null);
          const metadata = await fetchMetadata(selectedConnection.id);
          setTables(metadata);
        } catch (err) {
          setError('Failed to fetch database metadata');
          console.error('Error fetching metadata:', err);
          setTables([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setTables([]);
      }
    };

    loadMetadata();
  }, [selectedConnection]);
  
  const handleConnectionChange = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setSelectedTable(null);
    setTableData(null);
    setError(null);
  };
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Table Explorer</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Browse database tables and structure
          </p>
        </div>
        <DatabaseSelector 
          connections={connections}
          selectedConnection={selectedConnection}
          onSelect={handleConnectionChange}
        />
      </div>
      
      {error && (
        <div className={`mb-4 p-4 rounded-md ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
          {error}
        </div>
      )}
      
      <div className="h-[calc(100%-80px)] grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Schema Tree View */}
        <div className="lg:col-span-1">
          <SchemaTreeView 
            tables={tables} 
            isLoading={isLoading}
            onSelectTable={setSelectedTable}
          />
        </div>
        
        {/* Table data preview */}
        <div className={`lg:col-span-2 rounded-lg border overflow-hidden
          ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
        >
          <div className={`p-3 border-b flex items-center
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <FileSpreadsheet size={18} className="mr-2" />
            <h3 className="font-medium">
              {selectedTable ? `${selectedTable} - Data Preview` : 'Data Preview'}
            </h3>
          </div>
          
          <div className="h-[calc(100%-48px)] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !selectedConnection ? (
              <div className={`flex flex-col items-center justify-center h-full p-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <DatabaseIcon size={32} className="mb-2 opacity-30" />
                <p>Connect to a database to get started</p>
              </div>
            ) : !selectedTable ? (
              <div className={`flex flex-col items-center justify-center h-full p-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileSpreadsheet size={32} className="mb-2 opacity-30" />
                <p>Select a table to preview data</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExplorer;