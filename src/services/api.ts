import axios from 'axios';
import { DatabaseConnection, TableSchema } from '../types/connection';

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