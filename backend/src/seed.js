const bcrypt = require('bcrypt');
require('dotenv').config();
const { sequelize, User, Project, ProjectMember, Task } = require('./models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash('password123', 10);

  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await ProjectMember.destroy({ where: {}, truncate: true, cascade: true });
  await Project.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password_hash: password,
    role: 'admin'
  });

  const member = await User.create({
    name: 'Member',
    email: 'member@example.com',
    password_hash: password,
    role: 'member'
  });

  const member2 = await User.create({
    name: 'Test User',
    email: 'test@gmail.com',
    password_hash: password,
    role: 'member'
  });

  const project = await Project.create({
    name: 'Demo Project',
    description: 'A sample project to get started',
    owner_id: admin.id
  });

  await ProjectMember.create({
    project_id: project.id,
    user_id: admin.id,
    role: 'admin'
  });
  await ProjectMember.create({
    project_id: project.id,
    user_id: member.id,
    role: 'member'
  });
  await ProjectMember.create({
    project_id: project.id,
    user_id: member2.id,
    role: 'member'
  });

  await Task.create({
    title: 'Design homepage',
    description: 'Create wireframes and mockups',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    project_id: project.id,
    assignee_id: member.id,
    created_by: admin.id
  });

  await Task.create({
    title: 'Setup database',
    description: 'Configure PostgreSQL and run migrations',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    project_id: project.id,
    assignee_id: member2.id,
    created_by: admin.id
  });

  await Task.create({
    title: 'Write API docs',
    description: 'Document all REST endpoints',
    status: 'done',
    priority: 'low',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    project_id: project.id,
    assignee_id: member.id,
    created_by: admin.id
  });

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed');
  console.error(error);
  process.exit(1);
});
