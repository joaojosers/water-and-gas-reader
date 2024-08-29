import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MeasureAttributes {
  measure_uuid: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: 'WATER' | 'GAS';
  measure_value?: number;
  has_confirmed: boolean;
  image_url?: string;
}

interface MeasureCreationAttributes extends Optional<MeasureAttributes, 'measure_uuid' | 'has_confirmed'> {}

class Measure extends Model<MeasureAttributes, MeasureCreationAttributes> implements MeasureAttributes {
  public measure_uuid!: string;
  public customer_code!: string;
  public measure_datetime!: Date;
  public measure_type!: 'WATER' | 'GAS';
  public measure_value!: number;
  public has_confirmed!: boolean;
  public image_url!: string;
}

Measure.init(
  {
    measure_uuid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    customer_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    measure_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    measure_type: {
      type: DataTypes.ENUM('WATER', 'GAS'),
      allowNull: false,
    },
    measure_value: {
      type: DataTypes.INTEGER,
    },
    has_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image_url: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'Measure',
    tableName: 'measures',
    timestamps: false,
  }
);

export default Measure;
