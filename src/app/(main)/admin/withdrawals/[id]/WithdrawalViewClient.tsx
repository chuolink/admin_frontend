'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Withdrawal } from '@/types/withdrawal';
import { ArrowLeft, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WithdrawalViewClientProps {
  params: {
    id: string;
  };
}

export default function WithdrawalViewClient({
  params
}: WithdrawalViewClientProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch withdrawal details
  const {
    data: withdrawal,
    isLoading,
    error
  } = useQuery({
    queryKey: ['withdrawal', params.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/withdrawals/${params.id}/`);
      return response.data as Withdrawal;
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/admin/withdrawals/${params.id}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', params.id] });
      toast.success('Withdrawal status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update withdrawal status');
    }
  });

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading withdrawal details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !withdrawal) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading withdrawal details. Please try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Withdrawal Details</h1>
              <p className='text-muted-foreground'>
                View and manage withdrawal information
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() =>
                router.push(`/admin/withdrawals/${params.id}/edit`)
              }
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Button>
            {withdrawal.status === 'pending' && (
              <>
                <Button
                  variant='outline'
                  className='text-green-600 hover:text-green-700'
                  onClick={() => updateStatusMutation.mutate('success')}
                >
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Approve
                </Button>
                <Button
                  variant='outline'
                  className='text-red-600 hover:text-red-700'
                  onClick={() => updateStatusMutation.mutate('failed')}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Withdrawal Details */}
        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    ID
                  </p>
                  <p>{withdrawal.id}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Status
                  </p>
                  <p className='capitalize'>{withdrawal.status}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Amount
                  </p>
                  <p>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(withdrawal.amount)}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Type
                  </p>
                  <p className='capitalize'>{withdrawal.type}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Created At
                  </p>
                  <p>
                    {format(
                      new Date(withdrawal.created_at),
                      'MMM dd, yyyy HH:mm'
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Updated At
                  </p>
                  <p>
                    {format(
                      new Date(withdrawal.updated_at),
                      'MMM dd, yyyy HH:mm'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>User Information</h3>
                <div className='grid gap-2'>
                  <div>
                    <span className='font-medium'>Name:</span>{' '}
                    {withdrawal.student?.name ||
                      `${withdrawal.user.first_name} ${withdrawal.user.last_name}`}
                  </div>
                  <div>
                    <span className='font-medium'>Email:</span>{' '}
                    {withdrawal.student?.email || withdrawal.user.email}
                  </div>
                  {withdrawal.student?.phone && (
                    <div>
                      <span className='font-medium'>Phone:</span>{' '}
                      {withdrawal.student.phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>
                {withdrawal.type === 'mobile'
                  ? 'Mobile Details'
                  : 'Bank Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {withdrawal.type === 'mobile' ? (
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Phone Number
                    </p>
                    <p>{withdrawal.mno || 'N/A'}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Bank
                      </p>
                      <p>{withdrawal.bank_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Account Name
                      </p>
                      <p>{withdrawal.bank_account_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Account Number
                      </p>
                      <p>{withdrawal.bank_account_number || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Receipt
                  </p>
                  <p>{withdrawal.receipt || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
