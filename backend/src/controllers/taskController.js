const { Task, User, ProjectMember, Project } = require('../models');
const { attachProjectMembership } = require('../middleware/projectAccess');
const AppError = require('../utils/appError');

const userAttributes = ['id', 'name', 'email', 'role', 'created_at'];
const validTaskFields = [
  'title',
  'description',
  'status',
  'priority',
  'due_date',
  'assignee_id'
];

const includeTaskRelations = [
  { model: Project, as: 'project' },
  { model: User, as: 'assignee', attributes: userAttributes },
  { model: User, as: 'creator', attributes: userAttributes }
];

const findTaskOrFail = async (taskId) => {
  const task = await Task.findByPk(taskId, {
    include: includeTaskRelations
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

const ensureAssigneeIsProjectMember = async (projectId, assigneeId) => {
  if (!assigneeId) {
    return;
  }

  const user = await User.findByPk(assigneeId);
  if (!user) {
    throw new AppError('Assignee not found', 404, [
      { field: 'assignee_id', message: 'Assignee does not exist' }
    ]);
  }

  const membership = await ProjectMember.findOne({
    where: {
      project_id: projectId,
      user_id: assigneeId
    }
  });

  if (!membership) {
    throw new AppError('Assignee must be a member of this project', 400, [
      { field: 'assignee_id', message: 'Assignee must belong to this project' }
    ]);
  }
};

const listTasks = async (req, res) => {
  const where = { project_id: req.params.id };

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.assignee) {
    where.assignee_id = req.query.assignee;
  }

  const tasks = await Task.findAll({
    where,
    include: includeTaskRelations,
    order: [
      ['status', 'ASC'],
      ['due_date', 'ASC'],
      ['created_at', 'DESC']
    ]
  });

  return res.json(tasks);
};

const createTask = async (req, res) => {
  const {
    title,
    description = null,
    status = 'todo',
    priority = 'medium',
    due_date = null,
    assignee_id = null
  } = req.body;

  await ensureAssigneeIsProjectMember(req.project.id, assignee_id);

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    due_date,
    project_id: req.project.id,
    assignee_id,
    created_by: req.user.id
  });

  const createdTask = await findTaskOrFail(task.id);
  return res.status(201).json(createdTask);
};

const getTask = async (req, res) => {
  const task = await findTaskOrFail(req.params.taskId);
  const membership = await ProjectMember.findOne({
    where: {
      project_id: task.project_id,
      user_id: req.user.id
    }
  });

  if (!membership) {
    throw new AppError('You are not a member of this task project', 403);
  }

  return res.json({
    ...task.toJSON(),
    currentUserRole: membership.role
  });
};

const updateTask = async (req, res) => {
  const task = await findTaskOrFail(req.params.taskId);
  const membership = await attachProjectMembership(
    { ...req, params: { id: task.project_id } },
    task.project_id
  );

  const bodyKeys = Object.keys(req.body);
  if (bodyKeys.length === 0) {
    throw new AppError('At least one task field must be provided', 400);
  }

  if (membership.role !== 'admin') {
    if (task.assignee_id !== req.user.id) {
      throw new AppError('Members can only update tasks assigned to them', 403);
    }

    const disallowed = bodyKeys.filter((key) => key !== 'status');
    if (disallowed.length > 0) {
      throw new AppError('Members can only update the status of assigned tasks', 403);
    }

    await task.update({ status: req.body.status });
    return res.json(await findTaskOrFail(task.id));
  }

  const updates = {};
  for (const field of validTaskFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field] === '' ? null : req.body[field];
    }
  }

  await ensureAssigneeIsProjectMember(task.project_id, updates.assignee_id);
  await task.update(updates);

  return res.json(await findTaskOrFail(task.id));
};

const deleteTask = async (req, res) => {
  const task = await findTaskOrFail(req.params.taskId);
  const membership = await ProjectMember.findOne({
    where: {
      project_id: task.project_id,
      user_id: req.user.id
    }
  });

  if (!membership) {
    throw new AppError('You are not a member of this task project', 403);
  }

  if (membership.role !== 'admin') {
    throw new AppError('Project admin access is required', 403);
  }

  await task.destroy();
  return res.status(204).send();
};

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
};
