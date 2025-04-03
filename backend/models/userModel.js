const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {  // Added DataTypes parameter
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already in use'
      },
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address'
        },
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM(
        'institution_admin',
        'institution_top',
        'institution_staff',
        'college_admin',
        'college_top',
        'college_staff',
        'department_admin',
        'department_top',
        'department_staff',
        'staff'
      ),
      allowNull: false,
      defaultValue: 'department_staff'  // Added default value
    },
    adminLevel: {
      type: DataTypes.ENUM('institution', 'college', 'department', 'none'),
      allowNull: false,
      defaultValue: 'none'
    },
    collegeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'colleges',  // Changed to model name (capitalized)
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',  // Changed to model name (capitalized)
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: "+234",
      validate: {
        is: {
          args: /^\+?\d+$/,
          msg: 'Please enter a valid phone number'
        }
      }
    },
    bio: {
      type: DataTypes.STRING(250),
      defaultValue: "bio",
      validate: {
        len: {
          args: [0, 250],
          msg: 'Bio cannot exceed 250 characters'
        }
      }
    },
    createdBy: {  // Added missing field
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password&& !user.password.startsWith("$2b$"))  {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        
        // Set admin level based on role
        if (user.role.includes('institution')) {
          user.adminLevel = 'institution';
        } else if (user.role.includes('college')) {
          user.adminLevel = 'college';
        } else if (user.role.includes('department')) {
          user.adminLevel = 'department';
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && !user.password.startsWith("$2b$")) { 
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      activeUsers: {
        where: { isActive: true }
      }
    },
    tableName: 'users',  // Explicit table name
    timestamps: true  // Ensure timestamps are enabled
  });

  User.associate = (models) => {
    User.belongsTo(models.College, {
      foreignKey: 'collegeId',
      as: 'college',
      onDelete: 'SET NULL'
    });
    User.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
      onDelete: 'SET NULL'
    });
    User.hasMany(models.Token, {
      foreignKey: 'userId',
      as: 'tokens',
      onDelete: 'CASCADE'
    });
    User.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  // Instance method for password verification
  User.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};