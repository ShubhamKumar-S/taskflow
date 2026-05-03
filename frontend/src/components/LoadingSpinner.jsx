import styles from '../styles/App.module.css';

export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className={styles.loadingState}>
      <div className={styles.skeletonGrid} aria-hidden="true">
        <span className={styles.skeletonCard} />
        <span className={styles.skeletonCard} />
        <span className={styles.skeletonCard} />
      </div>
      <span>{label}</span>
    </div>
  );
}
