'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionContext({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchInterval={10 * 60}
      refetchOnWindowFocus={
        typeof navigator !== 'undefined' && navigator.onLine
      }
      refetchWhenOffline={false}
    >
      {/* <AuthProvider> */}
      {children}
      {/* </AuthProvider> */}
    </SessionProvider>
  );
}
