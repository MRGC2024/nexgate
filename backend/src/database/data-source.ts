import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'nexgate',
  password: process.env.DATABASE_PASSWORD || 'nexgate_secret',
  database: process.env.DATABASE_NAME || 'nexgate',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

export function getDataSourceConfig(): DataSourceOptions {
  return dataSourceOptions;
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
