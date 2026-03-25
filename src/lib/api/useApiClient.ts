/**
 * React hook that provides a typed openapi-fetch client.
 *
 * Usage in components/hooks:
 *   const api = useApiClient();
 *   const { data } = useQuery({
 *     queryKey: ['countries'],
 *     queryFn: () => api.GET('/api/v1/data-admin/countries/'),
 *     enabled: !!api,
 *   });
 *
 * The returned data is fully typed from schema.d.ts — no manual types needed.
 */
import { useMemo } from 'react';
import { useSessionWrapper } from '@/context/SessionWrapper';
import { createApiClient } from './client';

export function useApiClient() {
  const { session, status } = useSessionWrapper();

  const client = useMemo(() => {
    const token = session?.backendTokens?.accessToken;
    if (status === 'authenticated' && token) {
      return createApiClient(token);
    }
    return null;
  }, [session, status]);

  return client;
}
