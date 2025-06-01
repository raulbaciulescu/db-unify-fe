import React from 'react';
import { Clock, ArrowRight, Timer } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/date';

interface QueryHistoryProps {
    history: {id: string, query: string, timestamp: Date, executionTime?: number}[];
    onSelectQuery: (query: string) => void;
    darkMode: boolean;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onSelectQuery, darkMode }) => {
    // Function to get a short preview of the query
    const getQueryPreview = (query: string, maxLength = 40) => {
        if (query.length <= maxLength) return query;
        return query.substring(0, maxLength) + '...';
    };

    return (
        <div className={`h-full rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`p-3 border-b flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Clock size={18} className="mr-2" />
                <h3 className="font-medium">Query History</h3>
            </div>

            <div className="h-[calc(100%-48px)] overflow-y-auto">
                {history.length > 0 ? (
                    <div>
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className={`p-3 border-b cursor-pointer transition-colors hover:bg-opacity-80
                  ${darkMode
                                    ? 'border-gray-700 hover:bg-gray-800'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => onSelectQuery(item.query)}
                            >
                                <div className="mb-1 font-mono text-sm truncate">
                                    {getQueryPreview(item.query)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDistanceToNow(new Date(item.timestamp))}
                    </span>
                                        {item.executionTime && (
                                            <span className={`flex items-center text-xs
                        ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                            >
                        <Timer size={12} className="mr-1" />
                                                {item.executionTime.toFixed(2)}ms
                      </span>
                                        )}
                                    </div>
                                    <button
                                        className={`text-xs flex items-center 
                      ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectQuery(item.query);
                                        }}
                                    >
                                        Use <ArrowRight size={12} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center h-full p-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock size={32} className="mb-2 opacity-30" />
                        <p>No query history yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryHistory;