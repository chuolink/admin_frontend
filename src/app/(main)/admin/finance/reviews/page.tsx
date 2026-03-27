'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// --- Types ---

interface ReviewStats {
  pending: number;
  approved_today: number;
  total_reviewed: number;
  pending_amount: number;
}

interface ReviewItem {
  id: string;
  student_name: string;
  student_id: string;
  university_name: string;
  application_id: string;
  app_id: string;
  payment_name: string;
  amount: number;
  receipt_url: string;
  declared_by: string;
  declared_by_name: string;
  notes: string;
  mode: string;
  status: string;
  review_notes: string;
  rejection_reason: string;
  reviewed_by_name: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

// --- Helpers ---

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'declared':
      return (
        <Badge variant='outline' className='border-amber-500/30 text-amber-500'>
          Declared
        </Badge>
      );
    case 'success':
    case 'approved':
      return (
        <Badge variant='default' className='bg-green-600'>
          Approved
        </Badge>
      );
    case 'failed':
    case 'rejected':
      return <Badge variant='destructive'>Rejected</Badge>;
    case 'pending':
      return <Badge variant='secondary'>Pending</Badge>;
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp')
  );
}

// --- Component ---

type ReviewFilter = 'pending' | 'approved' | 'rejected' | 'all';

export default function FinanceReviewsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('pending');
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  // Fetch stats
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['finance-review-stats'],
    queryFn: async () => {
      const response = await api!.get('/admin/finance/reviews/stats/');
      return response.data;
    },
    enabled: !!api
  });

  // Fetch reviews list
  const { data: reviewsData, isLoading } = useQuery<{
    results: ReviewItem[];
    count: number;
  }>({
    queryKey: ['finance-reviews', activeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') {
        params.review_filter = activeFilter;
      }
      const response = await api!.get('/admin/finance/reviews/', { params });
      return response.data;
    },
    enabled: !!api
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/finance/reviews/${id}/approve/`, {
        notes: notes || undefined
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['finance-review-stats'] });
      setSheetOpen(false);
      setSelectedReview(null);
      setApproveNotes('');
      toast.success('Payment approved successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to approve payment');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/finance/reviews/${id}/reject/`, {
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['finance-review-stats'] });
      setSheetOpen(false);
      setSelectedReview(null);
      setRejectMode(false);
      setRejectReason('');
      toast.success('Payment rejected');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to reject payment');
    }
  });

  const reviews = reviewsData?.results ?? [];

  const openReviewSheet = (review: ReviewItem) => {
    setSelectedReview(review);
    setSheetOpen(true);
    setRejectMode(false);
    setRejectReason('');
    setApproveNotes('');
  };

  const handleApprove = () => {
    if (!selectedReview) return;
    approveMutation.mutate({
      id: selectedReview.id,
      notes: approveNotes || undefined
    });
  };

  const handleReject = () => {
    if (!selectedReview || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate({
      id: selectedReview.id,
      reason: rejectReason.trim()
    });
  };

  const isPending =
    selectedReview?.status === 'declared' ||
    selectedReview?.status === 'pending';

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Finance Reviews</h1>
          <p className='text-muted-foreground'>
            Review and approve declared payment submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Reviews
              </CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {stats?.pending ?? '--'}
              </div>
              <p className='text-muted-foreground text-xs'>
                {stats ? formatCurrency(stats.pending_amount) : ''} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Approved Today
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats?.approved_today ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Reviewed
              </CardTitle>
              <DollarSign className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.total_reviewed ?? '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as ReviewFilter)}
        >
          <TabsList>
            <TabsTrigger value='pending' className='gap-1.5'>
              <Clock className='h-3.5 w-3.5' />
              Pending
              {(stats?.pending ?? 0) > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs'
                >
                  {stats?.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='approved' className='gap-1.5'>
              <CheckCircle className='h-3.5 w-3.5' />
              Approved
            </TabsTrigger>
            <TabsTrigger value='rejected' className='gap-1.5'>
              <XCircle className='h-3.5 w-3.5' />
              Rejected
            </TabsTrigger>
            <TabsTrigger value='all'>All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Reviews Table */}
        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Fee Name</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Declared By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='w-[50px]' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className='h-24 text-center'>
                      <Loader2 className='text-muted-foreground mx-auto h-5 w-5 animate-spin' />
                    </TableCell>
                  </TableRow>
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className='text-muted-foreground h-24 text-center'
                    >
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className='hover:bg-accent/50 cursor-pointer'
                      onClick={() => openReviewSheet(review)}
                    >
                      <TableCell className='font-medium'>
                        {review.student_name}
                      </TableCell>
                      <TableCell>{review.university_name}</TableCell>
                      <TableCell>{review.name}</TableCell>
                      <TableCell className='text-right font-mono'>
                        {formatCurrency(review.amount)}
                      </TableCell>
                      <TableCell>
                        {review.receipt_url ? (
                          isImageUrl(review.receipt_url) ? (
                            <div className='h-8 w-8 overflow-hidden rounded border'>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={review.receipt_url}
                                alt='Receipt'
                                className='h-full w-full object-cover'
                              />
                            </div>
                          ) : (
                            <FileText className='text-muted-foreground h-4 w-4' />
                          )
                        ) : (
                          <span className='text-muted-foreground text-xs'>
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {review.declared_by_name}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {review.created_at
                          ? format(new Date(review.created_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 w-7 p-0'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Review Detail Sheet */}
      <DataSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSelectedReview(null);
            setRejectMode(false);
            setRejectReason('');
            setApproveNotes('');
          }
        }}
        title='Payment Review'
        description={
          selectedReview
            ? `${selectedReview.student_name} — ${selectedReview.university_name}`
            : ''
        }
        size='lg'
        footer={
          isPending ? (
            <div className='flex items-center gap-3'>
              {!rejectMode ? (
                <>
                  <Button
                    variant='destructive'
                    onClick={() => setRejectMode(true)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    Reject
                  </Button>
                  <div className='flex-1' />
                  <Button
                    className='bg-green-600 hover:bg-green-700'
                    onClick={handleApprove}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <CheckCircle className='mr-2 h-4 w-4' />
                    )}
                    Approve Payment
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setRejectMode(false);
                      setRejectReason('');
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <div className='flex-1' />
                  <Button
                    variant='destructive'
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <XCircle className='mr-2 h-4 w-4' />
                    )}
                    Confirm Rejection
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedReview && (
          <div className='space-y-6'>
            {/* Payment Details */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                Payment Details
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Fee Name
                  </Label>
                  <p className='text-sm font-medium'>{selectedReview.name}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Amount
                  </Label>
                  <p className='text-sm font-bold'>
                    {formatCurrency(selectedReview.amount)}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Payment Mode
                  </Label>
                  <p className='text-sm capitalize'>
                    {selectedReview.mode || '—'}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Status
                  </Label>
                  <div className='mt-0.5'>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Application
                  </Label>
                  {selectedReview.app_id || selectedReview.application_id ? (
                    <a
                      href={`/admin/applications/${selectedReview.app_id || selectedReview.application_id}`}
                      className='flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400 hover:underline'
                    >
                      See Application <ExternalLink className='h-3 w-3' />
                    </a>
                  ) : (
                    <p className='text-muted-foreground text-sm'>—</p>
                  )}
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Declared Date
                  </Label>
                  <p className='text-sm'>
                    {selectedReview.created_at
                      ? format(
                          new Date(selectedReview.created_at),
                          'MMM d, yyyy HH:mm'
                        )
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Student & University */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                Student & University
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Student Name
                  </Label>
                  <p className='text-sm font-medium'>
                    {selectedReview.student_name}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    University
                  </Label>
                  <p className='text-sm font-medium'>
                    {selectedReview.university_name}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Declaration Info */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                Declaration Info
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground text-xs'>
                    Declared By
                  </Label>
                  <p className='text-sm'>{selectedReview.declared_by_name}</p>
                </div>
                {selectedReview.description && (
                  <div className='col-span-2'>
                    <Label className='text-muted-foreground text-xs'>
                      Notes
                    </Label>
                    <p className='text-sm whitespace-pre-wrap'>
                      {selectedReview.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Proof of Payment */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                Proof of Payment
              </h3>
              {(selectedReview as any).proofs?.length > 0 ? (
                <div className='space-y-3'>
                  {(selectedReview as any).proofs.map(
                    (proof: any, idx: number) => {
                      const url = proof.file_url || proof.file;
                      const isImage = url && isImageUrl(url);
                      return (
                        <div key={proof.id || idx} className='space-y-2'>
                          {isImage ? (
                            <div className='overflow-hidden rounded-lg border'>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={proof.file_name || `Proof ${idx + 1}`}
                                className='max-h-64 w-full object-contain'
                              />
                            </div>
                          ) : (
                            <div className='flex items-center gap-3 rounded-lg border p-3'>
                              <FileText className='text-muted-foreground h-6 w-6' />
                              <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-medium'>
                                  {proof.file_name || `Document ${idx + 1}`}
                                </p>
                              </div>
                            </div>
                          )}
                          <a
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400'
                          >
                            <ExternalLink className='h-3 w-3' />
                            {proof.file_name || `Open proof ${idx + 1}`}
                          </a>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : selectedReview.receipt_url ? (
                <div className='space-y-3'>
                  {isImageUrl(selectedReview.receipt_url) ? (
                    <div className='overflow-hidden rounded-lg border'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReview.receipt_url}
                        alt='Payment receipt'
                        className='max-h-80 w-full object-contain'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 rounded-lg border p-4'>
                      <FileText className='text-muted-foreground h-8 w-8' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>Receipt Document</p>
                      </div>
                    </div>
                  )}
                  <a
                    href={selectedReview.receipt_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                    Open receipt
                  </a>
                </div>
              ) : (
                <div className='rounded-lg border border-dashed p-6 text-center'>
                  <ImageIcon className='text-muted-foreground mx-auto mb-2 h-6 w-6' />
                  <p className='text-muted-foreground text-sm'>
                    No receipt attached
                  </p>
                </div>
              )}
            </div>

            {/* Review Result (for already reviewed items) */}
            {selectedReview.reviewed_at && (
              <>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                    Review Result
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Reviewed By
                      </Label>
                      <p className='text-sm'>
                        {selectedReview.reviewed_by_name}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Reviewed At
                      </Label>
                      <p className='text-sm'>
                        {format(
                          new Date(selectedReview.reviewed_at),
                          'MMM d, yyyy HH:mm'
                        )}
                      </p>
                    </div>
                    {selectedReview.review_notes && (
                      <div className='col-span-2'>
                        <Label className='text-muted-foreground text-xs'>
                          Review Notes
                        </Label>
                        <p className='text-sm whitespace-pre-wrap'>
                          {selectedReview.review_notes}
                        </p>
                      </div>
                    )}
                    {selectedReview.rejection_reason && (
                      <div className='col-span-2'>
                        <Label className='text-muted-foreground text-xs'>
                          Rejection Reason
                        </Label>
                        <p className='text-sm whitespace-pre-wrap text-red-400'>
                          {selectedReview.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Approve Notes (for pending items) */}
            {isPending && !rejectMode && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Label className='text-xs'>
                    Approval Notes{' '}
                    <span className='text-muted-foreground'>(optional)</span>
                  </Label>
                  <Textarea
                    placeholder='Add optional notes about this approval...'
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Rejection Reason (when rejecting) */}
            {isPending && rejectMode && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Label className='text-xs text-red-400'>
                    Rejection Reason <span className='text-red-400'>*</span>
                  </Label>
                  <Textarea
                    placeholder='Explain why this payment is being rejected...'
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className='border-red-500/30 focus-visible:ring-red-500/30'
                  />
                </div>
              </>
            )}
          </div>
        )}
      </DataSheet>
    </PageContainer>
  );
}
