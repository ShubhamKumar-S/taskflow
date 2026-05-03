import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const FILTERS = ['all', 'todo', 'in_progress', 'done'];

const FILTER_LABELS = {
  all: 'All',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
};

function formatDueDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const fetchMyTasks = async () => {
      try {
        const projectsRes = await api.get('/projects');
        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        const allTasks = [];

        for (const project of projects) {
          const tasksRes = await api.get(`/projects/${project.id}/tasks`);
          const projectTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
          projectTasks.forEach((task) => {
            allTasks.push({ ...task, projectName: project.name });
          });
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const myTasks = allTasks.filter((task) => task.assignee_id === user.id);

        if (active) {
          setTasks(myTasks);
        }
      } catch (_error) {
        if (active) {
          setTasks([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMyTasks();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)),
    [filter, tasks]
  );

  const isOverdue = useCallback((task) => {
    return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  }, []);

  const filterTabs = useMemo(
    () =>
      FILTERS.map((item) => (
        <button
          key={item}
          className={`filter-tab ${filter === item ? 'active' : ''}`}
          onClick={() => setFilter(item)}
          type="button"
        >
          {FILTER_LABELS[item]}
          <span className="filter-count">
            {item === 'all' ? tasks.length : tasks.filter((task) => task.status === item).length}
          </span>
        </button>
      )),
    [filter, tasks]
  );

  const taskItems = useMemo(
    () =>
      filtered.map((task) => (
        <div key={task.id} className={`task-list-item card ${isOverdue(task) ? 'overdue' : ''}`}>
          <div className="task-list-left">
            <div className={`priority-dot priority-${task.priority}`} />
            <div>
              <div className="task-list-title">{task.title}</div>
              {task.description ? <div className="task-list-desc">{task.description}</div> : null}
              <div className="task-list-meta">
                <span className="task-project">📁 {task.projectName}</span>
                {task.due_date ? (
                  <span className={`task-due ${isOverdue(task) ? 'text-danger' : ''}`}>
                    📅 {formatDueDate(task.due_date)}
                    {isOverdue(task) ? ' · Overdue' : ''}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="task-list-right">
            <span
              className={`badge badge-${
                task.status === 'in_progress' ? 'inprogress' : task.status
              }`}
            >
              {FILTER_LABELS[task.status]}
            </span>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          </div>
        </div>
      )),
    [filtered, isOverdue]
  );

  if (loading) {
    return <div className="page-loading">Loading your tasks...</div>;
  }

  return (
    <div className="page-container fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
      </div>

      <div className="filter-tabs">{filterTabs}</div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No tasks here</h3>
          <p>
            {filter === 'all'
              ? 'No tasks have been assigned to you yet.'
              : `No ${filter.replace('_', ' ')} tasks.`}
          </p>
        </div>
      ) : (
        <div className="tasks-list stagger">{taskItems}</div>
      )}
    </div>
  );
}
