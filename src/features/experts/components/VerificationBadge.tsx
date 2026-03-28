'use client';

import { Badge } from '@/components/ui/badge';

const variants: Record<string, { class: string; label: string }> = {
  pending: {
    class: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Pending'
  },
  verified: {
    class: 'bg-green-100 text-green-800 border-green-200',
    label: 'Verified'
  },
  rejected: {
    class: 'bg-red-100 text-red-800 border-red-200',
    label: 'Rejected'
  }
};

export function VerificationBadge({ status }: { status: string }) {
  const v = variants[status] || variants.pending;
  return <Badge className={v.class}>{v.label}</Badge>;
}
