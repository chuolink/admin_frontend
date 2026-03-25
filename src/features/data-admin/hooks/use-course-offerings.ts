import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type CourseUniversityList = components['schemas']['CourseUniversityList'];
type CourseUniversityDetail = components['schemas']['CourseUniversityDetail'];
type CourseUniversityDetailRequest =
  components['schemas']['CourseUniversityDetailRequest'];
type CourseRequirementsNested =
  components['schemas']['CourseRequirementsNested'];
type CourseRequirementsNestedRequest =
  components['schemas']['CourseRequirementsNestedRequest'];
type CourseUniversityExpenses =
  components['schemas']['CourseUniversityExpenses'];
type CourseUniversityExpensesNestedRequest =
  components['schemas']['CourseUniversityExpensesNestedRequest'];

// Re-export for use in components
export type {
  CourseUniversityList,
  CourseUniversityDetail,
  CourseRequirementsNested,
  CourseUniversityExpenses
};

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// =============================================================================
// Course Offerings
// =============================================================================

export function useCourseOfferings(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'course-offerings', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-offerings/',
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

export function useCourseOffering(id: string | null) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'course-offerings', id],
    queryFn: async () => {
      if (!api || !id) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-offerings/{id}/',
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

export function useCreateCourseOffering() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CourseUniversityDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-offerings/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course offering created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course offering'));
    }
  });
}

export function useUpdateCourseOffering() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseUniversityDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-offerings/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: (_data, variables) => {
      toast.success('Course offering updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings']
      });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings', variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course offering'));
    }
  });
}

export function useDeleteCourseOffering() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-offerings/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course offering deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course offering'));
    }
  });
}

// =============================================================================
// Course Requirements
// =============================================================================

export function useCourseRequirements(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'course-requirements', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-requirements/',
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

export function useCreateCourseRequirements() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CourseRequirementsNestedRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-requirements/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course requirements saved successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-requirements']
      });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to save course requirements'));
    }
  });
}

export function useUpdateCourseRequirements() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseRequirementsNestedRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-requirements/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course requirements updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-requirements']
      });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offerings']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to update course requirements')
      );
    }
  });
}

// =============================================================================
// Course Offering Expenses
// =============================================================================

export function useCourseOfferingExpenses(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'course-offering-expenses', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-offering-expenses/',
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

export function useCreateCourseOfferingExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CourseUniversityExpensesNestedRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-offering-expenses/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course offering expense created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offering-expenses']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to create course offering expense')
      );
    }
  });
}

export function useUpdateCourseOfferingExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseUniversityExpensesNestedRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-offering-expenses/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course offering expense updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offering-expenses']
      });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to update course offering expense')
      );
    }
  });
}

export function useDeleteCourseOfferingExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-offering-expenses/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course offering expense deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-offering-expenses']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, 'Failed to delete course offering expense')
      );
    }
  });
}
