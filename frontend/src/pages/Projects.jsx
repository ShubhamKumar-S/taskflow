import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import { useSearch } from '../context/SearchContext';
import { useToast } from '../context/ToastContext';
import styles from '../styles/App.module.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { addToast } = useToast();
  const { searchQuery } = useSearch();

  const loadProjects = useCallback(async () => {
    setError('');
    const { data } = await api.get('/projects');
    setProjects(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/projects');
        if (active) {
          setProjects(data);
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
  }, []);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm((current) => !current);
  }, []);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCreate = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!form.name.trim()) {
        setError('Project name is required');
        return;
      }

      setSaving(true);
      try {
        await api.post('/projects', {
          name: form.name.trim(),
          description: form.description.trim() || null
        });
        setForm({ name: '', description: '' });
        setShowForm(false);
        await loadProjects();
        addToast('Project created');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSaving(false);
      }
    },
    [addToast, form.description, form.name, loadProjects]
  );

  const filteredProjects = useMemo(() => {
    if (!searchQuery) {
      return projects;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery)
    );
  }, [projects, searchQuery]);

  const projectCards = useMemo(
    () => filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />),
    [filteredProjects]
  );

  if (loading) {
    return <LoadingSpinner label="Loading projects" />;
  }

  return (
    <div className={styles.pageStack}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length === 1 ? '' : 's'}</p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={toggleForm}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showForm ? 'Close' : 'New Project'}</span>
        </button>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      {showForm ? (
        <section className={styles.section}>
          <form className={styles.form} onSubmit={handleCreate}>
            <label>
              Project Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                maxLength={100}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="3"
              />
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {searchQuery ? <p className={styles.searchNote}>Searching for: {searchQuery}</p> : null}

      {filteredProjects.length === 0 ? (
        <section className={styles.emptyState}>
          <div>
            <h2>{searchQuery ? 'No projects match your search' : 'No projects yet'}</h2>
            <p>
              {searchQuery
                ? 'Try a different project name or description.'
                : 'Start with a workspace for your next launch, sprint, or client delivery.'}
            </p>
            {!searchQuery ? (
              <button type="button" className={styles.primaryButton} onClick={openForm}>
                <Plus size={18} />
                <span>Create Project</span>
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <div className={`${styles.projectGrid} stagger`}>{projectCards}</div>
      )}
    </div>
  );
}
