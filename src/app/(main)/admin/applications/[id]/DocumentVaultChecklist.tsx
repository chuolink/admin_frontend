'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Image,
  Fingerprint,
  UserCheck
} from 'lucide-react';

interface VaultItem {
  key: string;
  label: string;
  icon: React.ElementType;
  check: (student: Record<string, unknown>) => boolean;
}

const VAULT_ITEMS: VaultItem[] = [
  {
    key: 'passport',
    label: 'Passport Photo',
    icon: Image,
    check: (s) => !!s.passport
  },
  {
    key: 'birth_certificate',
    label: 'Birth Certificate',
    icon: FileText,
    check: (s) => !!s.birth_certificate
  },
  {
    key: 'nida_number',
    label: 'NIDA Number',
    icon: Fingerprint,
    check: (s) => !!s.nida_number
  },
  {
    key: 'blue_bg_photo',
    label: 'Blue Background Photo',
    icon: Image,
    check: (s) => !!s.blue_bg_photo
  },
  {
    key: 'o_level_result',
    label: 'O-Level Results',
    icon: FileText,
    check: (s) => {
      const results = s.results as Record<string, unknown> | undefined;
      return !!results?.o_level_result;
    }
  },
  {
    key: 'a_level_result',
    label: 'A-Level Results',
    icon: FileText,
    check: (s) => {
      const results = s.results as Record<string, unknown> | undefined;
      return !!results?.a_level_result;
    }
  },
  {
    key: 'parent_linked',
    label: 'Parent/Guardian Linked',
    icon: UserCheck,
    check: () => false // checked separately via parent-links
  }
];

export default function DocumentVaultChecklist({
  studentId
}: {
  studentId: string;
}) {
  const { api } = useClientApi();

  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['student-vault', studentId],
    queryFn: async () => {
      const response = await api!.get(`/admin/students/${studentId}/`);
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  const { data: parentData } = useQuery({
    queryKey: ['parent-links', studentId],
    queryFn: async () => {
      const response = await api!.get('/admin/parent-links/', {
        params: { student: studentId, page_size: 5 }
      });
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  if (studentLoading) {
    return <Skeleton className='h-48 rounded-lg' />;
  }

  if (!studentData) return null;

  const hasParent = (parentData?.results?.length || 0) > 0;

  const items = VAULT_ITEMS.map((item) => ({
    ...item,
    completed:
      item.key === 'parent_linked' ? hasParent : item.check(studentData)
  }));

  const completedCount = items.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <ShieldCheck className='h-4 w-4' /> Document Vault
          </CardTitle>
          <Badge
            variant={progress === 100 ? 'default' : 'secondary'}
            className='text-[10px]'
          >
            {completedCount}/{items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-1'>
          <Progress value={progress} className='h-1.5' />
          <p className='text-muted-foreground text-[10px]'>
            {progress}% complete
          </p>
        </div>
        <div className='space-y-1'>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className='flex items-center gap-2 rounded px-2 py-1.5 text-sm'
              >
                {item.completed ? (
                  <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-green-600' />
                ) : (
                  <XCircle className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                )}
                <Icon className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span
                  className={
                    item.completed ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
