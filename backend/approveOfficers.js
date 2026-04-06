const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Approve all officers
  const result = await User.updateMany(
    { role: 'officer', isApproved: false },
    { isApproved: true }
  );

  console.log(`✅ ${result.modifiedCount} officer(s) approved!`);

  // List all users
  const users = await User.find({}).select('name email role isApproved');
  console.log('\n📋 All users:');
  users.forEach(u => {
    console.log(`   ${u.role.toUpperCase()} | ${u.name} | ${u.email} | Approved: ${u.isApproved}`);
  });

  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
