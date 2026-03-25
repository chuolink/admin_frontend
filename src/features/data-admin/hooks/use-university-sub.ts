import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type UniversityExpensesList = components['schemas']['UniversityExpensesList'];
type UniversityExpensesDetail =
  components['schemas']['UniversityExpensesDetail'];
type UniversityExpensesDetailRequest =
  components['schemas']['UniversityExpensesDetailRequest'];
type UniversityPictureList = components['schemas']['UniversityPictureList'];
type UniversityPictureDetail = components['schemas']['UniversityPictureDetail'];
type UniversityPictureDetailRequest =
  components['schemas']['UniversityPictureDetailRequest'];
type UniversityVideoList = components['schemas']['UniversityVideoList'];
type UniversityVideoDetail = components['schemas']['UniversityVideoDetail'];
type UniversityVideoDetailRequest =
  components['schemas']['UniversityVideoDetailRequest'];
type UniversityStudyReasonsList =
  components['schemas']['UniversityStudyReasonsList'];
type UniversityStudyReasonsDetail =
  components['schemas']['UniversityStudyReasonsDetail'];
type UniversityStudyReasonsDetailRequest =
  components['schemas']['UniversityStudyReasonsDetailRequest'];

// Re-export for use in components
export type {
  UniversityExpensesList,
  UniversityExpensesDetail,
  UniversityPictureList,
  UniversityPictureDetail,
  UniversityVideoList,
  UniversityVideoDetail,
  UniversityStudyReasonsList,
  UniversityStudyReasonsDetail
};

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// =============================================================================
// University Expenses
// =============================================================================

export function useUniversityExpenses(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'university-expenses', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/university-expenses/',
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

export function useCreateUniversityExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UniversityExpensesDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/university-expenses/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University expense created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-expenses']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to create university expense')
      );
    }
  });
}

export function useUpdateUniversityExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<UniversityExpensesDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/university-expenses/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University expense updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-expenses']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to update university expense')
      );
    }
  });
}

export function useDeleteUniversityExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/university-expenses/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('University expense deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-expenses']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to delete university expense')
      );
    }
  });
}

// =============================================================================
// University Pictures
// =============================================================================

export function useUniversityPictures(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'university-pictures', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/university-pictures/',
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

export function useCreateUniversityPicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UniversityPictureDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/university-pictures/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University picture created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to create university picture')
      );
    }
  });
}

export function useUpdateUniversityPicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<UniversityPictureDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/university-pictures/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University picture updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to update university picture')
      );
    }
  });
}

export function useDeleteUniversityPicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/university-pictures/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('University picture deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to delete university picture')
      );
    }
  });
}

// =============================================================================
// University Videos
// =============================================================================

export function useUniversityVideos(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'university-videos', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/university-videos/',
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

export function useCreateUniversityVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UniversityVideoDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/university-videos/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University video created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create university video'));
    }
  });
}

export function useUpdateUniversityVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<UniversityVideoDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/university-videos/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('University video updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update university video'));
    }
  });
}

export function useDeleteUniversityVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/university-videos/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('University video deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete university video'));
    }
  });
}

// =============================================================================
// University Study Reasons
// =============================================================================

export function useUniversityStudyReasons(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'university-study-reasons', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/university-study-reasons/',
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

export function useCreateUniversityStudyReason() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UniversityStudyReasonsDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/university-study-reasons/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Study reason created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-study-reasons']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create study reason'));
    }
  });
}

export function useUpdateUniversityStudyReason() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<UniversityStudyReasonsDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/university-study-reasons/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Study reason updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-study-reasons']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update study reason'));
    }
  });
}

export function useDeleteUniversityStudyReason() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/university-study-reasons/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Study reason deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'university-study-reasons']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete study reason'));
    }
  });
}
