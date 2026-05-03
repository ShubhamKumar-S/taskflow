import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

function getInitials(name) {
  return (
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    const fetchTeam = async () => {
      try {
        const projectsRes = await api.get('/projects');
        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        const memberMap = {};

        for (const project of projects) {
          const detailRes = await api.get(`/projects/${project.id}`);
          const detail = detailRes.data;
          const projectMembers = detail.members || detail.ProjectMembers || [];

          projectMembers.forEach((projectMember) => {
            const user = projectMember.User || projectMember.user || projectMember;
            if (user?.id) {
              if (!memberMap[user.id]) {
                memberMap[user.id] = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  projects: []
                };
              }
              memberMap[user.id].projects.push({
                id: project.id,
                name: project.name,
                role: projectMember.ProjectMember?.role || projectMember.role || 'member'
              });
            }
          });
        }

        if (active) {
          setMembers(Object.values(memberMap));
        }
      } catch (_error) {
        if (active) {
          setMembers([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTeam();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(normalizedSearch) ||
        member.email?.toLowerCase().includes(normalizedSearch)
    );
  }, [members, search]);

  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const memberCards = useMemo(
    () =>
      filtered.map((member) => (
        <div key={member.id} className="team-card card">
          <div className="team-card-top">
            <div
              className="team-avatar"
              style={{
                background: member.role === 'admin' ? 'var(--accent)' : 'var(--accent2)'
              }}
            >
              {getInitials(member.name)}
            </div>
            <div className="team-info">
              <div className="team-name">{member.name}</div>
              <div className="team-email">{member.email}</div>
            </div>
            <span className={`badge badge-${member.role}`}>{member.role}</span>
          </div>
          <div className="divider" />
          <div className="team-projects">
            <div className="team-projects-label">Projects</div>
            <div className="team-projects-list">
              {member.projects.length === 0 ? (
                <span className="muted">No projects</span>
              ) : (
                member.projects.map((project) => (
                  <span key={`${member.id}-${project.id}-${project.role}`} className="team-project-chip">
                    📁 {project.name}
                    <span className={`chip-role chip-role-${project.role}`}>{project.role}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )),
    [filtered]
  );

  if (loading) {
    return <div className="page-loading">Loading team...</div>;
  }

  return (
    <div className="page-container fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">
            {members.length} member{members.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
      </div>

      <div className="team-search-wrap">
        <span className="search-icon-inline">🔍</span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="team-search-input"
        />
        {search ? (
          <button className="search-clear" onClick={clearSearch} type="button">
            ×
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No members found</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="team-grid stagger">{memberCards}</div>
      )}
    </div>
  );
}
