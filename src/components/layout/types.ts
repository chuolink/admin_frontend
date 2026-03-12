import { type LucideIcon } from 'lucide-react';

export interface NavLink {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  isActive?: boolean;
}

export interface NavCollapsible {
  title: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: {
    title: string;
    url: string;
    badge?: string;
  }[];
}

export type NavItem = NavLink | NavCollapsible;

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function isNavCollapsible(item: NavItem): item is NavCollapsible {
  return 'items' in item;
}

export interface SidebarData {
  navGroups: NavGroup[];
}
