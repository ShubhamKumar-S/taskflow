const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be 100 characters or fewer'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'member'])
      .withMessage("Role must be 'admin' or 'member'")
  ],
  validate,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  asyncHandler(authController.login)
);

module.exports = router;
