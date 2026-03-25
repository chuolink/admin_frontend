import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type CourseList = components['schemas']['CourseList'];
type CourseDetail = components['schemas']['CourseDetail'];
type CourseDetailRequest = components['schemas']['CourseDetailRequest'];
type DisciplineList = components['schemas']['DisciplineList'];
type DisciplineDetail = components['schemas']['DisciplineDetail'];
type DisciplineDetailRequest = components['schemas']['DisciplineDetailRequest'];

// Re-export for use in components
export type { CourseList, CourseDetail, DisciplineList, DisciplineDetail };

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// =============================================================================
// Courses
// =============================================================================

export function useCourses(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'courses', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET('/api/v1/data-admin/courses/', {
        params: { query: params as any }
      });
      if (error) throw error;
      return data!;
    },
    enabled: !!api
  });
}

export function useCourse(id: string | null) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'courses', id],
    queryFn: async () => {
      if (!api || !id) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/courses/{id}/',
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

export function useCreateCourse() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CourseDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST('/api/v1/data-admin/courses/', {
        body
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course'));
    }
  });
}

export function useUpdateCourse() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/courses/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: (_data, variables) => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'courses'] });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'courses', variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course'));
    }
  });
}

export function useDeleteCourse() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE('/api/v1/data-admin/courses/{id}/', {
        params: { path: { id } }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course'));
    }
  });
}

// =============================================================================
// Disciplines
// =============================================================================

export function useDisciplines(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'disciplines', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET('/api/v1/data-admin/disciplines/', {
        params: { query: params as any }
      });
      if (error) throw error;
      return data!;
    },
    enabled: !!api
  });
}

export function useDiscipline(id: string | null) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'disciplines', id],
    queryFn: async () => {
      if (!api || !id) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/disciplines/{id}/',
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

export function useCreateDiscipline() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: DisciplineDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/disciplines/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Discipline created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'disciplines']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create discipline'));
    }
  });
}

export function useUpdateDiscipline() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<DisciplineDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/disciplines/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: (_data, variables) => {
      toast.success('Discipline updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'disciplines']
      });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'disciplines', variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update discipline'));
    }
  });
}

export function useDeleteDiscipline() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/disciplines/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Discipline deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'disciplines']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete discipline'));
    }
  });
}
