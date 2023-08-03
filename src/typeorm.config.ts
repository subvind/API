import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// console.log('process.env.POSTGRESQL', process.env.POSTGRESQL)

const config: TypeOrmModuleOptions = {
  type: 'postgres', // Database type
  url: process.env.POSTGRESQL,
  host: process.env.POSTGRES_HOST || 'localhost', // PostgreSQL server host
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432, // PostgreSQL server port
  username: process.env.POSTGRES_USER || 'postgres', // PostgreSQL username
  password: process.env.POSTGRES_PASSWORD || 'postgres', // PostgreSQL password
  database: process.env.POSTGRES_DATABASE || 'subvind', // PostgreSQL database name
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Location of entity files
  synchronize: true, // Automatic schema synchronization (disable in production)
};

export default config;
