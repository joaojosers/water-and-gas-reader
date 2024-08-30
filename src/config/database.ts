import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: process.env.DB_DIALECT as 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql', // Make sure the dialect matches your DB
  protocol: process.env.DB_PROTOCOL || undefined,
  logging: false, // or console.log to enable SQL query logging
});

export default sequelize;
