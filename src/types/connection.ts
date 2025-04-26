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
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  databaseType: ConnectionType;
  status?: ConnectionStatus;
  favorite?: boolean;
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