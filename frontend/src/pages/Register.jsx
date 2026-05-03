import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from '../styles/App.module.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError('Name, email, and password are required');
        return;
      }

      if (form.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      setSaving(true);
      try {
        const { data } = await api.post('/auth/register', {
          ...form,
          name: form.name.trim(),
          email: form.email.trim()
        });
        login(data);
        addToast('Account created');
        navigate('/dashboard', { replace: true });
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSaving(false);
      }
    },
    [addToast, form, login, navigate]
  );

  return (
    <section className={styles.authPanel}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <UserPlus size={30} />
          <div>
            <h1>Create Account</h1>
            <p>Start managing work in TaskFlow</p>
          </div>
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              required
              maxLength={100}
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label>
            Account Role
            <select name="role" value={form.role} onChange={updateField}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" className={styles.primaryButton} disabled={saving}>
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
