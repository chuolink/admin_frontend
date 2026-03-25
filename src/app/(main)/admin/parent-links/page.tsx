'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsersRound, CheckCircle2, Clock, Link2 } from 'lucide-react';

interface ParentLink {
  id: string;
  parent_name: string;
  student_name: string;
  relationship: string;
  verified: boolean;
  verified_at: string | null;
  can_make_payments: boolean;
  can_upload_documents: boolean;
  notifications_enabled: boolean;
  created_at: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: 'Father',
  MOTHER: 'Mother',
  GUARDIAN: 'Guardian',
  SPONSOR: 'Sponsor'
};

export default function ParentLinksPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery({
    queryKey: ['parent-links'],
    queryFn: async () => {
      const response = await api!.get('/admin/parent-links/', {
        params: { page_size: 100 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const links: ParentLink[] = data?.results || [];
  const verifiedCount = links.filter((l) => l.verified).length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Parent Links</h1>
          <p className='text-muted-foreground'>
            View parent-student verification links
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Links</CardTitle>
              <Link2 className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{links.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Verified</CardTitle>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {verifiedCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {links.length - verifiedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-muted h-20 animate-pulse rounded-lg' />
            ))}
          </div>
        ) : links.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <UsersRound className='text-muted-foreground mx-auto mb-3 h-8 w-8' />
              <p className='text-muted-foreground'>
                No parent-student links yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-2'>
            {links.map((link) => (
              <Card key={link.id}>
                <CardContent className='flex items-center gap-4 py-4'>
                  <div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                    <UsersRound className='text-primary h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium'>{link.parent_name}</p>
                      <span className='text-muted-foreground text-xs'>→</span>
                      <p className='text-sm'>{link.student_name}</p>
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {RELATIONSHIP_LABELS[link.relationship] ||
                          link.relationship}
                      </Badge>
                      {link.can_make_payments && (
                        <Badge variant='secondary' className='text-xs'>
                          Payments
                        </Badge>
                      )}
                      {link.can_upload_documents && (
                        <Badge variant='secondary' className='text-xs'>
                          Documents
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className='shrink-0'>
                    {link.verified ? (
                      <Badge className='border-green-500/20 bg-green-500/10 text-green-600'>
                        <CheckCircle2 className='mr-1 h-3 w-3' />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='border-amber-500/20 text-amber-600'
                      >
                        <Clock className='mr-1 h-3 w-3' />
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
