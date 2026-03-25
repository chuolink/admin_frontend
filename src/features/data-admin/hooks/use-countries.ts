import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/useApiClient';
import type { components } from '@/lib/api/schema';

// Types derived directly from the generated schema — no manual types.ts needed
type CountryList = components['schemas']['CountryList'];
type CountryDetail = components['schemas']['CountryDetail'];
type CountryDetailRequest = components['schemas']['CountryDetailRequest'];
type CountryExpenseList = components['schemas']['CountryExpenseList'];
type CountryExpenseDetail = components['schemas']['CountryExpenseDetail'];
type CountryExpenseDetailRequest =
  components['schemas']['CountryExpenseDetailRequest'];
type CountryFAQList = components['schemas']['CountryFAQList'];
type CountryFAQDetail = components['schemas']['CountryFAQDetail'];
type CountryFAQDetailRequest = components['schemas']['CountryFAQDetailRequest'];

// Re-export for use in components
export type {
  CountryList,
  CountryDetail,
  CountryExpenseDetail,
  CountryFAQDetail
};

// Helper to extract error message from openapi-fetch response
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

// ─── Countries ─────────────────────────────────────────────────────────────

export function useCountries(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'countries', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET('/api/v1/data-admin/countries/', {
        params: { query: params as any }
      });
      if (error) throw error;
      return data!;
    },
    enabled: !!api
  });
}

export function useCountry(id: string | null) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'countries', id],
    queryFn: async () => {
      if (!api || !id) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/countries/{id}/',
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

export function useCreateCountry() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CountryDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST('/api/v1/data-admin/countries/', {
        body
      });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Country created successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'countries'] });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create country'));
    }
  });
}

export function useUpdateCountry() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CountryDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/countries/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: (_data, variables) => {
      toast.success('Country updated successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'countries'] });
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'countries', variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update country'));
    }
  });
}

export function useDeleteCountry() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE('/api/v1/data-admin/countries/{id}/', {
        params: { path: { id } }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Country deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'countries'] });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete country'));
    }
  });
}

// ─── Country Expenses ───────────────────────────────────────────────────────

export function useCountryExpenses(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'country-expenses', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/country-expenses/',
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

export function useCreateCountryExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CountryExpenseDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/country-expenses/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Expense created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-expenses']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create expense'));
    }
  });
}

export function useUpdateCountryExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CountryExpenseDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/country-expenses/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('Expense updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-expenses']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update expense'));
    }
  });
}

export function useDeleteCountryExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/country-expenses/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-expenses']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete expense'));
    }
  });
}

// ─── Country FAQs ───────────────────────────────────────────────────────────

export function useCountryFAQs(params?: Record<string, string>) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['data-admin', 'country-faqs', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.GET(
        '/api/v1/data-admin/country-faqs/',
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

export function useCreateCountryFAQ() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CountryFAQDetailRequest) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.POST(
        '/api/v1/data-admin/country-faqs/',
        {
          body
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('FAQ created successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-faqs']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create FAQ'));
    }
  });
}

export function useUpdateCountryFAQ() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: body
    }: {
      id: string;
      data: Partial<CountryFAQDetailRequest>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { data, error } = await api.PATCH(
        '/api/v1/data-admin/country-faqs/{id}/',
        {
          params: { path: { id } },
          body: body as any
        }
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      toast.success('FAQ updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-faqs']
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update FAQ'));
    }
  });
}

export function useDeleteCountryFAQ() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      const { error } = await api.DELETE(
        '/api/v1/data-admin/country-faqs/{id}/',
        {
          params: { path: { id } }
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('FAQ deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['data-admin', 'country-faqs']
      });
      queryClient.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to delete FAQ'));
    }
  });
}
