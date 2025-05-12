import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const sess = await getServerSession(authOptions);

  if (!sess) {
    redirect('/signin');
  }

  if (!sess.roles?.includes('admin') && !sess.roles?.includes('consultant')) {
    redirect('https://app.chuolink.com/');
  }
  if (sess.roles?.includes('admin')) {
    redirect('/admin/overview');
  }
  if (sess.roles?.includes('consultant')) {
    redirect('/consultant/overview');
  }
}
