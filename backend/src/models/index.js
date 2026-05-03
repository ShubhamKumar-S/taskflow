const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

User.hasMany(Project, {
  as: 'ownedProjects',
  foreignKey: 'owner_id',
  onDelete: 'CASCADE'
});
Project.belongsTo(User, {
  as: 'owner',
  foreignKey: 'owner_id'
});

Project.belongsToMany(User, {
  as: 'members',
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id'
});
User.belongsToMany(Project, {
  as: 'projects',
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id'
});

Project.hasMany(ProjectMember, {
  as: 'memberships',
  foreignKey: 'project_id',
  onDelete: 'CASCADE'
});
ProjectMember.belongsTo(Project, {
  as: 'project',
  foreignKey: 'project_id'
});
ProjectMember.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id'
});
User.hasMany(ProjectMember, {
  as: 'memberships',
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Project.hasMany(Task, {
  as: 'tasks',
  foreignKey: 'project_id',
  onDelete: 'CASCADE'
});
Task.belongsTo(Project, {
  as: 'project',
  foreignKey: 'project_id'
});
Task.belongsTo(User, {
  as: 'assignee',
  foreignKey: 'assignee_id'
});
Task.belongsTo(User, {
  as: 'creator',
  foreignKey: 'created_by'
});
User.hasMany(Task, {
  as: 'assignedTasks',
  foreignKey: 'assignee_id'
});
User.hasMany(Task, {
  as: 'createdTasks',
  foreignKey: 'created_by'
});

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task
};
