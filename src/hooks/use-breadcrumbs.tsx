'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// Friendly names for known route segments
const segmentLabels: Record<string, string> = {
  admin: 'Admin',
  consultant: 'Consultant',
  overview: 'Dashboard',
  leads: 'Leads',
  pipeline: 'Pipeline',
  tasks: 'Tasks',
  students: 'Students',
  applications: 'Applications',
  documents: 'Documents',
  payments: 'Payments',
  withdrawals: 'Withdrawals',
  consultants: 'Consultants',
  'sales-calls': 'Sales Calls',
  consultations: 'Consultations',
  reminders: 'Reminders',
  notifications: 'Notifications',
  testimonials: 'Testimonials',
  'application-flows': 'Application Flows',
  'consultant-applications': 'Consultant Applications',
  profile: 'Profile',
  settings: 'Settings',
  edit: 'Edit'
};

// Check if a segment looks like a dynamic ID (CUID, UUID, or long hash)
function isDynamicSegment(segment: string): boolean {
  // CUIDs with prefix (e.g., lead_abc123, student_xyz456)
  if (/^[a-z]+_[a-z0-9]{10,}$/i.test(segment)) return true;
  // UUIDs
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  )
    return true;
  // Long alphanumeric strings (likely IDs)
  if (/^[a-z0-9]{20,}$/i.test(segment)) return true;
  return false;
}

// Get a friendly label for a dynamic ID based on the preceding segment
function getDynamicLabel(segment: string, prevSegment?: string): string {
  if (!prevSegment) return 'Details';

  const labelMap: Record<string, string> = {
    leads: 'Lead Details',
    students: 'Student Details',
    applications: 'Application Details',
    pipeline: 'Pipeline Details',
    consultants: 'Consultant Details',
    'consultant-applications': 'Application Details',
    payments: 'Payment Details',
    tasks: 'Task Details'
  };

  return labelMap[prevSegment] || 'Details';
}

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    return segments
      .map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;

        // Use known label
        if (segmentLabels[segment]) {
          return { title: segmentLabels[segment], link: path };
        }

        // Dynamic ID segments — show friendly label
        if (isDynamicSegment(segment)) {
          const prevSegment = index > 0 ? segments[index - 1] : undefined;
          return {
            title: getDynamicLabel(segment, prevSegment),
            link: path
          };
        }

        // Fallback: capitalize
        return {
          title: segment
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          link: path
        };
      })
      .filter(Boolean);
  }, [pathname]);

  return breadcrumbs;
}
