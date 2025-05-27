'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Eye, Edit, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Consultant {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  earnings: number;
}

interface Response<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function ConsultantsPage() {
  const router = useRouter();
  const { api } = useClientApi();

  const { data: consultants, isLoading } = useQuery<Response<Consultant>>({
    queryKey: ['consultants'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/overview/');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardHeader>
            <CardTitle>Consultants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <Card>
        <CardHeader>
          <CardTitle>Consultants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants?.results.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      {consultant.user.first_name} {consultant.user.last_name}
                    </TableCell>
                    <TableCell>{consultant.user.email}</TableCell>
                    <TableCell>{consultant.user.phone_number}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          consultant.is_active ? 'default' : 'destructive'
                        }
                      >
                        {consultant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(consultant.earnings)}</TableCell>
                    <TableCell>{formatDate(consultant.created_at)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/consultants/${consultant.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button> */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            router.push(
                              `/admin/consultants/${consultant.id}/edit`
                            )
                          }
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/consultants/${consultant.id}/withdrawals`)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Withdrawals
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
