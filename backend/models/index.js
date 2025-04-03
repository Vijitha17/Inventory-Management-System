// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false
  }
);

const defineUser = require('./userModel');
const defineToken = require('./tokenModel');
const defineCollege = require('./collegeModel');
const defineDepartment = require('./departmentModel');

const User = defineUser(sequelize, DataTypes);
const Token = defineToken(sequelize, DataTypes);
const College = defineCollege(sequelize, DataTypes);
const Department = defineDepartment(sequelize, DataTypes);

// Set up associations if all models are properly defined
if (User.associate && Token.associate && College.associate && Department.associate) {
  User.associate({ User, Token, College, Department });
  Token.associate({ User, Token, College, Department });
  College.associate({ User, Token, College, Department });
  Department.associate({ User, Token, College, Department });
}

module.exports = {
  sequelize,
  User,
  Token,
  College,
  Department
};