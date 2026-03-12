'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  FileClock,
  FileX,
  FileText,
  CheckCircle,
  XCircle,
  Eye
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
import { type DocumentRequirement } from '@/features/pipeline/types';
import { format } from 'date-fns';

interface DocumentsQueueResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: (DocumentRequirement & {
    student_name?: string;
    stage_label?: string;
  })[];
}

export default function DocumentsPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<DocumentsQueueResponse>({
    queryKey: ['documents-queue'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/documents/');
      return response.data;
    },
    enabled: !!api
  });

  const docs = data?.results ?? [];
  const total = data?.count ?? 0;
  const pending = docs.filter((d) => d.status === 'UPLOADED').length;
  const verified = docs.filter((d) => d.status === 'VERIFIED').length;
  const rejected = docs.filter((d) => d.status === 'REJECTED').length;

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

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
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
                      No documents in queue.
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
                            <Button variant='ghost' size='icon' title='View'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          )}
                          {doc.status === 'UPLOADED' && (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                title='Approve'
                              >
                                <CheckCircle className='h-4 w-4 text-green-600' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                title='Reject'
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
    </PageContainer>
  );
}
