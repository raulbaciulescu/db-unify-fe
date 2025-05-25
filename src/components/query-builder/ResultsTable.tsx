import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ResultsTableProps {
  data: any[];
  darkMode: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, darkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Handle empty data
  if (!data || data.length === 0) {
    return (
        <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          No results to display
        </div>
    );
  }

  // Check if this is a non-select query result (like INSERT, UPDATE)
  if (!Array.isArray(data) || Object.keys(data[0]).includes('message')) {
    return (
        <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-green-100 text-green-800'}`}>
          <p>{data[0].message}</p>
          {data[0].affectedRows && (
              <p className="mt-1">Affected rows: {data[0].affectedRows}</p>
          )}
        </div>
    );
  }

  // Get column headers from first result
  const columns = Object.keys(data[0]);

  // Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
      <div className={`rounded-lg border overflow-hidden ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200'}`}>
        <div className={`flex justify-between items-center p-3 border-b ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <span className="text-sm">
          {data.length} {data.length === 1 ? 'row' : 'rows'}
        </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              {columns.map((col, index) => (
                  <th
                      key={index}
                      className={`px-4 py-2 text-left font-medium ${darkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}
                  >
                    {col}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody>
            {currentData.map((row, rowIndex) => (
                <tr
                    key={rowIndex}
                    className={`
                  ${rowIndex % 2 === 0
                        ? (darkMode ? 'bg-gray-900' : 'bg-white')
                        : (darkMode ? 'bg-gray-800' : 'bg-gray-50')
                    }
                  hover:bg-opacity-80
                `}
                >
                  {columns.map((col, colIndex) => (
                      <td
                          key={colIndex}
                          className={`px-4 py-2 ${darkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}
                      >
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                      </td>
                  ))}
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className={`flex items-center justify-between p-3 border-t ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
              <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default ResultsTable;