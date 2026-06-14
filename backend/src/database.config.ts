import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'myscore',
    password: process.env.POSTGRES_PASSWORD || 'myscore_secret',
    database: process.env.POSTGRES_DB || 'myscore',
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    synchronize: false,
    logging: false,
    migrationsRun: true,
  };
}
