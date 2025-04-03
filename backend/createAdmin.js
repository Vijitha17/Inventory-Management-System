const { User } = require('./models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  await User.create({
    name: 'Super Admin',
    email: 'admin@example.com',
    password: await bcrypt.hash('adminpassword', 10),
    role: 'institution_admin',
    adminLevel: 'institution',
    isActive: true
  });
  console.log('Super admin created!');
};

createAdmin();