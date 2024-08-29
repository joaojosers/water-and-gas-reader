// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: process.env.DB_DIALECT as 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql',
  protocol: process.env.DB_PROTOCOL || undefined,
  logging: false, // ou `console.log` para habilitar o log de SQL
});
export default sequelize;
