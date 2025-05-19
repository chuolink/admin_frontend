import WithdrawalEditClient from './WithdrawalEditClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WithdrawalEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <WithdrawalEditClient params={resolvedParams} />;
}
