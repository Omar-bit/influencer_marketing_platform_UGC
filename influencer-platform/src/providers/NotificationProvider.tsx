'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

interface NotificationContextType {
  refreshNotifications: () => void;
  lastRefreshed: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  const refreshNotifications = useCallback(() => {
    setLastRefreshed(Date.now());
  }, []);

  return (
    <NotificationContext.Provider
      value={{ refreshNotifications, lastRefreshed }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
