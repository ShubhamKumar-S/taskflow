const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

const router = express.Router();

const taskIdValidator = param('taskId')
  .isInt({ min: 1 })
  .withMessage('Task id must be a positive integer');

const updateValidators = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title must be 200 characters or fewer'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or fewer'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage("Status must be 'todo', 'in_progress', or 'done'"),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage("Priority must be 'low', 'medium', or 'high'"),
  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Due date must be a valid date'),
  body('assignee_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Assignee id must be a positive integer')
];

router.use(authenticateToken);

router.get('/:taskId', taskIdValidator, validate, asyncHandler(taskController.getTask));

router.put(
  '/:taskId',
  taskIdValidator,
  ...updateValidators,
  validate,
  asyncHandler(taskController.updateTask)
);

router.delete('/:taskId', taskIdValidator, validate, asyncHandler(taskController.deleteTask));

module.exports = router;
