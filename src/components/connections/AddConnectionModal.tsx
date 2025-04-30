import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useConnections } from '../../context/ConnectionContext';
import { ConnectionType, ConnectionStatus } from '../../types/connection';
import { useTheme } from '../../context/ThemeContext';
import { createConnection } from '../../services/api';

interface AddConnectionModalProps {
  onClose: () => void;
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ onClose }) => {
  const { addConnection } = useConnections();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    databaseType: ConnectionType.PostgreSQL,
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update port defaults based on selected db type
    if (name === 'databaseType') {
      let defaultPort = '5432';

      switch (value) {
        case ConnectionType.MySQL:
          defaultPort = '3306';
          break;
        case ConnectionType.Oracle:
          defaultPort = '1521';
          break;
        case ConnectionType.SQLServer:
          defaultPort = '1433';
          break;
      }

      setFormData({
        ...formData,
        [name]: value,
        port: defaultPort
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create connection through API
      const response = await createConnection({
        ...formData,
        port: parseInt(formData.port),
      });

      // Add to local state
      addConnection({
        ...response,
        status: ConnectionStatus.Disconnected,
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`w-full max-w-md mx-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Connection</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>

          {error && (
              <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Connection Name
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
                    placeholder="My Database"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Database Type
                </label>
                <select
                    name="databaseType"
                    value={formData.databaseType}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value={ConnectionType.PostgreSQL}>PostgreSQL</option>
                  <option value={ConnectionType.MySQL}>MySQL</option>
                  <option value={ConnectionType.Oracle}>Oracle</option>
                  <option value={ConnectionType.SQLServer}>SQL Server</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Host
                  </label>
                  <input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleChange}
                      required
                      className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                    ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="localhost"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Port
                  </label>
                  <input
                      type="text"
                      name="port"
                      value={formData.port}
                      onChange={handleChange}
                      required
                      className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                    ${darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Database Name
                </label>
                <input
                    type="text"
                    name="database"
                    value={formData.database}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="postgres"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="postgres"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                  ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="••••••••"
                />
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
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Adding...' : 'Add Connection'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddConnectionModal;