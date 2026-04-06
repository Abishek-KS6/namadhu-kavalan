const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Delete existing admin
  await User.deleteMany({ email: 'admin@kavalan.com' });

  // Create new — let the model's pre('save') hook hash the password
  const user = new User({
    name:       'Admin',
    email:      'admin@kavalan.com',
    password:   'admin123',
    role:       'admin',
    isApproved: true,
    isActive:   true,
  });

  await user.save();

  console.log('✅ Admin created!');
  console.log('   Email:    admin@kavalan.com');
  console.log('   Password: admin123');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});