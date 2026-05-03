import { X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { getErrorMessage } from '../api/client';
import styles from '../styles/App.module.css';

function AddMemberModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!form.email.trim()) {
        setError('Email is required');
        return;
      }

      setSaving(true);
      try {
        await onSubmit({ email: form.email.trim(), role: form.role });
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSaving(false);
      }
    },
    [form.email, form.role, onSubmit]
  );

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="add-member-title">
        <div className={styles.modalHeader}>
          <h2 id="add-member-title">Add Member</h2>
          <button type="button" className={styles.iconButton} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              autoFocus
            />
          </label>

          <label>
            Role
            <select name="role" value={form.role} onChange={updateField}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(AddMemberModal);
