import { AxiosInstance } from 'axios';
import createAxiosInstance from '../axiosInstance';
import { useSessionWrapper } from '@/context/SessionWrapper';
import { useMemo } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

export const useClientApi = () => {
  // Use the wrapper hook with required:true
  const { session, status, update } = useSessionWrapper();

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => {
    let val = {};

    const token = session?.backendTokens?.accessToken;

    if (status === 'authenticated' && token) {
      // check if the token is expired
      try {
        const api = createAxiosInstance(token as string);
        val = { api, session, update };
      } catch (error: any) {
        console.log(error);
        if (error.status === 401) {
          signOut();
        }
        throw error;
      }
    } else {
      val = { api: null, session: null, update };
    }

    return val;
  }, [session, status, update]) as {
    api: null | AxiosInstance;
    session: Session | null;
    update: () => Promise<Session | null>;
  };

  return result;
};

export default useClientApi;
