import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const sess = await getServerSession(authOptions);
  console.log(sess, 'server side');
  if (!sess) {
    redirect('/signin');
  }
  if (sess?.error === 'RefreshAccessTokenError') {
    console.log('RefreshAccessTokenError');
    redirect('/signin');
  }

  if (sess.roles?.includes('admin')) {
    redirect('/admin/overview');
  }
  if (sess.roles?.includes('consultant')) {
    redirect('/consultant/overview');
  }

  redirect('https://app.chuolink.com/');
}
