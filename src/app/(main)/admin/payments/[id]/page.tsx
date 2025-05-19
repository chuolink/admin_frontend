import PaymentViewClient from './PaymentViewClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentViewPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <PaymentViewClient params={resolvedParams} />;
}
