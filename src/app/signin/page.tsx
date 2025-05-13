import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Main from './Main';
export default async function Home() {
  const sess = await getServerSession(authOptions);

  if (
    sess &&
    !sess.roles?.includes('admin') &&
    !sess.roles?.includes('consultant')
  ) {
    redirect('https://app.chuolink.com/');
  }
  if (sess?.roles?.includes('admin')) {
    redirect('/admin//overview');
  }
  if (sess?.roles?.includes('consultant')) {
    redirect('/consultant/overview');
  }
  // console.log(sess, "sess");
  // if (sess) redirect('/dashboard/overview');

  return <Main />;
}
