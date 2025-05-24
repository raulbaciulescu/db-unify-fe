import React from 'react';
import { Calendar, Play, Pause, Trash2, Clock, Database } from 'lucide-react';
import { ScheduledJob } from '../../types/connection';
import { useConnections } from '../../context/ConnectionContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from '../../utils/date';

interface JobCardProps {
  job: ScheduledJob;
  onDelete: () => void;
  onToggle: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onDelete, onToggle }) => {
  const { getConnectionById } = useConnections();
  const { darkMode } = useTheme();
  
  const connection = getConnectionById(job.connectionId);

  return (
    <div className={`rounded-lg overflow-hidden border shadow transition-transform duration-200 hover:shadow-md
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full 
              ${job.enabled 
                ? (darkMode ? 'bg-green-900 bg-opacity-20 text-green-400' : 'bg-green-100 text-green-600')
                : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')
              }`}
            >
              <Calendar size={16} />
            </div>
            <h3 className="font-semibold text-lg ml-2">{job.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-full transition-colors
                ${job.enabled
                  ? (darkMode ? 'text-green-400 hover:bg-green-900 hover:bg-opacity-20' : 'text-green-600 hover:bg-green-100')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                }`}
            >
              {job.enabled ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={onDelete}
              className={`p-1.5 rounded-full transition-colors
                ${darkMode 
                  ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20' 
                  : 'text-red-600 hover:bg-red-100'
                }`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center mb-1">
              <Database size={14} className="mr-1.5" />
              <span>{connection?.name || 'Unknown connection'}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1.5" />
              <span>{job.schedule}</span>
            </div>
          </div>
        </div>

        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded-md overflow-x-auto">
            {job.query.length > 100 ? `${job.query.slice(0, 100)}...` : job.query}
          </div>
        </div>

        {(job.lastRun || job.nextRun) && (
          <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {job.lastRun && (
                <div>Last run: {formatDistanceToNow(new Date(job.lastRun))} ago</div>
              )}
              {job.nextRun && (
                <div>Next run: {formatDistanceToNow(new Date(job.nextRun))}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};