const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('./asyncHandler');

const authenticateToken = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Authentication token is required', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
  } catch (_error) {
    throw new AppError('Invalid or expired authentication token', 401);
  }

  const user = await User.findByPk(payload.id, {
    attributes: ['id', 'name', 'email', 'role', 'created_at']
  });

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
});

module.exports = {
  authenticateToken
};
