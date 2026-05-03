const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at
});

module.exports = {
  signToken,
  serializeUser
};
