import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Main from './Main';
export default async function Home() {
  const sess = await getServerSession(authOptions);
  // console.log(sess, "sess");
  if (sess) redirect('/dashboard/overview');

  return <Main />;
}
