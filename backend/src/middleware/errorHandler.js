const { UniqueConstraintError, ValidationError } = require('sequelize');

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: 'A record with that value already exists',
      errors: error.errors.map((item) => ({
        field: item.path,
        message: item.message
      }))
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((item) => ({
        field: item.path,
        message: item.message
      }))
    });
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? 'Internal server error' : error.message,
    errors: error.errors
  });
};

module.exports = errorHandler;
