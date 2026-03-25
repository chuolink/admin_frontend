import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type UniversityList = components['schemas']['UniversityList'];
type UniversityDetail = components['schemas']['UniversityDetail'];
type UniversityDetailRequest = components['schemas']['UniversityDetailRequest'];

// Re-export for use in components
export type { UniversityList, UniversityDetail, UniversityDetailRequest };

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// ─── List ───────────────────────────────────────────────────────────────────

export function useUniversities(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'universities', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/universities/',
        {
          params: { query: params as any }
        }
      );
      if (error) throw error;
      return data!;
    },
    enabled: !!api
  });
}

// ─── Detail ─────────────────────────────────────────────────────────────────

export function useUniversity(id: string | null) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'universities', id],
    queryFn: async () => {
      if (!api || !id) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/universities/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
      return data!;
    },
    enabled: !!api && !!id
  });
}

// ─── Create ─────────────────────────────────────────────────────────────────

export function useCreateUniversity() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UniversityDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/universities/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'universities']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create university'));
    }
  });
}

// ─── Update ─────────────────────────────────────────────────────────────────

export function useUpdateUniversity() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<UniversityDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/universities/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: (_data, variables) => {
      toast.success('University updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'universities']
      });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'universities', variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update university'));
    }
  });
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteUniversity() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/universities/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('University deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'universities']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete university'));
    }
  });
}
