'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileCheck,
  FileClock,
  FileX,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { type DocumentRequirement } from '@/features/pipeline/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface DocumentQueueItem extends DocumentRequirement {
  student_name?: string;
  stage_label?: string;
  pipeline_id?: string;
}

interface DocumentsQueueResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentQueueItem[];
}

export default function DocumentsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery<DocumentsQueueResponse>({
    queryKey: ['documents-queue'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/documents/');
      return response.data;
    },
    enabled: !!api
  });

  const verifyDoc = useMutation({
    mutationFn: async (docId: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/documents/${docId}/verify/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-queue'] });
      toast.success('Document verified');
    },
    onError: () => toast.error('Failed to verify document')
  });

  const rejectDoc = useMutation({
    mutationFn: async ({
      docId,
      reason
    }: {
      docId: string;
      reason: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/documents/${docId}/reject/`, {
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-queue'] });
      setRejectOpen(false);
      setRejectDocId(null);
      setRejectReason('');
      toast.success('Document rejected');
    },
    onError: () => toast.error('Failed to reject document')
  });

  const allDocs = data?.results ?? [];
  const total = data?.count ?? 0;
  const pending = allDocs.filter((d) => d.status === 'UPLOADED').length;
  const verified = allDocs.filter((d) => d.status === 'VERIFIED').length;
  const rejected = allDocs.filter((d) => d.status === 'REJECTED').length;

  const docs = allDocs.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (
      searchQuery &&
      !d.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.document_type.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const docTypeLabel = (type: string) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    REQUIRED: 'outline',
    UPLOADED: 'secondary',
    VERIFIED: 'default',
    REJECTED: 'destructive',
    NOT_APPLICABLE: 'secondary'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Documents</h1>
          <p className='text-muted-foreground'>
            Review and verify uploaded student documents
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <FileText className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>All documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Review
              </CardTitle>
              <FileClock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pending}</div>
              <p className='text-muted-foreground text-xs'>
                Awaiting verification
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Verified</CardTitle>
              <FileCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{verified}</div>
              <p className='text-muted-foreground text-xs'>Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
              <FileX className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{rejected}</div>
              <p className='text-muted-foreground text-xs'>Need re-upload</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by student or document type...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='REQUIRED'>Required</SelectItem>
              <SelectItem value='UPLOADED'>Uploaded</SelectItem>
              <SelectItem value='VERIFIED'>Verified</SelectItem>
              <SelectItem value='REJECTED'>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className='w-[120px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center'>
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : docs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className='font-medium'>
                        {doc.student_name ?? '—'}
                      </TableCell>
                      <TableCell>{docTypeLabel(doc.document_type)}</TableCell>
                      <TableCell className='text-muted-foreground'>
                        {doc.stage_label ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[doc.status] ?? 'secondary'}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          {doc.document_file && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              title='View'
                              asChild
                            >
                              <a
                                href={doc.document_file}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <Eye className='h-4 w-4' />
                              </a>
                            </Button>
                          )}
                          {doc.status === 'UPLOADED' && (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7'
                                title='Verify'
                                onClick={() => verifyDoc.mutate(doc.id)}
                                disabled={verifyDoc.isPending}
                              >
                                <CheckCircle className='h-4 w-4 text-green-600' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7'
                                title='Reject'
                                onClick={() => {
                                  setRejectDocId(doc.id);
                                  setRejectOpen(true);
                                }}
                                disabled={rejectDoc.isPending}
                              >
                                <XCircle className='h-4 w-4 text-red-600' />
                              </Button>
                            </>
                          )}
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

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder='Reason for rejection (required)...'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRejectOpen(false);
                setRejectDocId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (rejectDocId) {
                  rejectDoc.mutate({
                    docId: rejectDocId,
                    reason: rejectReason
                  });
                }
              }}
              disabled={!rejectReason.trim() || rejectDoc.isPending}
            >
              {rejectDoc.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
