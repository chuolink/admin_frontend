import axiosInstance from '../axiosInstance';
import { getServerSession } from 'next-auth';
import { authOptions } from '../authOptions';
import { redirect } from 'next/navigation';

export const serverApi = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found, redirecting to signin');
      redirect('/signin?logout=true');
    }

    const { backendTokens } = session;
    if (!backendTokens?.accessToken) {
      console.log('No access token found in session');
      redirect('/signin?logout=true');
    }

    console.log(
      'Creating API instance with token:',
      backendTokens.accessToken.substring(0, 10) + '...'
    );
    try {
      const api = axiosInstance(backendTokens.accessToken);
      return { api, session };
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('No access token found in session');
        redirect('/signin?logout=true');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in serverApi:', error);
    throw error;
  }
};

export default serverApi;
