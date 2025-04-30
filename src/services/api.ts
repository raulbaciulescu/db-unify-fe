import axios from 'axios';
import { DatabaseConnection } from '../types/connection';

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

export const testConnection = async (databaseId: number) => {
  const response = await api.post(`/connections/${databaseId}/refresh`);
  return response.data;
};

export const fetchMetadata = async (databaseId: number) => {
  const response = await api.get(`/metadata/${databaseId}/tables`);
  return response.data;
};