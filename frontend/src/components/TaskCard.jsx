import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Pencil, Save, Trash2, X } from 'lucide-react';
import {
  combineDueDateTime,
  formatDate,
  isOverdue,
  PRIORITY_LABELS,
  splitDueDateTime,
  STATUS_LABELS
} from '../utils/format';
import StatusBadge from './StatusBadge';
import styles from '../styles/App.module.css';

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);
const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS);

const priorityDotClasses = {
  low: styles.priorityDotLow,
  medium: styles.priorityDotMedium,
  high: styles.priorityDotHigh
};

const taskPriorityClasses = {
  low: styles.taskPriorityLow,
  medium: styles.taskPriorityMedium,
  high: styles.taskPriorityHigh
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function normalizeTaskForm(task) {
  const { dueDate, dueTime } = splitDueDateTime(task.due_date);
  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    due_date: dueDate,
    due_time: dueTime,
    assignee_id: task.assignee_id ? String(task.assignee_id) : ''
  };
}

function TaskCard({ task, members, isAdmin, currentUser, onUpdate, onDelete, titleNode }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => normalizeTaskForm(task));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const assignedToMe = task.assignee_id === currentUser?.id;
  const canUpdateStatus = isAdmin || assignedToMe;
  const overdue = isOverdue(task);
  const assigneeInitials = useMemo(
    () => getInitials(task.assignee?.name || task.assignee?.email) || 'NA',
    [task.assignee?.email, task.assignee?.name]
  );

  useEffect(() => {
    setForm(normalizeTaskForm(task));
  }, [task]);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      )),
    []
  );

  const priorityOptions = useMemo(
    () =>
      PRIORITY_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      )),
    []
  );

  const memberOptions = useMemo(
    () =>
      members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      )),
    [members]
  );

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleStatusChange = useCallback(
    async (event) => {
      const nextStatus = event.target.value;
      setBusy(true);
      setError('');
      try {
        await onUpdate(task.id, { status: nextStatus });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setBusy(false);
      }
    },
    [onUpdate, task.id]
  );

  const handleSave = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!form.title.trim()) {
        setError('Task title is required');
        return;
      }

      setBusy(true);
      try {
        await onUpdate(task.id, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          priority: form.priority,
          due_date: combineDueDateTime(form.due_date, form.due_time),
          assignee_id: form.assignee_id ? Number(form.assignee_id) : null
        });
        setEditing(false);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setBusy(false);
      }
    },
    [form, onUpdate, task.id]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    setBusy(true);
    setError('');
    try {
      await onDelete(task.id);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  }, [onDelete, task.id, task.title]);

  const openEditor = useCallback(() => {
    setEditing(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditing(false);
  }, []);

  if (editing && isAdmin) {
    return (
      <article className={`${styles.taskCard} ${taskPriorityClasses[task.priority]}`}>
        {error ? <div className={styles.errorBox}>{error}</div> : null}
        <form className={styles.compactForm} onSubmit={handleSave}>
          <label>
            Title
            <input name="title" value={form.title} onChange={updateField} required maxLength={200} />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={updateField} rows="3" />
          </label>
          <div className={styles.twoCol}>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                {statusOptions}
              </select>
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                {priorityOptions}
              </select>
            </label>
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
          <label>
            Assignee
            <select name="assignee_id" value={form.assignee_id} onChange={updateField}>
              <option value="">Unassigned</option>
              {memberOptions}
            </select>
          </label>
          <div className={styles.cardActions}>
            <button type="submit" className={styles.iconButtonSuccess} disabled={busy} title="Save task">
              <Save size={16} />
            </button>
            <button type="button" className={styles.iconButton} onClick={closeEditor} title="Cancel">
              <X size={16} />
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      className={`${styles.taskCard} ${taskPriorityClasses[task.priority]} ${
        overdue ? styles.taskOverdue : ''
      }`}
    >
      <div className={styles.taskHeader}>
        <h3 className={styles.taskCardTitle}>{titleNode || task.title}</h3>
        {isAdmin ? (
          <div className={styles.inlineActions}>
            <button type="button" className={styles.iconButton} onClick={openEditor} title="Edit task">
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className={styles.iconButtonDanger}
              onClick={handleDelete}
              disabled={busy}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {task.description ? <p className={styles.taskDescription}>{task.description}</p> : null}

      <div className={styles.taskBadges}>
        <span
          className={`${styles.priorityDot} ${priorityDotClasses[task.priority]}`}
          aria-hidden="true"
        />
        <StatusBadge value={task.priority} type="priority" />
        <StatusBadge value={task.status} />
        {overdue ? <span className={styles.overdueTag}>Overdue</span> : null}
      </div>

      <dl className={styles.taskMeta}>
        <div>
          <dt>Due</dt>
          <dd className={overdue ? styles.dangerText : ''}>
            <CalendarDays size={15} />
            {formatDate(task.due_date)}
          </dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{task.assignee?.name || 'Unassigned'}</dd>
        </div>
      </dl>

      {canUpdateStatus ? (
        <label className={styles.statusControl}>
          <span>Status</span>
          <select value={task.status} onChange={handleStatusChange} disabled={busy}>
            {statusOptions}
          </select>
        </label>
      ) : null}

      {assignedToMe && !isAdmin ? (
        <div className={styles.assignedHint}>
          <Check size={15} />
          <span>Assigned to you</span>
        </div>
      ) : null}

      <div className={styles.taskFooter}>
        <span />
        <div className={styles.assigneeAvatar} title={task.assignee?.name || 'Unassigned'}>
          {assigneeInitials}
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}
    </article>
  );
}

export default memo(TaskCard);
