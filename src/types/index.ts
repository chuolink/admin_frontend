import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export * from './common';
export * from './transaction';
export * from './student';
export * from './data-table';
export * from './user';
export * from './admin';
export * from './layout';
export * from './user-nav';
export * from './breadcrumbs';
export * from './application';

// Re-export specific types for convenience
export type {
  Transaction,
  TransactionFilters,
  TransactionStats,
  TransactionResponse,
  Student,
  StudentFilters,
  StudentStats,
  StudentResponse,
  PaginatedResponse,
  ApiError,
  ApiResponse,
  DateRange,
  SelectOption,
  FilterState,
  AdminUser,
  AdminUserFilters,
  AdminUserStats,
  AdminUserResponse,
  UserDetailsProps,
  UserFiltersProps,
  NavigationItem,
  NavigationItemWithChildren,
  NavigationItemWithOptionalChildren,
  LayoutProps,
  SidebarProps,
  HeaderProps,
  AppSidebarProps,
  SidebarProviderProps,
  SidebarInsetProps,
  UserNavProps,
  UserAvatarProfileProps,
  UserDropdownProps,
  UserDropdownItem,
  UserDropdownGroup,
  UserDropdownContentProps,
  BreadcrumbItem,
  BreadcrumbsProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbListProps,
  BreadcrumbProps,
  Application,
  ApplicationStatus,
  ApplicationFilters,
  ApplicationStats,
  ApplicationResponse,
  University,
  Course,
  ApplicationDetailsProps,
  ApplicationFiltersProps,
  ApplicationActionsProps
} from './transaction';
