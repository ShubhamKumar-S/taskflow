const bcrypt = require('bcrypt');
const { User } = require('../models');
const AppError = require('../utils/appError');
const { serializeUser, signToken } = require('../utils/auth');

const register = async (req, res) => {
  const { name, email, password, role = 'member' } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError('Email is already registered', 409, [
      { field: 'email', message: 'Email is already registered' }
    ]);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    role
  });

  return res.status(201).json({
    token: signToken(user),
    user: serializeUser(user)
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  return res.json({
    token: signToken(user),
    user: serializeUser(user)
  });
};

module.exports = {
  register,
  login
};
