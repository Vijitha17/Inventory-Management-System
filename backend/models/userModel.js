const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

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
      notEmpty: {
        msg: "Please add a name"
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email', value.trim().toLowerCase());
    },
    validate: {
      isEmail: { msg: "Please enter a valid email" }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: "Password must be at least 6 characters"
      },
      notEmpty: {
        msg: "Please add a password"
      }
    }
  },
  photo: {
    type: DataTypes.STRING,
    defaultValue: "https://i.ibb.co/4pDNDk1/avatar.png"
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: "+234"
  },
  bio: {
    type: DataTypes.STRING(250),
    defaultValue: "bio",
    validate: {
      len: {
        args: [0, 250],
        msg: "Bio must not be more than 250 characters"
      }
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Define associations
User.associate = (models) => {
  User.hasMany(models.Token, {
    foreignKey: 'userId',
    as: 'tokens'
  });
};

module.exports = User;

