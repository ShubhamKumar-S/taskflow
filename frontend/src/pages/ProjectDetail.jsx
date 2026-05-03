import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import AddMemberModal from '../components/AddMemberModal';
import LoadingSpinner from '../components/LoadingSpinner';
import MembersList from '../components/MembersList';
import TaskBoard from '../components/TaskBoard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from '../styles/App.module.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [savingProject, setSavingProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  const isAdmin = project?.currentUserRole === 'admin';

  const loadProject = useCallback(async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
    setEditForm({
      name: data.name || '',
      description: data.description || ''
    });
  }, [id]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (active) {
          setProject(data);
          setEditForm({
            name: data.name || '',
            description: data.description || ''
          });
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

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const updateEditField = useCallback((event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }, []);

  const toggleEditing = useCallback(() => {
    setEditing((current) => !current);
  }, []);

  const openAddMember = useCallback(() => {
    setShowAddMember(true);
  }, []);

  const closeAddMember = useCallback(() => {
    setShowAddMember(false);
  }, []);

  const handleSaveProject = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!editForm.name.trim()) {
        setError('Project name is required');
        return;
      }

      setSavingProject(true);
      try {
        const { data } = await api.put(`/projects/${id}`, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null
        });
        setProject(data);
        setEditing(false);
        addToast('Project updated');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSavingProject(false);
      }
    },
    [addToast, editForm.description, editForm.name, id]
  );

  const handleDeleteProject = useCallback(async () => {
    if (!window.confirm(`Delete "${project?.name}" and all of its tasks?`)) {
      return;
    }

    setError('');
    try {
      await api.delete(`/projects/${id}`);
      addToast('Project deleted');
      navigate('/projects');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, [addToast, id, navigate, project?.name]);

  const handleAddMember = useCallback(
    async (payload) => {
      await api.post(`/projects/${id}/members`, payload);
      await loadProject();
      setShowAddMember(false);
      addToast('Member added');
    },
    [addToast, id, loadProject]
  );

  const handleRemoveMember = useCallback(
    async (userId) => {
      if (!window.confirm('Remove this member from the project?')) {
        return;
      }

      setBusyUserId(userId);
      setError('');
      try {
        await api.delete(`/projects/${id}/members/${userId}`);
        addToast('Member removed');
        if (userId === user?.id) {
          navigate('/projects');
          return;
        }

        await loadProject();
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setBusyUserId(null);
      }
    },
    [addToast, id, loadProject, navigate, user?.id]
  );

  const handleTaskUpdate = useCallback(async (taskId, updates) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates);
      setProject((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? data : task))
      }));
      addToast('Task updated');
    } catch (requestError) {
      throw new Error(getErrorMessage(requestError));
    }
  }, [addToast]);

  const handleTaskDelete = useCallback(async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setProject((current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== taskId)
      }));
      addToast('Task deleted');
    } catch (requestError) {
      throw new Error(getErrorMessage(requestError));
    }
  }, [addToast]);

  if (loading) {
    return <LoadingSpinner label="Loading project" />;
  }

  if (error && !project) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  return (
    <div className={styles.pageStack}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{project.name}</h1>
          <p>{project.description || 'No description'}</p>
        </div>
        <div className={styles.headerActions}>
          {isAdmin ? (
            <Link to={`/projects/${id}/tasks/new`} className={styles.primaryButton}>
              <Plus size={18} />
              <span>New Task</span>
            </Link>
          ) : null}
          {isAdmin ? (
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={toggleEditing}
              >
                {editing ? <X size={18} /> : <Save size={18} />}
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
              <button type="button" className={styles.dangerButton} onClick={handleDeleteProject}>
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      {editing && isAdmin ? (
        <section className={styles.section}>
          <form className={styles.form} onSubmit={handleSaveProject}>
            <label>
              Project Name
              <input
                name="name"
                value={editForm.name}
                onChange={updateEditField}
                required
                maxLength={100}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="3"
                value={editForm.description}
                onChange={updateEditField}
              />
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton} disabled={savingProject}>
                {savingProject ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className={styles.detailLayout}>
        <MembersList
          members={project.members || []}
          isAdmin={isAdmin}
          onAddMember={openAddMember}
          onRemoveMember={handleRemoveMember}
          busyUserId={busyUserId}
        />

        <section className={styles.tasksPanel}>
          <div className={styles.sectionHeader}>
            <h2>Tasks</h2>
            <span>{project.tasks?.length || 0} total</span>
          </div>
          <TaskBoard
            tasks={project.tasks || []}
            members={project.members || []}
            isAdmin={isAdmin}
            currentUser={user}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            addTaskPath={`/projects/${id}/tasks/new`}
          />
        </section>
      </div>

      {showAddMember ? (
        <AddMemberModal onClose={closeAddMember} onSubmit={handleAddMember} />
      ) : null}
    </div>
  );
}
