import axiosInstance from '../axiosInstance';
import { getServerSession } from 'next-auth';
import { authOptions } from '../authOptions';
import { redirect } from 'next/navigation';

export const serverApi = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found, redirecting to signin');
      redirect('/signin');
    }

    const { backendTokens } = session;
    if (!backendTokens?.accessToken) {
      console.log('No access token found in session');
      redirect('/signin');
    }

    console.log(
      'Creating API instance with token:',
      backendTokens.accessToken.substring(0, 10) + '...'
    );
    const api = axiosInstance(backendTokens.accessToken);
    return { api, session };
  } catch (error) {
    console.error('Error in serverApi:', error);
    throw error;
  }
};

export default serverApi;
