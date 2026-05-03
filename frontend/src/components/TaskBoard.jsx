import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { useSearch } from '../context/SearchContext';
import styles from '../styles/App.module.css';

const COLUMNS = [
  { key: 'todo', label: '📋 To Do', className: styles.boardColumnTodo },
  { key: 'in_progress', label: '⚡ In Progress', className: styles.boardColumnProgress },
  { key: 'done', label: '✅ Done', className: styles.boardColumnDone }
];

function highlightText(text, query) {
  if (!query) {
    return text;
  }

  const normalizedText = text || '';
  const index = normalizedText.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) {
    return normalizedText;
  }

  const before = normalizedText.slice(0, index);
  const match = normalizedText.slice(index, index + query.length);
  const after = normalizedText.slice(index + query.length);

  return (
    <>
      {before}
      <mark className={styles.searchMark}>{match}</mark>
      {after}
    </>
  );
}

function TaskBoard({ tasks, members, isAdmin, currentUser, onTaskUpdate, onTaskDelete, addTaskPath }) {
  const { searchQuery } = useSearch();
  const visibleTasks = useMemo(() => {
    if (!searchQuery) {
      return tasks;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, tasks]);

  const groupedColumns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        tasks: visibleTasks
          .filter((task) => task.status === column.key)
          .sort((left, right) => {
            const leftDate = left.due_date || '9999-12-31';
            const rightDate = right.due_date || '9999-12-31';
            return leftDate.localeCompare(rightDate);
          })
      })),
    [visibleTasks]
  );

  const columnNodes = useMemo(
    () =>
      groupedColumns.map((column) => {
        const taskNodes =
          column.tasks.length === 0
            ? [<p key={`${column.key}-empty`} className={styles.emptyColumn}>No tasks</p>]
            : column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  titleNode={highlightText(task.title, searchQuery)}
                />
              ));

        return (
          <section
            key={column.key}
            className={`${styles.boardColumn} ${column.className}`}
          >
            <div className={styles.columnHeader}>
              <h2>{column.label}</h2>
              <span>{column.tasks.length}</span>
            </div>

            <div className={styles.taskList}>{taskNodes}</div>

            {isAdmin && column.key === 'todo' && addTaskPath ? (
              <Link to={addTaskPath} className={styles.taskAddLink}>
                <Plus size={17} />
                <span>Add Task</span>
              </Link>
            ) : null}
          </section>
        );
      }),
    [
      addTaskPath,
      currentUser,
      groupedColumns,
      isAdmin,
      members,
      onTaskDelete,
      onTaskUpdate,
      searchQuery
    ]
  );

  return (
    <>
      {searchQuery ? <p className={styles.searchNote}>Searching tasks for: {searchQuery}</p> : null}
      <div className={styles.board}>{columnNodes}</div>
    </>
  );
}

export default memo(TaskBoard);
