// models/collegeModel.js
module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false 
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false
      
    }
  });

  College.associate = (models) => {
    College.hasMany(models.Department, {
      foreignKey: 'collegeId',
      as: 'departments'
    });
    College.hasMany(models.User, {
      foreignKey: 'collegeId',
      as: 'users'
    });
  };

  return College;
};