const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { name, email, password, role, badgeNumber, district, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, badgeNumber, district, phone });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isApproved: user.isApproved,
      token: generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isApproved)
      return res.status(403).json({ message: 'Account pending admin approval' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, district: user.district,
      badgeNumber: user.badgeNumber,
      token: generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMe = async (req, res) => res.json(req.user);

module.exports = { register, login, getMe };
