'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Payment } from '@/types/payment';
import { ArrowLeft, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PaymentViewClient({ params }: PageProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch payment details
  const {
    data: payment,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payment', params.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/payments/${params.id}/`);
      return response.data as Payment;
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/admin/payments/${params.id}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', params.id] });
      toast.success('Payment status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update payment status');
    }
  });

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading payment details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !payment) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading payment details. Please try again later.
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
              <h1 className='text-3xl font-bold'>Payment Details</h1>
              <p className='text-muted-foreground'>
                View and manage payment information
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => router.push(`/admin/payments/${params.id}/edit`)}
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Button>
            {payment.status === 'pending' && (
              <>
                <Button
                  variant='outline'
                  className='text-green-600 hover:text-green-700'
                  onClick={() => updateStatusMutation.mutate('SUCCESS')}
                >
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Approve
                </Button>
                <Button
                  variant='outline'
                  className='text-red-600 hover:text-red-700'
                  onClick={() => updateStatusMutation.mutate('FAILED')}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    ID
                  </p>
                  <p>{payment.id}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Status
                  </p>
                  <p className='capitalize'>{payment.status}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Amount
                  </p>
                  <p>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'TZS'
                    }).format(payment.amount)}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Mode
                  </p>
                  <p className='capitalize'>{payment.mode}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Created At
                  </p>
                  <p>
                    {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Updated At
                  </p>
                  <p>
                    {format(new Date(payment.updated_at), 'MMM dd, yyyy HH:mm')}
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
                    {payment.student?.name ||
                      `${payment.user.first_name} ${payment.user.last_name}`}
                  </div>
                  <div>
                    <span className='font-medium'>Email:</span>{' '}
                    {payment.student?.email || payment.user.email}
                  </div>
                  {payment.student?.phone && (
                    <div>
                      <span className='font-medium'>Phone:</span>{' '}
                      {payment.student.phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {payment.description && (
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{payment.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
