const express = require('express');
const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const { isProjectAdmin, isProjectMember } = require('../middleware/projectAccess');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');

const router = express.Router();

const projectIdValidator = param('id')
  .isInt({ min: 1 })
  .withMessage('Project id must be a positive integer');

const projectBodyValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name must be 100 characters or fewer'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or fewer')
];

const taskBodyValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
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

router.get('/', asyncHandler(projectController.listProjects));

router.post('/', projectBodyValidators, validate, asyncHandler(projectController.createProject));

router.get(
  '/:id',
  projectIdValidator,
  validate,
  isProjectMember,
  asyncHandler(projectController.getProjectDetails)
);

router.put(
  '/:id',
  projectIdValidator,
  ...projectBodyValidators,
  validate,
  isProjectAdmin,
  asyncHandler(projectController.updateProject)
);

router.delete(
  '/:id',
  projectIdValidator,
  validate,
  isProjectAdmin,
  asyncHandler(projectController.deleteProject)
);

router.post(
  '/:id/members',
  projectIdValidator,
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid member email is required')
    .normalizeEmail(),
  body('role')
    .isIn(['admin', 'member'])
    .withMessage("Role must be 'admin' or 'member'"),
  validate,
  isProjectAdmin,
  asyncHandler(projectController.addMember)
);

router.delete(
  '/:id/members/:userId',
  projectIdValidator,
  param('userId').isInt({ min: 1 }).withMessage('User id must be a positive integer'),
  validate,
  isProjectAdmin,
  asyncHandler(projectController.removeMember)
);

router.get(
  '/:id/tasks',
  projectIdValidator,
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage("Status filter must be 'todo', 'in_progress', or 'done'"),
  query('assignee')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee filter must be a positive integer'),
  validate,
  isProjectMember,
  asyncHandler(taskController.listTasks)
);

router.post(
  '/:id/tasks',
  projectIdValidator,
  ...taskBodyValidators,
  validate,
  isProjectAdmin,
  asyncHandler(taskController.createTask)
);

module.exports = router;
