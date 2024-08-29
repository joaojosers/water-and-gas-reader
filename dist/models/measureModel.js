"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Measure extends sequelize_1.Model {
}
Measure.init({
    measure_uuid: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    customer_code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    measure_datetime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    measure_type: {
        type: sequelize_1.DataTypes.ENUM('WATER', 'GAS'),
        allowNull: false,
    },
    measure_value: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    has_confirmed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Measure',
    tableName: 'measures',
    timestamps: false,
});
exports.default = Measure;
