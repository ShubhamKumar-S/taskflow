const { Project, ProjectMember } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('./asyncHandler');

const getProjectId = (req) => req.params.id || req.params.projectId;

const attachProjectMembership = async (req, projectId) => {
  const project = await Project.findByPk(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const membership = await ProjectMember.findOne({
    where: {
      project_id: projectId,
      user_id: req.user.id
    }
  });

  if (!membership) {
    throw new AppError('You are not a member of this project', 403);
  }

  req.project = project;
  req.projectMembership = membership;
  req.projectRole = membership.role;

  return membership;
};

const isProjectMember = asyncHandler(async (req, _res, next) => {
  await attachProjectMembership(req, getProjectId(req));
  next();
});

const isProjectAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await attachProjectMembership(req, getProjectId(req));

  if (membership.role !== 'admin') {
    throw new AppError('Project admin access is required', 403);
  }

  next();
});

module.exports = {
  isProjectMember,
  isProjectAdmin,
  attachProjectMembership
};
