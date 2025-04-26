import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table2, Key, Hash, List } from 'lucide-react';
import { TableSchema } from '../../types/connection';
import { useTheme } from '../../context/ThemeContext';

interface SchemaTreeViewProps {
  tables: TableSchema[];
  isLoading: boolean;
  onSelectTable: (tableName: string) => void;
}

const SchemaTreeView: React.FC<SchemaTreeViewProps> = ({ tables, isLoading, onSelectTable }) => {
  const { darkMode } = useTheme();
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['columns']));

  const toggleTable = (tableName: string) => {
    const updated = new Set(expandedTables);
    if (updated.has(tableName)) {
      updated.delete(tableName);
    } else {
      updated.add(tableName);
    }
    setExpandedTables(updated);
  };

  const toggleSection = (tableName: string, section: string) => {
    const sectionKey = `${tableName}-${section}`;
    const updated = new Set(expandedSections);
    if (updated.has(sectionKey)) {
      updated.delete(sectionKey);
    } else {
      updated.add(sectionKey);
    }
    setExpandedSections(updated);
  };

  return (
    <div className={`rounded-lg border overflow-hidden
      ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
    >
      <div className={`p-3 border-b flex items-center
        ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <Database size={18} className="mr-2" />
        <h3 className="font-medium">Database Schema</h3>
      </div>

      <div className="p-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tables.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-32 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Table2 size={24} className="mb-2 opacity-30" />
            <p>No tables found</p>
          </div>
        ) : (
          tables.map(table => (
            <div key={table.tableName} className="mb-2">
              <div
                className={`flex items-center p-2 rounded cursor-pointer
                  ${darkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'}`}
                onClick={() => {
                  toggleTable(table.tableName);
                  onSelectTable(table.tableName);
                }}
              >
                {expandedTables.has(table.tableName) 
                  ? <ChevronDown size={16} className="mr-1" />
                  : <ChevronRight size={16} className="mr-1" />
                }
                <Table2 size={16} className="mr-2" />
                <span className="font-medium">{table.tableName}</span>
              </div>

              {expandedTables.has(table.tableName) && (
                <div className="ml-6 mt-1">
                  {/* Columns Section */}
                  <div>
                    <div
                      className={`flex items-center p-1.5 rounded cursor-pointer
                        ${darkMode 
                          ? 'hover:bg-gray-700 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'}`}
                      onClick={() => toggleSection(table.tableName, 'columns')}
                    >
                      {expandedSections.has(`${table.tableName}-columns`)
                        ? <ChevronDown size={14} className="mr-1" />
                        : <ChevronRight size={14} className="mr-1" />
                      }
                      <List size={14} className="mr-1.5" />
                      <span className="text-sm">Columns</span>
                    </div>

                    {expandedSections.has(`${table.tableName}-columns`) && (
                      <div className="ml-6 space-y-1">
                        {table.columns.map(column => (
                          <div
                            key={column.columnName}
                            className={`flex items-center p-1.5 text-sm
                              ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <Hash size={12} className="mr-1.5 opacity-50" />
                            <span className="font-mono text-xs">
                              {column.columnName}
                            </span>
                            <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {column.dataType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchemaTreeView;