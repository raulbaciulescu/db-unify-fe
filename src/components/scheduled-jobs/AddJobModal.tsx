import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createScheduledJob } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import QueryEditor from '../query-builder/QueryEditor';

interface AddJobModalProps {
    onClose: () => void;
    onAdd: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onAdd }) => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        cron: '0 0 * * *', // Default to daily at midnight
        query: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createScheduledJob(formData);
            onAdd();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`w-full max-w-2xl mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col max-h-[90vh]`}>
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Add Scheduled Job</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 space-y-4 flex-1 overflow-y-auto">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Job Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Daily Report Query"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Schedule (Cron Expression)
                            </label>
                            <input
                                type="text"
                                name="cron"
                                value={formData.cron}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="0 0 * * *"
                            />
                            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Use cron expression format (e.g., "0 0 * * *" for daily at midnight)
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Query
                            </label>
                            <div className="h-64">
                                <QueryEditor
                                    value={formData.query}
                                    onChange={(value) => setFormData({ ...formData, query: value })}
                                    darkMode={darkMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t flex justify-end gap-2 flex-shrink-0 bg-opacity-90 backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md border 
                ${darkMode
                                ? 'border-gray-600 hover:bg-gray-700'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddJobModal;