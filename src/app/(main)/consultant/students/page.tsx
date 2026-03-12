'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, GraduationCap, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import Link from 'next/link';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
}

interface StudentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  GRADUATED: 'outline',
  SUSPENDED: 'destructive'
};

export default function ConsultantStudentsPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['consultant-students'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/students/');
      return response.data;
    },
    enabled: !!api
  });

  const students = data?.results ?? [];
  const total = data?.count ?? 0;
  const active = students.filter((s) => s.status === 'ACTIVE').length;
  const graduated = students.filter((s) => s.status === 'GRADUATED').length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>My Students</h1>
          <p className='text-muted-foreground'>Students assigned to you</p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>Assigned students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active</CardTitle>
              <UserCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{active}</div>
              <p className='text-muted-foreground text-xs'>In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Graduated</CardTitle>
              <GraduationCap className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{graduated}</div>
              <p className='text-muted-foreground text-xs'>Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {total - active - graduated}
              </div>
              <p className='text-muted-foreground text-xs'>
                Inactive / suspended
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className='py-8 text-center'>
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No students assigned to you yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className='font-medium'>
                        <Link
                          href={`/consultant/students/${student.id}`}
                          className='hover:underline'
                        >
                          {student.first_name} {student.last_name}
                        </Link>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[student.status] ?? 'secondary'}
                        >
                          {student.status}
                        </Badge>
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
