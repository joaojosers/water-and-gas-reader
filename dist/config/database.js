"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/database.ts
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres', // ou outro banco de dados de sua escolha
});
exports.default = sequelize;
