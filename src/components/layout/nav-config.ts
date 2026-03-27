import type { NavGroup } from './types';
import {
  LayoutDashboard,
  Kanban,
  UserSearch,
  Phone,
  Users,
  FileText,
  FolderCheck,
  CreditCard,
  Wallet,
  UserCog,
  Globe,
  Settings,
  User,
  Route,
  Star,
  UsersRound,
  Bell,
  BellRing,
  Database,
  GraduationCap,
  BookOpen,
  Library,
  School,
  Briefcase,
  Receipt,
  Settings2,
  FileStack,
  Sparkles,
  Shield,
  MapPin,
  MessageCircle,
  UserCheck,
  Contact,
  ClipboardCheck
} from 'lucide-react';

export const adminNavGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/admin/overview',
        icon: LayoutDashboard
      },
      {
        title: 'Leads',
        url: '/admin/leads',
        icon: UserSearch
      },
      {
        title: 'Pipeline',
        url: '/admin/pipeline',
        icon: Kanban
      }
    ]
  },
  {
    title: 'Students',
    items: [
      {
        title: 'All Students',
        url: '/admin/students',
        icon: Users
      },
      {
        title: 'Applications',
        url: '/admin/applications',
        icon: FileText
      },
      {
        title: 'Documents',
        url: '/admin/documents',
        icon: FolderCheck
      },
      {
        title: 'Notifications',
        url: '/admin/notifications',
        icon: Bell
      },
      {
        title: 'Reminders',
        url: '/admin/reminders',
        icon: BellRing
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Payments',
        url: '/admin/payments',
        icon: CreditCard
      },
      {
        title: 'Reviews',
        url: '/admin/finance/reviews',
        icon: ClipboardCheck
      },
      {
        title: 'Withdrawals',
        url: '/admin/withdrawals',
        icon: Wallet
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'Consultants',
        url: '/admin/consultants',
        icon: UserCog
      },
      {
        title: 'Countries',
        url: '/admin/countries',
        icon: Globe
      },
      {
        title: 'Application Flows',
        url: '/admin/application-flows',
        icon: Route
      },
      {
        title: 'Testimonials',
        url: '/admin/testimonials',
        icon: Star
      },
      {
        title: 'Parent Links',
        url: '/admin/parent-links',
        icon: UsersRound
      },
      {
        title: 'Accreditations',
        url: '/admin/accreditations',
        icon: Shield
      },
      {
        title: 'Office Locations',
        url: '/admin/office-locations',
        icon: MapPin
      }
    ]
  },
  {
    title: 'Data',
    items: [
      {
        title: 'Data Manager',
        url: '/admin/data',
        icon: Database
      },
      {
        title: 'Institutions',
        icon: Globe,
        items: [
          { title: 'Countries', url: '/admin/data/countries' },
          { title: 'Universities', url: '/admin/data/universities' }
        ]
      },
      {
        title: 'Programs',
        icon: GraduationCap,
        items: [
          { title: 'Courses & Disciplines', url: '/admin/data/courses' },
          { title: 'Course Offerings', url: '/admin/data/course-offerings' },
          { title: 'Syllabus', url: '/admin/data/syllabus' }
        ]
      },
      {
        title: 'Fees & Careers',
        icon: Receipt,
        items: [
          { title: 'Fee Structures', url: '/admin/data/expenses' },
          { title: 'Careers & Scholarships', url: '/admin/data/careers' }
        ]
      },
      {
        title: 'Reference Data',
        icon: School,
        items: [
          { title: 'A/O Level Subjects', url: '/admin/data/academics' },
          { title: 'System Config', url: '/admin/data/system' }
        ]
      },
      {
        title: 'People',
        icon: Contact,
        items: [
          { title: 'Experts', url: '/admin/data/experts' },
          { title: 'Consultants', url: '/admin/data/consultants' },
          { title: 'Parents', url: '/admin/data/parents' },
          { title: 'Testimonials', url: '/admin/data/testimonials' }
        ]
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        url: '/admin/settings',
        icon: Settings
      }
    ]
  }
];

export const consultantNavGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/consultant/overview',
        icon: LayoutDashboard
      },
      {
        title: 'My Pipeline',
        url: '/consultant/pipeline',
        icon: Kanban
      }
    ]
  },
  {
    title: 'CRM',
    items: [
      {
        title: 'My Leads',
        url: '/consultant/leads',
        icon: UserSearch
      },
      {
        title: 'My Calls',
        url: '/consultant/sales-calls',
        icon: Phone
      }
    ]
  },
  {
    title: 'Students',
    items: [
      {
        title: 'My Students',
        url: '/consultant/students',
        icon: Users
      },
      {
        title: 'Applications',
        url: '/consultant/applications',
        icon: FileText
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Payments',
        url: '/consultant/payments',
        icon: CreditCard
      },
      {
        title: 'Withdrawals',
        url: '/consultant/withdrawals',
        icon: Wallet
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        url: '/consultant/profile',
        icon: User
      }
    ]
  }
];
