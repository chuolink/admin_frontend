import WithdrawalViewClient from './WithdrawalViewClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WithdrawalViewPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <WithdrawalViewClient params={resolvedParams} />;
}
