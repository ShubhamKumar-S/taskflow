import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { combineDueDateTime } from '../utils/format';
import styles from '../styles/App.module.css';

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  due_time: '',
  assignee_id: ''
};

const statuses = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const priorities = [
  { value: 'low', label: 'Low', dotClass: 'priorityDotLow' },
  { value: 'medium', label: 'Medium', dotClass: 'priorityDotMedium' },
  { value: 'high', label: 'High', dotClass: 'priorityDotHigh' }
];

export default function CreateTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProject() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (active) {
          setProject(data);
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

    loadProject();

    return () => {
      active = false;
    };
  }, [id]);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const setStatus = useCallback((value) => {
    setForm((current) => ({ ...current, status: value }));
  }, []);

  const setPriority = useCallback((value) => {
    setForm((current) => ({ ...current, priority: value }));
  }, []);

  const statusButtons = useMemo(
    () =>
      statuses.map((status) => (
        <button
          key={status.value}
          type="button"
          className={`${styles.toggleButton} ${
            form.status === status.value ? styles.toggleActive : ''
          }`}
          onClick={() => setStatus(status.value)}
        >
          {status.label}
        </button>
      )),
    [form.status, setStatus]
  );

  const priorityButtons = useMemo(
    () =>
      priorities.map((priority) => (
        <button
          key={priority.value}
          type="button"
          className={`${styles.priorityOption} ${
            form.priority === priority.value ? styles.priorityOptionActive : ''
          }`}
          onClick={() => setPriority(priority.value)}
        >
          <span
            className={`${styles.priorityDot} ${styles[priority.dotClass]}`}
            aria-hidden="true"
          />
          {priority.label}
        </button>
      )),
    [form.priority, setPriority]
  );

  const memberOptions = useMemo(
    () =>
      project?.members?.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      )) || [],
    [project?.members]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!form.title.trim()) {
        setError('Task title is required');
        return;
      }

      setSaving(true);
      try {
        await api.post(`/projects/${id}/tasks`, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          priority: form.priority,
          due_date: combineDueDateTime(form.due_date, form.due_time),
          assignee_id: form.assignee_id ? Number(form.assignee_id) : null
        });
        addToast('Task created');
        navigate(`/projects/${id}`);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSaving(false);
      }
    },
    [addToast, form, id, navigate]
  );

  if (loading) {
    return <LoadingSpinner label="Loading task form" />;
  }

  if (error && !project) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  if (project.currentUserRole !== 'admin') {
    return (
      <div className={styles.pageStack}>
        <div className={styles.errorBox}>Project admin access is required.</div>
        <Link to={`/projects/${id}`} className={styles.secondaryButton}>
          <ArrowLeft size={18} />
          <span>Back to Project</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.modalBackdrop}>
      <section className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <div>
            <h2>New Task</h2>
            <p>{project.name}</p>
          </div>
          <Link to={`/projects/${id}`} className={styles.iconButton} title="Close">
            <X size={18} />
          </Link>
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
              maxLength={200}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows="4"
            />
          </label>

          <div className={styles.statusToggle}>
            <span>Status</span>
            <div className={styles.toggleGroup}>
              {statusButtons}
            </div>
          </div>

          <div className={styles.prioritySelector}>
            <span>Priority</span>
            <div className={styles.toggleGroup}>
              {priorityButtons}
            </div>
          </div>

          <div className={styles.twoCol}>
            <label>
              📅 Due Date
              <input type="date" name="due_date" value={form.due_date} onChange={updateField} />
            </label>
            <label>
              🕐 Due Time
              <input type="time" name="due_time" value={form.due_time} onChange={updateField} />
            </label>
          </div>
          <div className={styles.twoCol}>
            <label>
              Assignee
              <select name="assignee_id" value={form.assignee_id} onChange={updateField}>
                <option value="">Unassigned</option>
                {memberOptions}
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <Link to={`/projects/${id}`} className={styles.secondaryButton}>
              <ArrowLeft size={18} />
              <span>Cancel</span>
            </Link>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
