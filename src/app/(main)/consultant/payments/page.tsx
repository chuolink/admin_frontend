'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { ConsultantStats } from '@/types/consultant';
import { useStateStore } from '@/stores/useStateStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Payment {
  id: string;
  application: string;
  app_id: string;
  gepg: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  created_at: string;
  updated_at: string;
}

interface PaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

export default function PaymentsPage() {
  const { api } = useClientApi();
  const { consultant } = useStateStore();
  const [status, setStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      toast.success('Payment ID copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy Payment ID');
    }
  };

  // Format currency to TZS
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const { data: stats, isLoading } = useQuery<ConsultantStats>({
    queryKey: ['consultant-stats', consultant?.id],
    queryFn: async () => {
      if (!api || !consultant?.id)
        throw new Error('API not initialized or consultant not found');
      const response = await api.get(
        `/consultant/overview/${consultant.id}/stats/`
      );
      return response.data;
    },
    enabled: !!consultant?.id
  });

  const { data: payments } = useQuery<PaymentResponse>({
    queryKey: ['consultant-payments', status, dateRange],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (dateRange.start) params.append('created_at', dateRange.start);
      if (dateRange.end) params.append('updated_at', dateRange.end);

      const response = await api.get(
        `/consultant/application/payment/?${params.toString()}`
      );
      return response.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <p>Loading statistics...</p>
      </div>
    );
  }

  // Calculate trends (you can replace these with actual trend calculations)
  const totalTrend = (stats?.total_earnings ?? 0) > 0 ? '+12.5%' : '0%';
  const pendingTrend = (stats?.pending_applications ?? 0) > 0 ? '+8.3%' : '0%';
  const successTrend =
    (stats?.completed_applications ?? 0) > 0 ? '+15.7%' : '0%';
  const failedTrend = (stats?.rejected_applications ?? 0) > 0 ? '-5.2%' : '0%';

  return (
    <div className='space-y-6 p-6'>
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {formatCurrency(stats?.total_earnings || 0)}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <TrendingUp className='mr-1 h-4 w-4' />
                {totalTrend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Total earnings received <Banknote className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              All earnings in your account
            </div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Pending Applications</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats?.pending_applications || 0}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <AlertCircle className='mr-1 h-4 w-4' />
                {pendingTrend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Awaiting review <AlertCircle className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Applications to be processed
            </div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Completed Applications</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats?.completed_applications || 0}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <CheckCircle className='mr-1 h-4 w-4' />
                {successTrend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Successfully completed <CheckCircle className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Applications approved by admin
            </div>
          </CardFooter>
        </Card>

        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Rejected Applications</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats?.rejected_applications || 0}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <XCircle className='mr-1 h-4 w-4' />
                {failedTrend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Failed applications <XCircle className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Applications that were rejected
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application GEPG Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-wrap gap-4'>
            <Select value={status || undefined} onValueChange={setStatus}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='success'>Success</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type='date'
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className='w-[180px]'
            />
            <Input
              type='date'
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className='w-[180px]'
            />
          </div>

          {isLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[200px]'>Payment ID</TableHead>
                    <TableHead>Application ID</TableHead>
                    <TableHead>GEPG Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.results.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          <span className='max-w-[150px] truncate'>
                            {payment.id}
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => copyToClipboard(payment.id)}
                          >
                            {copiedId === payment.id ? (
                              <Check className='h-4 w-4 text-green-500' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{payment.app_id}</TableCell>
                      <TableCell>{payment.gepg}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        {format(
                          new Date(payment.created_at),
                          'MMM d, yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(payment.updated_at),
                          'MMM d, yyyy HH:mm'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
