export interface BreadcrumbItem {
  title: string;
  link: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export interface BreadcrumbLinkProps {
  href: string;
  children: React.ReactNode;
}

export interface BreadcrumbPageProps {
  children: React.ReactNode;
}

export interface BreadcrumbSeparatorProps {
  children: React.ReactNode;
}

export interface BreadcrumbListProps {
  children: React.ReactNode;
}

export interface BreadcrumbProps {
  children: React.ReactNode;
}
