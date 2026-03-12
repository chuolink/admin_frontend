'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
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
  type SalesCallsResponse,
  CALL_PURPOSE_OPTIONS,
  CALL_OUTCOME_OPTIONS
} from '@/features/sales-calls/types';
import { format } from 'date-fns';

export default function ConsultantSalesCallsPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<SalesCallsResponse>({
    queryKey: ['consultant-sales-calls'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/sales-calls/');
      return response.data;
    },
    enabled: !!api
  });

  const calls = data?.results ?? [];
  const totalCalls = data?.count ?? 0;
  const outbound = calls.filter((c) => c.call_type === 'OUTBOUND').length;
  const answered = calls.filter((c) => c.outcome === 'ANSWERED').length;
  const pendingFollowUp = calls.filter(
    (c) => c.follow_up_required && c.follow_up_date
  ).length;

  const purposeLabel = (val: string) =>
    CALL_PURPOSE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const outcomeLabel = (val: string) =>
    CALL_OUTCOME_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const outcomeVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    ANSWERED: 'default',
    NO_ANSWER: 'destructive',
    BUSY: 'secondary',
    CALLBACK_REQUESTED: 'outline',
    VOICEMAIL: 'secondary'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>My Calls</h1>
            <p className='text-muted-foreground'>Your sales call activity</p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Log Call
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>My Calls</CardTitle>
              <Phone className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalCalls}</div>
              <p className='text-muted-foreground text-xs'>All your calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Outbound</CardTitle>
              <PhoneOutgoing className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{outbound}</div>
              <p className='text-muted-foreground text-xs'>Calls made</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Answered</CardTitle>
              <PhoneIncoming className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{answered}</div>
              <p className='text-muted-foreground text-xs'>Connected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Follow-ups</CardTitle>
              <PhoneMissed className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pendingFollowUp}</div>
              <p className='text-muted-foreground text-xs'>Callbacks pending</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center'>
                      Loading calls...
                    </TableCell>
                  </TableRow>
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No calls logged yet. Start tracking your calls.
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        {format(new Date(call.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {call.call_type === 'OUTBOUND'
                            ? 'Outbound'
                            : 'Inbound'}
                        </Badge>
                      </TableCell>
                      <TableCell>{purposeLabel(call.purpose)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={outcomeVariant[call.outcome] ?? 'secondary'}
                        >
                          {outcomeLabel(call.outcome)}
                        </Badge>
                      </TableCell>
                      <TableCell>{call.duration_minutes} min</TableCell>
                      <TableCell>
                        {call.follow_up_date
                          ? format(new Date(call.follow_up_date), 'MMM d')
                          : '—'}
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
