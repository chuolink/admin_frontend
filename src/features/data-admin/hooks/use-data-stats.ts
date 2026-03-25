import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import type { DataStats } from '../types';

export function useDataStats() {
  const api = useApiClient();

  return useQuery<DataStats>({
    queryKey: ['data-admin', 'stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET('/api/v1/data-admin/stats/');
      if (error) throw error;
      // The OpenAPI schema declares 200 with no response body,
      // but the endpoint actually returns JSON stats. Cast accordingly.
      return data as unknown as DataStats;
    },
    enabled: !!api
  });
}
