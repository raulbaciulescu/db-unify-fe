import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ScheduledJob } from '../types/connection';
import AddJobModal from '../components/scheduled-jobs/AddJobModal';
import { fetchScheduledJobs, deleteScheduledJob } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ScheduledJobs: React.FC = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [jobs, setJobs] = useState<ScheduledJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchScheduledJobs();
            setJobs(data);
        } catch (err) {
            setError('Failed to load scheduled jobs');
            console.error('Error loading jobs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleViewResults = (jobId: number) => {
        navigate(`/scheduled-jobs/${jobId}/results`);
    };

    const handleDeleteJob = async (jobId: number) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await deleteScheduledJob(jobId);
                setJobs(jobs.filter(job => job.id !== jobId));
            } catch (err) {
                console.error('Error deleting job:', err);
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Scheduled Jobs</h1>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Manage your scheduled database queries
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                    <Plus size={18} className="mr-1" /> Create Scheduled Job
                </button>
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
                <div className="grid grid-cols-1 gap-4">
                    {jobs.map(job => (
                        <div
                            key={job.id}
                            className={`p-4 rounded-lg border ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <Calendar className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                                    <div>
                                        <h3 className="font-medium text-lg">{job.name}</h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Schedule: {job.cron}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleViewResults(job.id)}
                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm
                      ${darkMode
                                            ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                    >
                                        View Results
                                        <ArrowRight size={16} className="ml-1" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm
                      ${darkMode
                                            ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className={`mt-3 p-3 rounded-md font-mono text-sm
                ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                            >
                                {job.query}
                            </div>
                            <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Created: {new Date(job.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}

                    {jobs.length === 0 && (
                        <div className={`py-12 flex flex-col items-center justify-center rounded-lg border border-dashed
              ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
                        >
                            <Calendar size={48} className="mb-4 opacity-30" />
                            <p className="text-lg mb-1">No scheduled jobs</p>
                            <p className="mb-4 text-sm text-gray-500">
                                Create your first scheduled database query
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Plus size={16} className="mr-1" /> Create Job
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showAddModal && (
                <AddJobModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={loadJobs}
                />
            )}
        </div>
    );
};

export default ScheduledJobs;