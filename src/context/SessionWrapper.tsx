'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import { Session } from 'next-auth';

// Create a context to store session data
type SessionContextType = {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: () => Promise<Session | null>;
};

const SessionWrapperContext = createContext<SessionContextType>({
  session: null,
  status: 'loading',
  update: async () => null
});

// Hook to access session data without triggering additional fetches
export const useSessionWrapper = (options?: { required?: boolean }) => {
  const context = useContext(SessionWrapperContext);

  // Handle required: true functionality
  useEffect(() => {
    if (options?.required && context.status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [options?.required, context.status]);

  return context;
};

// Component to efficiently share session data with children
export default function SessionWrapper({ children }: { children: ReactNode }) {
  // This is the only place we call useSession() directly
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('RefreshAccessTokenError');
      signOut();
    }
  }, [session?.error, status]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      session: session || null,
      status,
      update
    }),
    [session, status, update]
  );

  return (
    <SessionWrapperContext.Provider value={contextValue}>
      {children}
    </SessionWrapperContext.Provider>
  );
}
