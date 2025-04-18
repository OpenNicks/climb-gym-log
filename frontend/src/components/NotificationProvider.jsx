import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('info');
  const showNotification = (msg, t = 'info') => {
    setMessage(msg);
    setType(t);
    setTimeout(() => setMessage(null), 2000);
  };
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {message && (
        <div style={{ position: 'fixed', top: 10, right: 10, background: type === 'error' ? '#f66' : '#6f6', color: '#fff', padding: 12, borderRadius: 8, zIndex: 1000 }}>
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
