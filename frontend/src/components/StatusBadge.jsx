import { memo } from 'react';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/format';
import styles from '../styles/App.module.css';

const statusClasses = {
  todo: styles.statusTodo,
  in_progress: styles.statusInProgress,
  done: styles.statusDone
};

const priorityClasses = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh
};

function StatusBadge({ value, type = 'status' }) {
  const labels = type === 'priority' ? PRIORITY_LABELS : STATUS_LABELS;
  const classes = type === 'priority' ? priorityClasses : statusClasses;

  return (
    <span className={`${styles.badge} ${classes[value] || styles.badgeNeutral}`}>
      {labels[value] || value}
    </span>
  );
}

export default memo(StatusBadge);
