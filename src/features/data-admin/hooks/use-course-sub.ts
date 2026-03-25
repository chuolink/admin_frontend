import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema
type CourseTrendList = components['schemas']['CourseTrendList'];
type CourseTrendDetail = components['schemas']['CourseTrendDetail'];
type CourseTrendDetailRequest =
  components['schemas']['CourseTrendDetailRequest'];
type CoursePictureList = components['schemas']['CoursePictureList'];
type CoursePictureDetail = components['schemas']['CoursePictureDetail'];
type CoursePictureDetailRequest =
  components['schemas']['CoursePictureDetailRequest'];
type CourseVideoList = components['schemas']['CourseVideoList'];
type CourseVideoDetail = components['schemas']['CourseVideoDetail'];
type CourseVideoDetailRequest =
  components['schemas']['CourseVideoDetailRequest'];

// Re-export for use in components
export type {
  CourseTrendList,
  CourseTrendDetail,
  CoursePictureList,
  CoursePictureDetail,
  CourseVideoList,
  CourseVideoDetail
};

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// =============================================================================
// Course Trends
// =============================================================================

export function useCourseTrends(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-trends', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-trends/',
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

export function useCreateCourseTrend() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CourseTrendDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-trends/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course trend created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-trends']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course trend'));
    }
  });
}

export function useUpdateCourseTrend() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string | number;
      data: Partial<CourseTrendDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-trends/{id}/',
        {
          params: { path: { id: Number(id) } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course trend updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-trends']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course trend'));
    }
  });
}

export function useDeleteCourseTrend() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-trends/{id}/',
        {
          params: { path: { id: Number(id) } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course trend deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-trends']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course trend'));
    }
  });
}

// =============================================================================
// Course Pictures
// =============================================================================

export function useCoursePictures(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-pictures', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-pictures/',
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

export function useCreateCoursePicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CoursePictureDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-pictures/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course picture created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course picture'));
    }
  });
}

export function useUpdateCoursePicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CoursePictureDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-pictures/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course picture updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course picture'));
    }
  });
}

export function useDeleteCoursePicture() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-pictures/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course picture deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-pictures']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course picture'));
    }
  });
}

// =============================================================================
// Course Videos
// =============================================================================

export function useCourseVideos(params?: Record<string, string>) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['data-admin', 'course-videos', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/course-videos/',
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

export function useCreateCourseVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CourseVideoDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/course-videos/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course video created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create course video'));
    }
  });
}

export function useUpdateCourseVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CourseVideoDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/course-videos/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Course video updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update course video'));
    }
  });
}

export function useDeleteCourseVideo() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/course-videos/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course video deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'course-videos']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete course video'));
    }
  });
}
