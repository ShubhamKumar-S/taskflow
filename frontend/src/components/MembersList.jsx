import { memo, useCallback, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '../styles/App.module.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const MemberRow = memo(function MemberRow({ member, role, isAdmin, busyUserId, onRemoveMember }) {
  const handleRemove = useCallback(() => {
    onRemoveMember(member.id);
  }, [member.id, onRemoveMember]);

  return (
    <article className={styles.memberRow}>
      <div className={styles.avatar} aria-hidden="true">
        {getInitials(member.name || member.email) || 'U'}
      </div>
      <div className={styles.memberInfo}>
        <strong>{member.name}</strong>
        <span>{member.email}</span>
      </div>
      <span className={`${styles.badge} ${role === 'admin' ? styles.roleAdmin : styles.roleMember}`}>
        {role}
      </span>
      {isAdmin ? (
        <button
          type="button"
          className={styles.iconButtonDanger}
          onClick={handleRemove}
          disabled={busyUserId === member.id}
          title="Remove member"
          aria-label={`Remove ${member.name}`}
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </article>
  );
});

function MembersList({ members, isAdmin, onAddMember, onRemoveMember, busyUserId }) {
  const memberRows = useMemo(
    () =>
      members.map((member) => {
        const role = member.ProjectMember?.role || 'member';
        return (
          <MemberRow
            key={member.id}
            member={member}
            role={role}
            isAdmin={isAdmin}
            busyUserId={busyUserId}
            onRemoveMember={onRemoveMember}
          />
        );
      }),
    [busyUserId, isAdmin, members, onRemoveMember]
  );

  return (
    <section className={styles.sidePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Members</h2>
          <span>{members.length} total</span>
        </div>
      </div>

      <div className={styles.memberList}>{memberRows}</div>

      {isAdmin ? (
        <div className={styles.membersFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onAddMember}>
            <Plus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default memo(MembersList);
