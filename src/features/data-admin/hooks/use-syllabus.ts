import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type CourseYearList = components['schemas']['CourseYearList'];
type CourseYearDetail = components['schemas']['CourseYearDetail'];
type CourseYearDetailRequest = components['schemas']['CourseYearDetailRequest'];
type SemisterList = components['schemas']['SemisterList'];
type SemisterDetail = components['schemas']['SemisterDetail'];
type SemisterDetailRequest = components['schemas']['SemisterDetailRequest'];
type CourseSemisterList = components['schemas']['CourseSemisterList'];
type CourseSemisterDetail = components['schemas']['CourseSemisterDetail'];
type CourseSemisterDetailRequest =
  components['schemas']['CourseSemisterDetailRequest'];
type CourseModuleList = components['schemas']['CourseModuleList'];
type CourseModuleDetail = components['schemas']['CourseModuleDetail'];
type CourseModuleDetailRequest =
  components['schemas']['CourseModuleDetailRequest'];

// Re-export for use in components
export type {
  CourseYearList,
  CourseYearDetail,
  SemisterList,
  SemisterDetail,
  CourseSemisterList,
  CourseSemisterDetail,
  CourseModuleList,
  CourseModuleDetail
};

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// =============================================================================
// Course Years
// =============================================================================

export function useCourseYears(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-years', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-years/',
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

export function useCreateCourseYear() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CourseYearDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-years/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course year created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-years']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course year'));
    }
  });
}

export function useUpdateCourseYear() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseYearDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-years/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course year updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-years']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course year'));
    }
  });
}

export function useDeleteCourseYear() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-years/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course year deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-years']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course year'));
    }
  });
}

// =============================================================================
// Semesters
// =============================================================================

export function useSemesters(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'semesters', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET('/api/v1/data-admin/semesters/', {
        params: { query: params as any }
      });
      if (error) throw error;
      return data!;
    },
    enabled: !!api
  });
}

export function useCreateSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SemisterDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST('/api/v1/data-admin/semesters/', {
        body
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Semester created successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'semesters'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create semester'));
    }
  });
}

export function useUpdateSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<SemisterDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/semesters/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Semester updated successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'semesters'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update semester'));
    }
  });
}

export function useDeleteSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE('/api/v1/data-admin/semesters/{id}/', {
        params: { path: { id } }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Semester deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'semesters'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete semester'));
    }
  });
}

// =============================================================================
// Course Semesters
// =============================================================================

export function useCourseSemesters(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-semesters', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-semesters/',
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

export function useCreateCourseSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CourseSemisterDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-semesters/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course semester created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-semesters']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course semester'));
    }
  });
}

export function useUpdateCourseSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseSemisterDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-semesters/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course semester updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-semesters']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course semester'));
    }
  });
}

export function useDeleteCourseSemester() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-semesters/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course semester deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-semesters']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course semester'));
    }
  });
}

// =============================================================================
// Course Modules
// =============================================================================

export function useCourseModules(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-modules', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-modules/',
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

export function useCreateCourseModule() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CourseModuleDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-modules/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course module created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-modules']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course module'));
    }
  });
}

export function useUpdateCourseModule() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseModuleDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-modules/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course module updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-modules']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course module'));
    }
  });
}

export function useDeleteCourseModule() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-modules/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course module deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-modules']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course module'));
    }
  });
}
