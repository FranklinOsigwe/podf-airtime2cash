import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';

interface TransferAirtimeAttribute {
  id: string;
  network: string;
  phoneNumber: number;
  amountToSell: number;
  userId: string;
  transactionStatus?: boolean;
}

export class TransferAirtimeInstance extends Model<TransferAirtimeAttribute> {}

TransferAirtimeInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    amountToSell: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    transactionStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: 'transferAirtime',
  },
);
