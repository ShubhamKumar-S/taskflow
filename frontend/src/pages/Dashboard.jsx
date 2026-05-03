import { useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import DashboardStats from '../components/DashboardStats';
import LoadingSpinner from '../components/LoadingSpinner';
import OverdueTasksTable from '../components/OverdueTasksTable';
import { useAuth } from '../context/AuthContext';
import { formatLongDate } from '../utils/format';
import styles from '../styles/App.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const todayLabel = useMemo(() => formatLongDate(new Date()), []);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/dashboard');
        if (active) {
          setData(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard" />;
  }

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  return (
    <div className={styles.pageStack}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Good morning, {user?.name || 'there'} 👋</h1>
          <p>{todayLabel}</p>
        </div>
      </div>

      <DashboardStats data={data} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>⚠️ Overdue Tasks</h2>
        </div>
        <OverdueTasksTable tasks={data.overdueTasks} />
      </section>
    </div>
  );
}
