const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  role:         { type: String, enum: ['admin', 'officer', 'public'], default: 'public' },
  badgeNumber:  { type: String, default: null },
  district:     { type: String, default: null },
  phone:        { type: String, default: null },
  isActive:     { type: Boolean, default: true },
  isApproved:   { type: Boolean, default: false },
  profilePhoto: { type: String, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.pre('save', function (next) {
  if (this.role === 'public') this.isApproved = true;
  next();
});

module.exports = mongoose.model('User', UserSchema);
