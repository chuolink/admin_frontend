'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UsersRound,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  CreditCard,
  FileText
} from 'lucide-react';

interface ParentLink {
  id: string;
  parent_name: string;
  relationship: string;
  verified: boolean;
  verified_at: string | null;
  can_make_payments: boolean;
  can_upload_documents: boolean;
  notifications_enabled: boolean;
  created_at: string;
  parent_phone?: string;
  parent_email?: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: 'Father',
  MOTHER: 'Mother',
  GUARDIAN: 'Guardian',
  SPONSOR: 'Sponsor'
};

export default function ParentInfoCard({ studentId }: { studentId: string }) {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery({
    queryKey: ['parent-links', studentId],
    queryFn: async () => {
      const response = await api!.get('/admin/parent-links/', {
        params: { student: studentId, page_size: 10 }
      });
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  const links: ParentLink[] = data?.results || [];

  if (isLoading) {
    return <Skeleton className='h-32 rounded-lg' />;
  }

  if (!links.length) {
    return (
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <UsersRound className='h-4 w-4' /> Parent/Guardian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            No parent or guardian linked to this student.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <UsersRound className='h-4 w-4' /> Parent/Guardian
          <Badge variant='secondary' className='ml-auto text-[10px]'>
            {links.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {links.map((link) => (
          <div key={link.id} className='rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                  <UsersRound className='text-primary h-4 w-4' />
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {link.parent_name}
                  </p>
                  <Badge variant='outline' className='mt-0.5 text-[10px]'>
                    {RELATIONSHIP_LABELS[link.relationship] ||
                      link.relationship}
                  </Badge>
                </div>
              </div>
              {link.verified ? (
                <Badge className='shrink-0 gap-1 border-green-500/20 bg-green-500/10 text-green-600'>
                  <CheckCircle2 className='h-3 w-3' />
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='shrink-0 gap-1 border-amber-500/20 text-amber-600'
                >
                  <Clock className='h-3 w-3' />
                  Pending
                </Badge>
              )}
            </div>
            {(link.parent_phone || link.parent_email) && (
              <div className='text-muted-foreground mt-2 space-y-1 text-xs'>
                {link.parent_phone && (
                  <div className='flex items-center gap-1.5'>
                    <Phone className='h-3 w-3' />
                    {link.parent_phone}
                  </div>
                )}
                {link.parent_email && (
                  <div className='flex items-center gap-1.5'>
                    <Mail className='h-3 w-3' />
                    {link.parent_email}
                  </div>
                )}
              </div>
            )}
            <div className='mt-2 flex flex-wrap gap-1'>
              {link.can_make_payments && (
                <Badge variant='secondary' className='gap-1 text-[10px]'>
                  <CreditCard className='h-2.5 w-2.5' />
                  Payments
                </Badge>
              )}
              {link.can_upload_documents && (
                <Badge variant='secondary' className='gap-1 text-[10px]'>
                  <FileText className='h-2.5 w-2.5' />
                  Documents
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
