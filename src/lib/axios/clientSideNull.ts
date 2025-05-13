import { AxiosInstance } from 'axios';
import createAxiosInstance from '../axiosInstance';
import { useSessionWrapper } from '@/context/SessionWrapper';
import { useMemo } from 'react';
import { Session } from 'next-auth';

export const useClientApi = () => {
  // Use the wrapper hook instead of direct useSession
  const { session, status } = useSessionWrapper();

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => {
    let val = {};

    const token = session?.backendTokens?.accessToken;
    // const expiresAt = (session?.backendTokens.accessExpiresAt ||0) * 1000;
    // const currentTime = Date.now();
    // const timeDiff = (expiresAt - currentTime)/(60*1000);
    // console.log(timeDiff, session?.expires);

    if (status === 'authenticated' && token) {
      // check if the token is expired
      const api = createAxiosInstance(token as string);
      val = { api, session };
    } else {
      val = { api: null, session: null };
    }

    return val;
  }, [session, status]) as {
    api: null | AxiosInstance;
    session: Session | null;
  };

  return result;
};

export default useClientApi;
