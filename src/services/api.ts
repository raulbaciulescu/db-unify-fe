import axios from 'axios';
import { DatabaseConnection, TableSchema, ScheduledJob, JobResult } from '../types/connection';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchConnections = async () => {
  const response = await api.get('/connections');
  return response.data;
};

export const createConnection = async (connectionData: Omit<DatabaseConnection, 'id' | 'status' | 'favorite' | 'createdAt' | 'updatedAt' | 'lastConnected'>) => {
  const response = await api.post('/connections', connectionData);
  return response.data;
};

export const deleteConnection = async (connectionId: string) => {
  const response = await api.delete(`/connections/${connectionId}`);
  return response.data;
};

export const testConnection = async (databaseId: number) => {
  const response = await api.post(`/connections/${databaseId}/refresh`);
  return response.data;
};

export const fetchMetadata = async (databaseId: number) => {
  const response = await api.get(`/metadata/${databaseId}/tables`);
  return response.data;
};

export const executeSqlQuery = async (connectionId: string, query: string, offset: number = 0) => {
  const response = await api.post('/sqlCommand', {
    query,
    offset
  });
  return response.data;
};

// Scheduled Jobs API
export const createScheduledJob = async (jobData: { name: string; cron: string; query: string }) => {
  const response = await api.post('/api/scheduled-jobs', jobData);
  return response.data;
};

export const fetchScheduledJobs = async () => {
  const response = await api.get('/api/scheduled-jobs');
  return response.data;
};

export const fetchJobResults = async (jobId: number) => {
  const response = await api.get(`/api/scheduled-jobs/${jobId}/results`);
  return response.data;
};

export const getJobResultDownloadUrl = (resultId: number) => {
  return `/api/scheduled-jobs/results/${resultId}/download`;
};