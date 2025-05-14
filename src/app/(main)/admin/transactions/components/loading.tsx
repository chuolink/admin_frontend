import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TransactionsLoading() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-[200px]' />
        <Skeleton className='h-10 w-[100px]' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-[100px]' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-2 h-8 w-[120px]' />
              <Skeleton className='h-4 w-[80px]' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-10 w-[300px]' />
        <div className='rounded-md border'>
          <div className='p-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4 py-4'>
                <Skeleton className='h-4 w-[50px]' />
                <Skeleton className='h-4 w-[150px]' />
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-4 w-[80px]' />
                <Skeleton className='h-4 w-[120px]' />
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-4 w-[80px]' />
                <Skeleton className='h-4 w-[120px]' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
