import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import styles from '../styles/App.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', to: '/dashboard' },
  { id: 'projects', icon: '📁', label: 'Projects', to: '/projects' },
  { id: 'tasks', icon: '✅', label: 'My Tasks', to: '/my-tasks' },
  { id: 'team', icon: '👥', label: 'Team', to: '/team' }
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getBreadcrumb(pathname) {
  if (pathname.startsWith('/projects/') && pathname.includes('/tasks/new')) {
    return 'Projects / New Task';
  }

  if (pathname.startsWith('/projects/')) {
    return 'Projects / Project';
  }

  if (pathname.startsWith('/projects')) {
    return 'Projects';
  }

  if (pathname.startsWith('/my-tasks')) {
    return 'My Tasks';
  }

  if (pathname.startsWith('/team')) {
    return 'Team';
  }

  return 'Dashboard';
}

function Navbar() {
  const { user, logout } = useAuth();
  const { searchInput, setSearchInput, clearSearch } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleThemeToggle = useCallback(() => {
    setIsDark((current) => !current);
  }, []);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchInput(event.target.value);
    },
    [setSearchInput]
  );

  const breadcrumb = useMemo(() => getBreadcrumb(location.pathname), [location.pathname]);
  const initials = useMemo(
    () => getInitials(user?.name || user?.email) || 'U',
    [user?.email, user?.name]
  );

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) =>
        item.to ? (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              `${styles.sideNavLink} ${isActive ? styles.sideNavActive : ''}`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ) : (
          <span
            key={item.id}
            className={`${styles.sideNavLink} ${styles.sideNavDisabled}`}
            aria-disabled="true"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </span>
        )
      ),
    []
  );

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <NavLink to="/dashboard" className={styles.brand}>
            <span className={styles.brandMark} />
            <span className={styles.brandText}>TaskFlow</span>
          </NavLink>
        </div>

        <nav className={styles.sideNav} aria-label="Workspace navigation">
          {navItems}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
      </aside>

      <header className={styles.navbar}>
        <div className={styles.topbarLeft}>
          <NavLink to="/dashboard" className={styles.brand}>
            <span className={styles.brandMark} />
            <span className={styles.brandText}>TaskFlow</span>
          </NavLink>
          <span className={styles.breadcrumb}>{breadcrumb}</span>
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            className={styles.searchInput}
            type="search"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search projects and tasks"
            aria-label="Search projects and tasks"
          />
          {searchInput ? (
            <button
              type="button"
              className={styles.searchClear}
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>

        <div className={styles.topbarRight}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={handleThemeToggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <span
            className={`${styles.userRole} ${
              user?.role === 'admin' ? styles.roleAdmin : styles.roleMember
            }`}
          >
            {user?.role || 'member'}
          </span>
          <div className={styles.userAvatar} aria-hidden="true">
            {initials}
          </div>
          <button type="button" className={styles.signOutButton} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
    </>
  );
}

export default memo(Navbar);
