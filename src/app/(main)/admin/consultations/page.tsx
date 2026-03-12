'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  type ConsultationsResponse,
  CONSULTATION_TYPE_OPTIONS,
  CONSULTATION_STATUS_OPTIONS
} from '@/features/consultations/types';
import { format } from 'date-fns';

export default function ConsultationsPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<ConsultationsResponse>({
    queryKey: ['consultations'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/consultations/');
      return response.data;
    },
    enabled: !!api
  });

  const items = data?.results ?? [];
  const total = data?.count ?? 0;
  const scheduled = items.filter((c) => c.status === 'SCHEDULED').length;
  const completed = items.filter((c) => c.status === 'COMPLETED').length;
  const noShows = items.filter((c) => c.status === 'NO_SHOW').length;

  const typeLabel = (val: string) =>
    CONSULTATION_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const statusLabel = (val: string) =>
    CONSULTATION_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    SCHEDULED: 'outline',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    NO_SHOW: 'destructive'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Consultations</h1>
            <p className='text-muted-foreground'>
              Schedule and track student consultations
            </p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Schedule Consultation
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <CalendarCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>All consultations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
              <CalendarPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{scheduled}</div>
              <p className='text-muted-foreground text-xs'>Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{completed}</div>
              <p className='text-muted-foreground text-xs'>Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>No Shows</CardTitle>
              <XCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{noShows}</div>
              <p className='text-muted-foreground text-xs'>Missed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center'>
                      Loading consultations...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No consultations yet. Schedule your first consultation.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(
                          new Date(item.scheduled_at),
                          'MMM d, yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {item.consultant_name ?? item.consultant}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {typeLabel(item.consultation_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[item.status] ?? 'secondary'}
                        >
                          {statusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.outcome ?? '—'}</TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {item.summary || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
