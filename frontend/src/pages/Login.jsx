import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useRef, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from '../styles/App.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filled, setFilled] = useState(false);
  const inputGroupRef = useRef(null);
  const fillTimerRef = useRef(null);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fillAccount = useCallback((e, p) => {
    setEmail(e);
    setPassword(p);
    setError('');
    setFilled(true);
    inputGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (fillTimerRef.current) {
      window.clearTimeout(fillTimerRef.current);
    }

    fillTimerRef.current = window.setTimeout(() => {
      setFilled(false);
    }, 1000);

    window.setTimeout(() => {
      document.getElementById('email-input')?.focus();
    }, 100);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.post('/auth/login', { email, password });
        login(data);
        addToast('Signed in successfully');
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [addToast, email, location.state?.from?.pathname, login, navigate, password]
  );

  const quickFillCards = (
    <div className={styles.quickFillGrid}>
      <button
        type="button"
        className={styles.quickFillCard}
        style={{ '--quick-color': 'var(--accent)' }}
        onClick={() => fillAccount('admin@example.com', 'password123')}
      >
        <span className={styles.quickFillIcon}>👑</span>
        <span className={styles.quickFillText}>
          <strong>Admin Account</strong>
          <span>admin@example.com</span>
          <span>Password: password123</span>
        </span>
        <span className={styles.quickFillAction}>Use this account →</span>
      </button>

      <button
        type="button"
        className={styles.quickFillCard}
        style={{ '--quick-color': 'var(--accent2)' }}
        onClick={() => fillAccount('member@example.com', 'password123')}
      >
        <span className={styles.quickFillIcon}>👤</span>
        <span className={styles.quickFillText}>
          <strong>Member Account</strong>
          <span>member@example.com</span>
          <span>Password: password123</span>
        </span>
        <span className={styles.quickFillAction}>Use this account →</span>
      </button>

      <button
        type="button"
        className={styles.quickFillCard}
        style={{ '--quick-color': 'var(--success)' }}
        onClick={() => fillAccount('test@gmail.com', 'password123')}
      >
        <span className={styles.quickFillIcon}>🧪</span>
        <span className={styles.quickFillText}>
          <strong>Test Account</strong>
          <span>test@gmail.com</span>
          <span>Password: password123</span>
        </span>
        <span className={styles.quickFillAction}>Use this account →</span>
      </button>
    </div>
  );

  return (
    <section className={styles.authShell}>
      <div className={styles.authAside}>
        <div className={styles.authAsideLogo} aria-hidden="true" />
        <span className={`${styles.floatingShape} ${styles.floatingShapeOne}`} />
        <span className={`${styles.floatingShape} ${styles.floatingShapeTwo}`} />
        <span className={`${styles.floatingShape} ${styles.floatingShapeThree}`} />
        <blockquote className={styles.authAsideQuote}>
          “Great projects are built by great teams.”
        </blockquote>
        <div className={styles.authAsideBrand}>TaskFlow</div>
      </div>

      <div className={styles.authPanel}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Sign in</h1>
            <p>Welcome back to your workspace</p>
          </div>

          {quickFillCards}

          {error ? <div className={styles.errorBox}>{error}</div> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div ref={inputGroupRef} className={styles.loginInputGroup}>
              <label>
                Email
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={filled ? 'filled' : ''}
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={filled ? 'filled' : ''}
                  required
                  autoComplete="current-password"
                />
              </label>
            </div>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className={styles.authSwitch}>
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
