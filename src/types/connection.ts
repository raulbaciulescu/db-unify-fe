export enum ConnectionType {
  PostgreSQL = 'POSTGRES',
  MySQL = 'MYSQL',
  Oracle = 'ORACLE',
  SQLServer = 'SQLSERVER'
}

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Testing = 'testing',
  Failed = 'failed'
}

export interface DatabaseConnection {
  id: string;
  name: string;
  databaseType: ConnectionType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: ConnectionStatus;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastConnected?: Date;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  columnName: string;
  dataType: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

export interface ScheduledJob {
  id: number;
  name: string;
  cron: string;
  query: string;
  createdAt: string;
}

export interface JobResult {
  id: number;
  startedAt: string;
  endedAt: string;
  success: boolean;
  resultPath?: string;
  error?: string;
}