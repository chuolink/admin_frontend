import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverApi } from '@/lib/axios/serverSide';
import { useTransactionsStore } from '@/stores/use-transactions-store';
import {
  Transaction,
  TransactionFilters,
  TransactionStats,
  TransactionResponse
} from '@/types';

export function useTransactions(filters: TransactionFilters = {}) {
  const queryClient = useQueryClient();
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions
  );

  const { data, isLoading } = useQuery<TransactionResponse>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { api } = await serverApi();
      const response = await api.get('/api/v1/admin/transactions/', {
        params: filters
      });
      setTransactions(response.data.results);
      return response.data;
    }
  });

  const { data: stats } = useQuery<TransactionStats>({
    queryKey: ['transactions-stats', filters],
    queryFn: async () => {
      const { api } = await serverApi();
      const response = await api.get('/api/v1/admin/transactions/stats/', {
        params: filters
      });
      return response.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { api } = await serverApi();
      return api.post(`/api/v1/admin/transactions/${transactionId}/approve/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { api } = await serverApi();
      return api.post(`/api/v1/admin/transactions/${transactionId}/reject/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Partial<Transaction>;
    }) => {
      const { api } = await serverApi();
      return api.patch(`/api/v1/admin/transactions/${id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { api } = await serverApi();
      return api.delete(`/api/v1/admin/transactions/${transactionId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
    }
  });

  return {
    transactions: data?.results || [],
    pagination: {
      total: data?.count || 0,
      page: data?.page || 1,
      limit: data?.limit || 10,
      totalPages: data?.total_pages || 1
    },
    stats,
    isLoading,
    approveTransaction: approveMutation.mutate,
    rejectTransaction: rejectMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
