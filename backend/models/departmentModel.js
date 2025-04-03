// models/departmentModel.js
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    collegeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'colleges',
        key: 'id'
      }
    }
  });

  Department.associate = (models) => {
    Department.belongsTo(models.College, {
      foreignKey: 'collegeId',
      as: 'college'
    });
    Department.hasMany(models.User, {
      foreignKey: 'departmentId',
      as: 'users'
    });
  };
  
  return Department;
};
  