import React, { useState } from 'react';
import { Plus, Calendar, Play, Pause, Trash2, Clock, Database } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { useTheme } from '../context/ThemeContext';
import { ScheduledJob } from '../types/connection';
import AddJobModal from '../components/scheduled-jobs/AddJobModal';
import JobCard from '../components/scheduled-jobs/JobCard';

const ScheduledJobs: React.FC = () => {
  const { connections } = useConnections();
  const { darkMode } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);

  const handleAddJob = (job: ScheduledJob) => {
    setJobs([...jobs, job]);
    setShowAddModal(false);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  const handleToggleJob = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, enabled: !job.enabled } : job
    ));
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
          <Plus size={18} className="mr-1" /> Add Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onDelete={() => handleDeleteJob(job.id)}
            onToggle={() => handleToggleJob(job.id)}
          />
        ))}

        {jobs.length === 0 && (
          <div className={`col-span-3 py-12 flex flex-col items-center justify-center rounded-lg border border-dashed
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
              <Plus size={16} className="mr-1" /> Add Job
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddJob}
          connections={connections}
        />
      )}
    </div>
  );
};

export default ScheduledJobs;