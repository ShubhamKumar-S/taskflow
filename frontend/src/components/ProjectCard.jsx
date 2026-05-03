import { memo, useMemo } from 'react';
import { ArrowRight, Calendar, FolderKanban, Shield, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';
import styles from '../styles/App.module.css';

const PROJECT_COLORS = ['#c45c2e', '#2e7dc4', '#2d7a4f', '#b5820a'];

function ProjectCard({ project }) {
  const initial = project.name?.trim()?.[0]?.toUpperCase() || 'P';
  const projectColor = useMemo(
    () => PROJECT_COLORS[Math.abs(Number(project.id) || 0) % PROJECT_COLORS.length],
    [project.id]
  );
  const memberCount = project.members?.length ?? project.memberCount;
  const taskCount = project.tasks?.length ?? project.taskCount;
  const memberLabel = Number.isFinite(memberCount) ? `${memberCount} members` : 'Members';
  const taskLabel = Number.isFinite(taskCount) ? `${taskCount} tasks` : 'Task board';

  return (
    <Link
      to={`/projects/${project.id}`}
      className={styles.projectCard}
      style={{ '--project-color': projectColor }}
      data-initial={initial}
    >
      <div className={styles.projectIcon}>
        <FolderKanban size={22} />
      </div>
      <div className={styles.projectBody}>
        <h2>{project.name}</h2>
        <p>{project.description || 'No description'}</p>
        <div className={styles.cardMetaRow}>
          <span className={styles.projectMetric}>
            <UserRound size={14} />
            {memberLabel}
          </span>
          <span className={styles.projectMetric}>
            <FolderKanban size={14} />
            {taskLabel}
          </span>
          <span className={styles.projectMetric}>
            <Calendar size={14} />
            {formatDate(project.created_at?.slice(0, 10))}
          </span>
          <span className={`${styles.badge} ${styles.roleBadge}`}>
            <Shield size={13} />
            {project.currentUserRole}
          </span>
        </div>
        <span className={styles.viewLink}>
          View Project <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export default memo(ProjectCard);
