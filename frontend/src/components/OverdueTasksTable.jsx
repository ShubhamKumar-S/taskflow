import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';
import styles from '../styles/App.module.css';

function OverdueTasksTable({ tasks }) {
  const taskRows = useMemo(
    () =>
      tasks.map((task) => (
        <tr key={task.id}>
          <td>{task.title}</td>
          <td>
            <Link to={`/projects/${task.project_id}`}>{task.project?.name}</Link>
          </td>
          <td>{task.assignee?.name || 'Unassigned'}</td>
          <td>
            <StatusBadge value={task.status} />
          </td>
          <td>
            <StatusBadge value={task.priority} type="priority" />
          </td>
          <td className={styles.dangerText}>{formatDate(task.due_date)}</td>
        </tr>
      )),
    [tasks]
  );

  if (tasks.length === 0) {
    return <p className={styles.emptyState}>No overdue tasks.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Task</th>
            <th>Project</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>{taskRows}</tbody>
      </table>
    </div>
  );
}

export default memo(OverdueTasksTable);
