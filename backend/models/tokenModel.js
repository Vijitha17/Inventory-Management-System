const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Token extends Model {}

Token.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Match your actual table name
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Token',
  tableName: 'tokens',
  timestamps: true,
  updatedAt: false,
  
});

Token.associate = (models) => {
  Token.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};


module.exports = Token;