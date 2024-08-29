// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres', // ou outro banco de dados de sua escolha
});

export default sequelize;
