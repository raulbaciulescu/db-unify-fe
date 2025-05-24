import React, { useState } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection, ScheduledJob } from '../../types/connection';
import { useTheme } from '../../context/ThemeContext';
import QueryEditor from '../query-builder/QueryEditor';

interface AddJobModalProps {
  onClose: () => void;
  onAdd: (job: ScheduledJob) => void;
  connections: DatabaseConnection[];
}

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onAdd, connections }) => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    connectionId: '',
    query: '',
    schedule: '0 0 * * *', // Default to daily at midnight
    enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: ScheduledJob = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onAdd(newJob);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-2xl mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Scheduled Job</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                Database Connection
              </label>
              <select
                name="connectionId"
                value={formData.connectionId}
                onChange={handleChange}
                required
                className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">Select a connection</option>
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.host}:{conn.port})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Schedule (Cron Expression)
              </label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
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
              <QueryEditor
                value={formData.query}
                onChange={(value) => setFormData({ ...formData, query: value })}
                darkMode={darkMode}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="ml-2 text-sm font-medium">
                Enable job immediately
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal