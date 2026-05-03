import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import styles from '../styles/App.module.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);
  const toastNodes = useMemo(
    () =>
      toasts.map((toast) => {
        const Icon = toast.type === 'error' ? XCircle : CheckCircle;
        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${
              toast.type === 'error' ? styles.toastError : styles.toastSuccess
            }`}
          >
            <Icon size={18} />
            <span>{toast.message}</span>
          </div>
        );
      }),
    [toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastStack} role="status" aria-live="polite">
        {toastNodes}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
