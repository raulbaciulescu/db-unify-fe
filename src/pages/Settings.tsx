import React, { useState } from 'react';
import { Sun, Moon, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    resultsPerPage: 10,
    connectionTimeout: 30,
    saveQueryHistory: true,
    autoSaveQueries: false,
    defaultDatabase: 'PostgreSQL'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      // Show saved message or notification here
    }, 1000);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <div className={`rounded-lg border p-6 mb-6 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Theme</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors
                  ${!darkMode 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-600 hover:bg-gray-700'
                  }`}
              >
                <Sun size={18} className="mr-2" />
                Light
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors
                  ${darkMode 
                    ? 'bg-blue-900 bg-opacity-20 border-blue-800 text-blue-400' 
                    : 'border-gray-300 hover:bg-gray-100'
                  }`}
              >
                <Moon size={18} className="mr-2" />
                Dark
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border p-6 mb-6 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Query Settings</h2>
          
          <div className="mb-4">
            <label htmlFor="resultsPerPage" className="block mb-2 text-sm font-medium">
              Results per page
            </label>
            <select
              id="resultsPerPage"
              name="resultsPerPage"
              value={settings.resultsPerPage}
              onChange={handleChange}
              className={`w-full max-w-xs px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="connectionTimeout" className="block mb-2 text-sm font-medium">
              Connection timeout (seconds)
            </label>
            <input
              type="number"
              id="connectionTimeout"
              name="connectionTimeout"
              value={settings.connectionTimeout}
              onChange={handleChange}
              min="5"
              max="120"
              className={`w-full max-w-xs px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveQueryHistory"
                name="saveQueryHistory"
                checked={settings.saveQueryHistory}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="saveQueryHistory" className="ml-2 text-sm font-medium">
                Save query history
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSaveQueries"
                name="autoSaveQueries"
                checked={settings.autoSaveQueries}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="autoSaveQueries" className="ml-2 text-sm font-medium">
                Auto-save queries
              </label>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border p-6 mb-6 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Database Defaults</h2>
          
          <div className="mb-4">
            <label htmlFor="defaultDatabase" className="block mb-2 text-sm font-medium">
              Default database type
            </label>
            <select
              id="defaultDatabase"
              name="defaultDatabase"
              value={settings.defaultDatabase}
              onChange={handleChange}
              className={`w-full max-w-xs px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:outline-none
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="MySQL">MySQL</option>
              <option value="Oracle">Oracle</option>
              <option value="SQLServer">SQL Server</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
              flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;