import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { JobResult } from '../types/connection';
import { fetchJobResults, downloadJobResult } from '../services/api';

const JobResults: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const { darkMode } = useTheme();
    const [results, setResults] = useState<JobResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadResults = async () => {
            if (!jobId) return;

            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchJobResults(parseInt(jobId));
                setResults(data);
            } catch (err) {
                setError('Failed to load job results');
                console.error('Error loading results:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, [jobId]);

    const handleDownload = async (resultId: number) => {
        try {
            await downloadJobResult(resultId);
        } catch (err) {
            console.error('Error downloading result:', err);
            alert('Failed to download result. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        to="/scheduled-jobs"
                        className={`mr-4 p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Job Results</h1>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            View execution history and download results
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map(result => (
                        <div
                            key={result.id}
                            className={`p-4 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {result.success ? (
                                        <CheckCircle className="text-green-500 mr-2" size={20} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={20} />
                                    )}
                                    <div>
                                        <div className="flex items-center">
                                            <Clock size={14} className="mr-1.5 opacity-70" />
                                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(result.startedAt).toLocaleString()}
                      </span>
                                        </div>
                                        <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Duration: {
                                            new Date(result.endedAt).getTime() - new Date(result.startedAt).getTime()
                                        }ms
                                        </div>
                                    </div>
                                </div>

                                {result.success && (
                                    <button
                                        onClick={() => handleDownload(result.id)}
                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm
                      ${darkMode
                                            ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                    >
                                        <Download size={16} className="mr-1.5" />
                                        Download Result
                                    </button>
                                )}

                                {!result.success && result.error && (
                                    <div className={`text-sm px-3 py-1.5 rounded-md
                    ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}
                                    >
                                        Error: {result.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {results.length === 0 && (
                        <div className={`py-12 flex flex-col items-center justify-center rounded-lg border border-dashed
              ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
                        >
                            <Clock size={48} className="mb-4 opacity-30" />
                            <p className="text-lg mb-1">No results yet</p>
                            <p className="text-sm text-gray-500">
                                Results will appear here after the job runs
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobResults;