const { Op } = require('sequelize');
const { Project, ProjectMember, Task, User, sequelize } = require('../models');
const AppError = require('../utils/appError');

const userAttributes = ['id', 'name', 'email', 'role', 'created_at'];

const taskInclude = [
  { model: User, as: 'assignee', attributes: userAttributes },
  { model: User, as: 'creator', attributes: userAttributes }
];

const projectDetailInclude = [
  { model: User, as: 'owner', attributes: userAttributes },
  {
    model: User,
    as: 'members',
    attributes: userAttributes,
    through: { attributes: ['role'] }
  },
  {
    model: Task,
    as: 'tasks',
    include: taskInclude
  }
];

const formatProject = (project, currentUserId) => {
  const plain = project.toJSON();
  const membership = plain.memberships?.[0];
  const memberRecord = plain.members?.find((member) => member.id === currentUserId);

  return {
    ...plain,
    currentUserRole:
      membership?.role || memberRecord?.ProjectMember?.role || plain.currentUserRole || null,
    memberships: undefined
  };
};

const listProjects = async (req, res) => {
  const projects = await Project.findAll({
    include: [
      { model: User, as: 'owner', attributes: userAttributes },
      {
        model: ProjectMember,
        as: 'memberships',
        attributes: ['role'],
        required: true,
        where: { user_id: req.user.id }
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return res.json(projects.map((project) => formatProject(project, req.user.id)));
};

const getProjectWithDetails = async (projectId) =>
  Project.findByPk(projectId, {
    include: projectDetailInclude,
    order: [[{ model: Task, as: 'tasks' }, 'created_at', 'DESC']]
  });

const getProjectDetails = async (req, res) => {
  const project = await getProjectWithDetails(req.params.id);

  return res.json({
    ...formatProject(project, req.user.id),
    currentUserRole: req.projectRole
  });
};

const createProject = async (req, res) => {
  const { name, description = null } = req.body;

  const project = await sequelize.transaction(async (transaction) => {
    const createdProject = await Project.create(
      {
        name,
        description,
        owner_id: req.user.id
      },
      { transaction }
    );

    await ProjectMember.create(
      {
        project_id: createdProject.id,
        user_id: req.user.id,
        role: 'admin'
      },
      { transaction }
    );

    return createdProject;
  });

  const projectWithDetails = await getProjectWithDetails(project.id);

  return res.status(201).json({
    ...formatProject(projectWithDetails, req.user.id),
    currentUserRole: 'admin'
  });
};

const updateProject = async (req, res) => {
  const { name, description = null } = req.body;

  await req.project.update({ name, description });
  const project = await getProjectWithDetails(req.project.id);

  return res.json({
    ...formatProject(project, req.user.id),
    currentUserRole: req.projectRole
  });
};

const deleteProject = async (req, res) => {
  await sequelize.transaction(async (transaction) => {
    await Task.destroy({
      where: { project_id: req.project.id },
      transaction
    });
    await ProjectMember.destroy({
      where: { project_id: req.project.id },
      transaction
    });
    await req.project.destroy({ transaction });
  });

  return res.status(204).send();
};

const addMember = async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new AppError('User with that email was not found', 404, [
      { field: 'email', message: 'No registered user uses that email' }
    ]);
  }

  const existingMembership = await ProjectMember.findOne({
    where: {
      project_id: req.project.id,
      user_id: user.id
    }
  });

  if (existingMembership) {
    throw new AppError('User is already a member of this project', 409, [
      { field: 'email', message: 'User is already in this project' }
    ]);
  }

  await ProjectMember.create({
    project_id: req.project.id,
    user_id: user.id,
    role
  });

  const member = await User.findByPk(user.id, { attributes: userAttributes });

  return res.status(201).json({
    ...member.toJSON(),
    ProjectMember: {
      role
    }
  });
};

const removeMember = async (req, res) => {
  const membership = await ProjectMember.findOne({
    where: {
      project_id: req.project.id,
      user_id: req.params.userId
    }
  });

  if (!membership) {
    throw new AppError('Project membership not found', 404);
  }

  if (membership.role === 'admin') {
    const adminCount = await ProjectMember.count({
      where: {
        project_id: req.project.id,
        role: 'admin',
        user_id: { [Op.ne]: req.params.userId }
      }
    });

    if (adminCount === 0) {
      throw new AppError('A project must have at least one admin', 400);
    }
  }

  await Task.update(
    { assignee_id: null },
    {
      where: {
        project_id: req.project.id,
        assignee_id: req.params.userId
      }
    }
  );
  await membership.destroy();
  return res.status(204).send();
};

module.exports = {
  listProjects,
  getProjectDetails,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
