// @ts-nocheck
'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Users,
  Clock,
  UserCheck,
  Star,
  DollarSign,
  HeadphonesIcon,
  Loader2,
  Search,
  Flag,
  MessageCircle,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Ban,
  Power,
  AlertTriangle,
  Wallet,
  ArrowDownToLine,
  Calendar
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StarRating } from '@/features/experts/components/StarRating';
import { SupportChatSheet } from '@/features/experts/components/SupportChatSheet';
import { VerificationBadge } from '@/features/experts/components/VerificationBadge';
import { toast } from 'sonner';

// ---------- Stat Card ----------
function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color
}: {
  title: string;
  value: string | number;
  icon: any;
  loading?: boolean;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='text-muted-foreground h-4 w-4' />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className='h-7 w-20' />
        ) : (
          <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Support Status Badge ----------
function SupportStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return (
    <Badge className={variants[status] || ''}>
      {status?.replace('_', ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200'
  };
  return <Badge className={variants[priority] || ''}>{priority}</Badge>;
}

// ---------- Priority sort weight (urgent first) ----------
const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3
};

// ========== OVERVIEW TAB ==========
function OverviewTab() {
  const { api } = useClientApi();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['expert-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-stats/');
      return res.data;
    },
    enabled: !!api
  });

  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
        <StatCard
          title='Total Experts'
          value={stats?.total_experts ?? 0}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title='Pending Review'
          value={stats?.pending_review ?? 0}
          icon={Clock}
          loading={isLoading}
          color='text-amber-600'
        />
        <StatCard
          title='Active Experts'
          value={stats?.active_experts ?? 0}
          icon={UserCheck}
          loading={isLoading}
          color='text-green-600'
        />
        <StatCard
          title='Avg Rating'
          value={stats?.avg_rating ? Number(stats.avg_rating).toFixed(1) : '—'}
          icon={Star}
          loading={isLoading}
        />
        <StatCard
          title='Total Earnings'
          value={
            stats?.total_earnings
              ? formatCurrency(stats.total_earnings)
              : formatCurrency(0)
          }
          icon={DollarSign}
          loading={isLoading}
        />
        <StatCard
          title='Open Support'
          value={stats?.open_support_tickets ?? 0}
          icon={HeadphonesIcon}
          loading={isLoading}
          color='text-blue-600'
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-10 w-full' />
              ))}
            </div>
          ) : stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className='space-y-3'>
              {stats.recent_activity.map((activity: any, i: number) => (
                <div
                  key={i}
                  className='flex items-center gap-3 rounded-lg border p-3'
                >
                  <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                    {activity.type === 'verification' ? (
                      <UserCheck className='h-4 w-4' />
                    ) : (
                      <MessageCircle className='h-4 w-4' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      {activity.description || activity.title}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {activity.created_at
                        ? formatDate(activity.created_at)
                        : ''}
                    </p>
                  </div>
                  {activity.status && (
                    <VerificationBadge status={activity.status} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== PENDING REVIEWS TAB ==========
function PendingReviewsTab() {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [verifyNotes, setVerifyNotes] = useState('');
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['experts', 'pending'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/experts/', {
        params: { verification_status: 'pending' }
      });
      return res.data;
    },
    enabled: !!api
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      expertId,
      action,
      notes
    }: {
      expertId: string;
      action: string;
      notes: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/experts/${expertId}/verify/`, { action, notes });
    },
    onSuccess: () => {
      toast.success(
        verifyAction === 'approve' ? 'Expert verified' : 'Expert rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: ['expert-stats'] });
      setVerifyDialogOpen(false);
      setVerifyNotes('');
      setSelectedExpertId(null);
    },
    onError: () => {
      toast.error('Failed to update verification status');
    }
  });

  const handleQuickAction = (
    expertId: string,
    action: 'approve' | 'reject'
  ) => {
    setSelectedExpertId(expertId);
    setVerifyAction(action);
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = () => {
    if (!selectedExpertId) return;
    verifyMutation.mutate({
      expertId: selectedExpertId,
      action: verifyAction,
      notes: verifyNotes
    });
  };

  const experts = data?.results || data || [];

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-14 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Credentials</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className='w-10'></TableHead>
                <TableHead className='w-10'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className='text-muted-foreground py-8 text-center'
                  >
                    No pending reviews. All caught up!
                  </TableCell>
                </TableRow>
              ) : (
                experts.map((expert: any) => (
                  <TableRow
                    key={expert.id}
                    className='cursor-pointer'
                    onClick={() => router.push(`/admin/experts/${expert.id}`)}
                  >
                    <TableCell>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={expert.profile_photo} />
                        <AvatarFallback className='bg-muted text-xs font-medium'>
                          {expert.user_name
                            ? expert.user_name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            : '?'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {expert.user_name || '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {expert.user_email || '—'}
                    </TableCell>
                    <TableCell>{expert.job_title || '—'}</TableCell>
                    <TableCell>{expert.institution || '—'}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {expert.credentials_count ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {expert.created_at ? formatDate(expert.created_at) : '—'}
                    </TableCell>
                    <TableCell>
                      {(expert.unread_verification ?? 0) > 0 && (
                        <Badge className='bg-blue-600 text-white'>
                          {expert.unread_verification}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-[180px]'>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/experts/${expert.id}`);
                            }}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAction(expert.id, 'approve');
                            }}
                          >
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAction(expert.id, 'reject');
                            }}
                          >
                            <XCircle className='mr-2 h-4 w-4' />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verify/Reject Confirmation Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === 'approve' ? 'Verify Expert' : 'Reject Expert'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'approve'
                ? 'This will approve the expert and allow them to appear on the platform.'
                : 'This will reject the expert application. You can add notes explaining the reason.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Notes (optional)</label>
              <Textarea
                placeholder={
                  verifyAction === 'approve'
                    ? 'Any notes about the approval...'
                    : 'Reason for rejection...'
                }
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setVerifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={verifyAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleVerifyConfirm}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {verifyAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ========== ALL EXPERTS TAB ==========
function AllExpertsTab() {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');

  // Quick action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'suspend' | 'activate'
  >('approve');
  const [actionExpertId, setActionExpertId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const params: any = {};
  if (search) params.search = search;
  if (statusFilter !== 'all') params.verification_status = statusFilter;
  if (activeFilter !== 'all') params.is_active = activeFilter === 'true';
  if (employmentFilter !== 'all') params.employment_type = employmentFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['experts', 'all', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/experts/', { params });
      return res.data;
    },
    enabled: !!api
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      expertId,
      action,
      notes
    }: {
      expertId: string;
      action: string;
      notes: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/experts/${expertId}/verify/`, { action, notes });
    },
    onSuccess: () => {
      toast.success(
        actionType === 'approve' ? 'Expert verified' : 'Expert rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: ['expert-stats'] });
      setActionDialogOpen(false);
      setActionNotes('');
    },
    onError: () => {
      toast.error('Failed to update verification status');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      expertId,
      is_active
    }: {
      expertId: string;
      is_active: boolean;
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.patch(`/admin/experts/${expertId}/`, { is_active });
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.is_active ? 'Expert activated' : 'Expert suspended'
      );
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: ['expert-stats'] });
      setActionDialogOpen(false);
      setActionNotes('');
    },
    onError: () => {
      toast.error('Failed to update expert status');
    }
  });

  const handleQuickAction = (
    expertId: string,
    type: 'approve' | 'reject' | 'suspend' | 'activate'
  ) => {
    setActionExpertId(expertId);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = () => {
    if (!actionExpertId) return;
    if (actionType === 'approve' || actionType === 'reject') {
      verifyMutation.mutate({
        expertId: actionExpertId,
        action: actionType,
        notes: actionNotes
      });
    } else if (actionType === 'suspend') {
      toggleActiveMutation.mutate({
        expertId: actionExpertId,
        is_active: false
      });
    } else if (actionType === 'activate') {
      toggleActiveMutation.mutate({
        expertId: actionExpertId,
        is_active: true
      });
    }
  };

  const isActionPending =
    verifyMutation.isPending || toggleActiveMutation.isPending;

  const experts = data?.results || data || [];

  const actionDialogConfig: Record<
    string,
    {
      title: string;
      description: string;
      variant: 'default' | 'destructive';
      label: string;
    }
  > = {
    approve: {
      title: 'Verify Expert',
      description:
        'This will approve the expert and allow them to appear on the platform.',
      variant: 'default',
      label: 'Approve'
    },
    reject: {
      title: 'Reject Expert',
      description: 'This will reject the expert application.',
      variant: 'destructive',
      label: 'Reject'
    },
    suspend: {
      title: 'Suspend Expert',
      description:
        'This will deactivate the expert. They will no longer appear on the platform or receive bookings.',
      variant: 'destructive',
      label: 'Suspend'
    },
    activate: {
      title: 'Activate Expert',
      description: 'This will reactivate the expert on the platform.',
      variant: 'default',
      label: 'Activate'
    }
  };

  const config = actionDialogConfig[actionType];

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative max-w-xs flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search by name or email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='verified'>Verified</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Active' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='true'>Active</SelectItem>
            <SelectItem value='false'>Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Employment' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            <SelectItem value='full_time'>Full Time</SelectItem>
            <SelectItem value='part_time'>Part Time</SelectItem>
            <SelectItem value='freelance'>Freelance</SelectItem>
            <SelectItem value='contract'>Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Online</TableHead>
                  <TableHead className='w-10'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No experts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  experts.map((expert: any) => (
                    <TableRow
                      key={expert.id}
                      className='cursor-pointer'
                      onClick={() => router.push(`/admin/experts/${expert.id}`)}
                    >
                      <TableCell>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={expert.profile_photo} />
                          <AvatarFallback className='bg-muted text-xs font-medium'>
                            {expert.user_name
                              ? expert.user_name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {expert.user_name || '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {expert.user_email || '—'}
                      </TableCell>
                      <TableCell>{expert.job_title || '—'}</TableCell>
                      <TableCell>
                        <VerificationBadge
                          status={expert.verification_status || 'pending'}
                        />
                      </TableCell>
                      <TableCell>
                        {expert.avg_rating ? (
                          <StarRating
                            rating={Number(expert.avg_rating)}
                            showValue
                          />
                        ) : (
                          <span className='text-muted-foreground text-sm'>
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          expert.total_earnings ?? expert.earnings ?? 0
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${expert.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                          />
                          <span className='text-muted-foreground text-xs'>
                            {expert.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${expert.is_online ? 'bg-green-500' : 'bg-gray-300'}`}
                          />
                          <span className='text-muted-foreground text-xs'>
                            {expert.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='end'
                            className='w-[180px]'
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/experts/${expert.id}`);
                              }}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {expert.verification_status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAction(expert.id, 'approve');
                                  }}
                                >
                                  <CheckCircle className='mr-2 h-4 w-4' />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-destructive focus:text-destructive'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAction(expert.id, 'reject');
                                  }}
                                >
                                  <XCircle className='mr-2 h-4 w-4' />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {expert.is_active ? (
                              <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(expert.id, 'suspend');
                                }}
                              >
                                <Ban className='mr-2 h-4 w-4' />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(expert.id, 'activate');
                                }}
                              >
                                <Power className='mr-2 h-4 w-4' />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>
          {(actionType === 'approve' || actionType === 'reject') && (
            <div className='space-y-4 py-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Notes (optional)</label>
                <Textarea
                  placeholder={
                    actionType === 'approve'
                      ? 'Any notes about the approval...'
                      : 'Reason for rejection...'
                  }
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={config.variant}
              onClick={handleActionConfirm}
              disabled={isActionPending}
            >
              {isActionPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {config.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== SUPPORT INBOX TAB ==========
function SupportInboxTab() {
  const { api } = useClientApi();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const params: any = { ordering: '-priority,-updated_at' };
  if (statusFilter !== 'all') params.status = statusFilter;
  if (priorityFilter !== 'all') params.priority = priorityFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['support-threads', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-support-threads/', { params });
      return res.data;
    },
    enabled: !!api,
    refetchInterval: 30000 // poll for new threads
  });

  const rawThreads = data?.results || data || [];

  // Client-side sort: urgent/high priority + unread at top
  const threads = [...rawThreads].sort((a: any, b: any) => {
    // Unread threads first
    const aUnread = (a.unread_count ?? 0) > 0 ? 0 : 1;
    const bUnread = (b.unread_count ?? 0) > 0 ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    // Then by priority
    const aPriority = PRIORITY_WEIGHT[a.priority] ?? 99;
    const bPriority = PRIORITY_WEIGHT[b.priority] ?? 99;
    return aPriority - bPriority;
  });

  const unreadTotal = rawThreads.reduce(
    (sum: number, t: any) => sum + (t.unread_count ?? 0),
    0
  );

  const handleOpenThread = (threadId: string) => {
    setSelectedThread(threadId);
    setSheetOpen(true);
  };

  return (
    <div className='space-y-4'>
      {/* Unread summary */}
      {unreadTotal > 0 && (
        <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3'>
          <HeadphonesIcon className='h-4 w-4 text-blue-600' />
          <span className='text-sm font-medium text-blue-800'>
            {unreadTotal} unread message{unreadTotal !== 1 ? 's' : ''} across{' '}
            {rawThreads.filter((t: any) => (t.unread_count ?? 0) > 0).length}{' '}
            thread
            {rawThreads.filter((t: any) => (t.unread_count ?? 0) > 0).length !==
            1
              ? 's'
              : ''}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className='flex items-center gap-3'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='open'>Open</SelectItem>
            <SelectItem value='in_progress'>In Progress</SelectItem>
            <SelectItem value='resolved'>Resolved</SelectItem>
            <SelectItem value='closed'>Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Priorities</SelectItem>
            <SelectItem value='low'>Low</SelectItem>
            <SelectItem value='medium'>Medium</SelectItem>
            <SelectItem value='high'>High</SelectItem>
            <SelectItem value='urgent'>Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Unread</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No support threads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  threads.map((thread: any) => (
                    <TableRow
                      key={thread.id}
                      className={`cursor-pointer ${(thread.unread_count ?? 0) > 0 ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleOpenThread(thread.id)}
                    >
                      <TableCell className='font-medium'>
                        {thread.expert_name ||
                          thread.expert?.user?.first_name ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            (thread.unread_count ?? 0) > 0
                              ? 'font-semibold'
                              : ''
                          }
                        >
                          {thread.subject || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SupportStatusBadge status={thread.status || 'open'} />
                      </TableCell>
                      <TableCell>
                        {thread.priority && (
                          <PriorityBadge priority={thread.priority} />
                        )}
                      </TableCell>
                      <TableCell>
                        {(thread.unread_count ?? 0) > 0 && (
                          <Badge className='bg-blue-600 text-white'>
                            {thread.unread_count}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-[200px] truncate text-sm'>
                        {thread.last_message_preview ||
                          thread.last_message ||
                          '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {thread.created_at
                          ? formatDate(thread.created_at)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SupportChatSheet
        threadId={selectedThread}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

// ========== REVIEWS TAB ==========
function ReviewsTab() {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [badOnly, setBadOnly] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalateReviewId, setEscalateReviewId] = useState<string | null>(null);
  const [escalateNotes, setEscalateNotes] = useState('');

  const params: any = {};
  if (badOnly) {
    params.max_rating = 3;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['expert-reviews', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-reviews/', { params });
      return res.data;
    },
    enabled: !!api
  });

  const escalateMutation = useMutation({
    mutationFn: async ({
      reviewId,
      notes
    }: {
      reviewId: string;
      notes: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/expert-reviews/${reviewId}/escalate/`, { notes });
    },
    onSuccess: () => {
      toast.success('Review escalated for further investigation');
      queryClient.invalidateQueries({ queryKey: ['expert-reviews'] });
      setEscalateDialogOpen(false);
      setEscalateNotes('');
      setEscalateReviewId(null);
    },
    onError: () => {
      toast.error('Failed to escalate review');
    }
  });

  const handleEscalate = (reviewId: string) => {
    setEscalateReviewId(reviewId);
    setEscalateDialogOpen(true);
  };

  const handleEscalateConfirm = () => {
    if (!escalateReviewId) return;
    escalateMutation.mutate({
      reviewId: escalateReviewId,
      notes: escalateNotes
    });
  };

  const reviews = data?.results || data || [];

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Button
          variant={badOnly ? 'default' : 'outline'}
          size='sm'
          onClick={() => setBadOnly(!badOnly)}
        >
          <Flag className='mr-1 h-4 w-4' />
          Bad Reviews &lt; 3 stars
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='w-10'></TableHead>
                  <TableHead className='w-10'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review: any) => (
                    <TableRow
                      key={review.id}
                      className={`cursor-pointer ${Number(review.rating) < 3 ? 'bg-red-50/50' : ''}`}
                      onClick={() => {
                        if (review.expert_id || review.expert?.id) {
                          router.push(
                            `/admin/experts/${review.expert_id || review.expert?.id}`
                          );
                        }
                      }}
                    >
                      <TableCell className='font-medium'>
                        {review.expert_name ||
                          review.expert?.user?.first_name ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        {review.student_name ||
                          review.reviewer_name ||
                          review.student?.user?.first_name ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={Number(review.rating) || 0}
                          showValue
                        />
                      </TableCell>
                      <TableCell className='max-w-[250px] truncate'>
                        {review.comment || '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {review.created_at
                          ? formatDate(review.created_at)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {Number(review.rating) < 3 && (
                          <Flag className='h-4 w-4 text-red-500' />
                        )}
                      </TableCell>
                      <TableCell>
                        {Number(review.rating) < 3 && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Escalate review'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEscalate(review.id);
                            }}
                          >
                            <AlertTriangle className='h-4 w-4 text-amber-600' />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Escalate Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Review</DialogTitle>
            <DialogDescription>
              Flag this review for further investigation. The expert may be
              contacted or have their account reviewed.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Notes</label>
              <Textarea
                placeholder='Describe the concern or reason for escalation...'
                value={escalateNotes}
                onChange={(e) => setEscalateNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setEscalateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='default'
              onClick={handleEscalateConfirm}
              disabled={escalateMutation.isPending}
            >
              {escalateMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== EARNINGS TAB (cross-expert) ==========
function EarningsTab() {
  const { api } = useClientApi();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const params: any = {};
  if (statusFilter !== 'all') params.status = statusFilter;
  if (typeFilter !== 'all') params.transaction_type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-earnings', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-earnings/', { params });
      return res.data;
    },
    enabled: !!api
  });

  const earnings = data?.results || data || [];

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            <SelectItem value='message'>Message</SelectItem>
            <SelectItem value='call'>Call</SelectItem>
            <SelectItem value='booking'>Booking</SelectItem>
            <SelectItem value='group'>Group</SelectItem>
            <SelectItem value='withdrawal'>Withdrawal</SelectItem>
            <SelectItem value='refund'>Refund</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No earnings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  earnings.map((earning: any) => (
                    <TableRow key={earning.id}>
                      <TableCell className='font-medium'>
                        {earning.expert_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {earning.transaction_type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(earning.gross_amount) || 0)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {earning.commission
                          ? formatCurrency(Number(earning.commission))
                          : '—'}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {formatCurrency(Number(earning.net_amount) || 0)}
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {earning.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            earning.status === 'completed'
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : earning.status === 'pending'
                                ? 'border-amber-200 bg-amber-100 text-amber-800'
                                : earning.status === 'failed'
                                  ? 'border-red-200 bg-red-100 text-red-800'
                                  : ''
                          }
                        >
                          {earning.status || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {earning.created_at
                          ? formatDate(earning.created_at)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== WITHDRAWALS TAB (cross-expert) ==========
function WithdrawalsTab() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const params: any = {};
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-withdrawals', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-withdrawals/', { params });
      return res.data;
    },
    enabled: !!api
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      withdrawalId,
      action
    }: {
      withdrawalId: string;
      action: 'approve' | 'reject';
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/expert-withdrawals/${withdrawalId}/${action}/`);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'approve'
          ? 'Withdrawal approved'
          : 'Withdrawal rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-all-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['expert-stats'] });
    },
    onError: () => {
      toast.error('Failed to process withdrawal');
    }
  });

  const withdrawals = data?.results || data || [];
  const pendingCount = withdrawals.filter(
    (w: any) => w.status === 'pending'
  ).length;

  return (
    <div className='space-y-4'>
      {pendingCount > 0 && (
        <div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3'>
          <Wallet className='h-4 w-4 text-amber-600' />
          <span className='text-sm font-medium text-amber-800'>
            {pendingCount} pending withdrawal{pendingCount !== 1 ? 's' : ''}{' '}
            requiring action
          </span>
        </div>
      )}

      <div className='flex items-center gap-3'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='w-40'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No withdrawal requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell className='font-medium'>
                        {w.expert_name || '—'}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {formatCurrency(Number(w.amount) || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {(w.payment_method || w.method || '—').replace(
                            '_',
                            ' '
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {w.account_name
                          ? `${w.account_name} - ${w.account_number || ''}`
                          : w.account_number || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            w.status === 'completed'
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : w.status === 'pending'
                                ? 'border-amber-200 bg-amber-100 text-amber-800'
                                : w.status === 'processing'
                                  ? 'border-blue-200 bg-blue-100 text-blue-800'
                                  : w.status === 'rejected'
                                    ? 'border-red-200 bg-red-100 text-red-800'
                                    : ''
                          }
                        >
                          {w.status || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {w.created_at ? formatDate(w.created_at) : '—'}
                      </TableCell>
                      <TableCell>
                        {w.status === 'pending' && (
                          <div className='flex gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-7 px-2 text-xs'
                              onClick={() =>
                                actionMutation.mutate({
                                  withdrawalId: w.id,
                                  action: 'approve'
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              <CheckCircle className='mr-1 h-3 w-3' />
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-destructive hover:text-destructive h-7 px-2 text-xs'
                              onClick={() =>
                                actionMutation.mutate({
                                  withdrawalId: w.id,
                                  action: 'reject'
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              <XCircle className='mr-1 h-3 w-3' />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== BOOKINGS TAB (cross-expert) ==========
function BookingsTab() {
  const { api } = useClientApi();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const params: any = {};
  if (statusFilter !== 'all') params.status = statusFilter;
  if (typeFilter !== 'all') params.booking_type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-bookings', params],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-bookings/', { params });
      return res.data;
    },
    enabled: !!api
  });

  const bookings = data?.results || data || [];

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            <SelectItem value='quick_check'>Quick Check</SelectItem>
            <SelectItem value='video_call'>Video Call</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='confirmed'>Confirmed</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
            <SelectItem value='no_show'>No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking: any) => (
                    <TableRow
                      key={booking.id}
                      className='cursor-pointer'
                      onClick={() => {
                        if (booking.expert)
                          router.push(`/admin/experts/${booking.expert}`);
                      }}
                    >
                      <TableCell className='font-medium'>
                        {booking.expert_name || '—'}
                      </TableCell>
                      <TableCell>{booking.student_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {(
                            booking.booking_type ||
                            booking.type ||
                            '—'
                          ).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            booking.status === 'completed'
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : booking.status === 'confirmed'
                                ? 'border-blue-200 bg-blue-100 text-blue-800'
                                : booking.status === 'pending'
                                  ? 'border-amber-200 bg-amber-100 text-amber-800'
                                  : booking.status === 'cancelled' ||
                                      booking.status === 'no_show'
                                    ? 'border-red-200 bg-red-100 text-red-800'
                                    : ''
                          }
                        >
                          {(booking.status || '—').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {booking.scheduled_date
                          ? formatDate(booking.scheduled_date)
                          : booking.created_at
                            ? formatDate(booking.created_at)
                            : '—'}
                      </TableCell>
                      <TableCell>
                        {booking.amount
                          ? formatCurrency(Number(booking.amount))
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {booking.is_paid ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <XCircle className='text-muted-foreground h-4 w-4' />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function ExpertManagementPage() {
  const { api } = useClientApi();
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'overview'
  });

  // Fetch counts for tab badges
  const { data: stats } = useQuery({
    queryKey: ['expert-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get('/admin/expert-stats/');
      return res.data;
    },
    enabled: !!api
  });

  const pendingCount = stats?.pending_review ?? 0;
  const openSupportCount = stats?.open_support_tickets ?? 0;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Expert Management
          </h1>
          <p className='text-muted-foreground'>
            Manage experts, review applications, and handle support.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='flex-wrap'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='pending' className='gap-1.5'>
              Pending Reviews
              {pendingCount > 0 && (
                <Badge className='ml-1 h-5 min-w-5 rounded-full bg-amber-600 px-1.5 text-[10px] text-white'>
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='all'>All Experts</TabsTrigger>
            <TabsTrigger value='support' className='gap-1.5'>
              Support Inbox
              {openSupportCount > 0 && (
                <Badge className='ml-1 h-5 min-w-5 rounded-full bg-blue-600 px-1.5 text-[10px] text-white'>
                  {openSupportCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='reviews'>Reviews</TabsTrigger>
            <TabsTrigger value='earnings'>
              <Wallet className='mr-1.5 h-3.5 w-3.5' />
              Earnings
            </TabsTrigger>
            <TabsTrigger value='withdrawals'>
              <ArrowDownToLine className='mr-1.5 h-3.5 w-3.5' />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value='bookings'>
              <Calendar className='mr-1.5 h-3.5 w-3.5' />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <OverviewTab />
          </TabsContent>

          <TabsContent value='pending'>
            <PendingReviewsTab />
          </TabsContent>

          <TabsContent value='all'>
            <AllExpertsTab />
          </TabsContent>

          <TabsContent value='support'>
            <SupportInboxTab />
          </TabsContent>

          <TabsContent value='reviews'>
            <ReviewsTab />
          </TabsContent>

          <TabsContent value='earnings'>
            <EarningsTab />
          </TabsContent>

          <TabsContent value='withdrawals'>
            <WithdrawalsTab />
          </TabsContent>

          <TabsContent value='bookings'>
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
