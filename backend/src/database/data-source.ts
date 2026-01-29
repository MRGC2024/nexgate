import { DataSource, DataSourceOptions } from 'typeorm';

const common: Pick<DataSourceOptions, 'synchronize' | 'logging' | 'entities' | 'migrations'> = {
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

/** Railway e outros clouds passam DATABASE_URL; local usa HOST/PORT/USER/PASSWORD. */
export function getDataSourceConfig(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Aceitar certificado autoassinado (ex.: Railway) ao rodar migrate/seed do PC
    const ssl = url.includes('railway') || url.includes('rlwy.net')
      ? { rejectUnauthorized: false }
      : undefined;
    return { type: 'postgres', url, ssl, ...common } as DataSourceOptions;
  }
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'nexgate',
    password: process.env.DATABASE_PASSWORD || 'nexgate_secret',
    database: process.env.DATABASE_NAME || 'nexgate',
    ...common,
  };
}

export const dataSourceOptions: DataSourceOptions = getDataSourceConfig();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
