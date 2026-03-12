'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserSearch,
  UserPlus,
  TrendingUp,
  Clock,
  Phone,
  CalendarPlus
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
  type Lead,
  type LeadsResponse,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS
} from '@/features/leads/types';
import { format } from 'date-fns';

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  CONSULTATION_SCHEDULED: 'outline',
  CONSULTATION_DONE: 'outline',
  CONVERTED: 'default',
  LOST: 'destructive'
};

export default function LeadsPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/leads/');
      return response.data;
    },
    enabled: !!api
  });

  const leads = data?.results ?? [];
  const totalLeads = data?.count ?? 0;
  const newLeads = leads.filter((l) => l.status === 'NEW').length;
  const convertedLeads = leads.filter((l) => l.status === 'CONVERTED').length;
  const pendingFollowUp = leads.filter(
    (l) => l.follow_up_date && new Date(l.follow_up_date) <= new Date()
  ).length;

  const sourceLabel = (val: string) =>
    LEAD_SOURCE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const statusLabel = (val: string) =>
    LEAD_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Leads</h1>
            <p className='text-muted-foreground'>
              Track and manage prospective student leads
            </p>
          </div>
          <Button>
            <UserPlus className='mr-2 h-4 w-4' />
            Add Lead
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Leads</CardTitle>
              <UserSearch className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalLeads}</div>
              <p className='text-muted-foreground text-xs'>All time leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>New Leads</CardTitle>
              <UserPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{newLeads}</div>
              <p className='text-muted-foreground text-xs'>Awaiting contact</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Converted</CardTitle>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{convertedLeads}</div>
              <p className='text-muted-foreground text-xs'>Became students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Follow-up
              </CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pendingFollowUp}</div>
              <p className='text-muted-foreground text-xs'>Overdue actions</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center'>
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No leads yet. Add your first lead to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className='font-medium'>
                        {lead.student_name}
                      </TableCell>
                      <TableCell>{lead.parent_name}</TableCell>
                      <TableCell>{lead.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {sourceLabel(lead.source)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[lead.status] ?? 'secondary'}
                        >
                          {statusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.follow_up_date
                          ? format(new Date(lead.follow_up_date), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button variant='ghost' size='icon' title='Log Call'>
                            <Phone className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            title='Schedule Consultation'
                          >
                            <CalendarPlus className='h-4 w-4' />
                          </Button>
                        </div>
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
