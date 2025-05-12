import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const sess = await getServerSession(authOptions);
  if (!sess) {
    redirect('/signin');
  }
  console.log(sess);

  redirect('/dashboard/overview');
}
