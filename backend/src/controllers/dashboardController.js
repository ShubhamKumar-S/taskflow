const { Op } = require('sequelize');
const { sequelize, ProjectMember, Task, User, Project } = require('../models');

const todayDateOnly = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDashboard = async (req, res) => {
  const memberships = await ProjectMember.findAll({
    where: { user_id: req.user.id },
    attributes: ['project_id']
  });
  const projectIds = memberships.map((membership) => membership.project_id);

  if (projectIds.length === 0) {
    return res.json({
      totalProjects: 0,
      totalTasks: 0,
      tasksByStatus: {
        todo: 0,
        in_progress: 0,
        done: 0
      },
      overdueTasks: []
    });
  }

  const [totalTasks, groupedStatuses, overdueTasks] = await Promise.all([
    Task.count({ where: { project_id: projectIds } }),
    Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { project_id: projectIds },
      group: ['status'],
      raw: true
    }),
    Task.findAll({
      where: {
        project_id: projectIds,
        status: { [Op.ne]: 'done' },
        due_date: { [Op.lt]: todayDateOnly() }
      },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['due_date', 'ASC']]
    })
  ]);

  const tasksByStatus = {
    todo: 0,
    in_progress: 0,
    done: 0
  };

  groupedStatuses.forEach((row) => {
    tasksByStatus[row.status] = Number(row.count);
  });

  return res.json({
    totalProjects: projectIds.length,
    totalTasks,
    tasksByStatus,
    overdueTasks
  });
};

module.exports = {
  getDashboard
};
