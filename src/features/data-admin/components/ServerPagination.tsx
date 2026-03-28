'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ServerPaginationProps {
  /** Total number of records from API */
  totalCount: number;
  /** Current page (1-based) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
}

export function ServerPagination({
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}: ServerPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalCount <= pageSize && !onPageSizeChange) return null;

  // Calculate visible page numbers (show max 5 page buttons)
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    if (page > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      {/* Left: showing X-Y of Z */}
      <div className='flex items-center gap-3'>
        <p className='text-muted-foreground text-xs'>
          Showing{' '}
          <span className='text-foreground font-medium'>
            {startItem}–{endItem}
          </span>{' '}
          of{' '}
          <span className='text-foreground font-medium'>
            {totalCount.toLocaleString()}
          </span>
        </p>

        {onPageSizeChange && (
          <div className='flex items-center gap-1.5'>
            <span className='text-muted-foreground text-xs'>per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className='h-7 w-[65px] text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <Pagination className='mx-0 w-auto justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                className={
                  page <= 1
                    ? 'pointer-events-none opacity-40'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {visiblePages.map((p, idx) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={page === p}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(p);
                    }}
                    className='cursor-pointer'
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
                className={
                  page >= totalPages
                    ? 'pointer-events-none opacity-40'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
