export const STATUS_LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done'
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function splitDueDateTime(value) {
  if (!value) {
    return { dueDate: '', dueTime: '' };
  }

  const [datePart, rawTime = ''] = String(value).split('T');
  const timePart = rawTime.slice(0, 5);
  return {
    dueDate: datePart,
    dueTime: timePart
  };
}

export function combineDueDateTime(dueDate, dueTime) {
  if (!dueDate) {
    return null;
  }

  return dueTime ? `${dueDate}T${dueTime}:00` : dueDate;
}

export function formatDate(value) {
  if (!value) {
    return 'No due date';
  }

  const { dueDate, dueTime } = splitDueDateTime(value);
  const [, month = '01', day = '01'] = dueDate.split('-');
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(`${dueDate}T00:00:00`));

  if (!dueTime) {
    return dateLabel;
  }

  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(`2000-${month}-${day}T${dueTime}:00`));

  return `${dateLabel} · ${timeLabel}`;
}

export function formatLongDate(value = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(value instanceof Date ? value : new Date(value));
}

function todayDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(task) {
  if (!task.due_date || task.status === 'done') {
    return false;
  }

  const { dueDate, dueTime } = splitDueDateTime(task.due_date);

  if (dueTime) {
    return new Date(`${dueDate}T${dueTime}:00`).getTime() < Date.now();
  }

  return dueDate < todayDateOnly();
}
