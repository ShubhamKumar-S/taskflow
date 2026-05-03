import { memo, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FolderKanban, ListChecks } from 'lucide-react';
import styles from '../styles/App.module.css';

const STAT_CONFIG = [
  {
    id: 'projects',
    label: 'Total Projects',
    icon: FolderKanban,
    className: styles.statOrange,
    trend: 'Notebook index'
  },
  {
    id: 'tasks',
    label: 'Total Tasks',
    icon: ListChecks,
    className: styles.statBlue,
    trend: 'Across workspaces'
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    className: styles.statGreen,
    trend: 'Closed with care'
  },
  {
    id: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    className: styles.statRed,
    trend: 'Needs attention'
  }
];

function DashboardStats({ data }) {
  const values = useMemo(
    () => ({
      projects: data.totalProjects,
      tasks: data.totalTasks,
      completed: data.tasksByStatus.done,
      overdue: data.overdueTasks.length
    }),
    [data]
  );

  const statCards = useMemo(
    () =>
      STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        return (
          <article key={stat.id} className={`${styles.statCard} ${stat.className}`}>
            <Icon size={22} />
            <div>
              <strong>{values[stat.id]}</strong>
              <span>{stat.label}</span>
            </div>
            <small className={styles.statTrend}>{stat.trend}</small>
          </article>
        );
      }),
    [values]
  );

  return (
    <div className={`${styles.statsGrid} stagger`}>
      {statCards}
    </div>
  );
}

export default memo(DashboardStats);
