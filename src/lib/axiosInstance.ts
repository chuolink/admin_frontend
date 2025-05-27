import axios from 'axios';
import { config } from 'process';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

const createAxiosInstance = (token: string, type: string = 'backend') => {
  console.log(
    'Creating axios instance with baseURL:',
    process.env.NEXT_PUBLIC_BACKEND_URL
  );
  let baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log(baseURL);
  const instance = axios.create({
    baseURL: baseURL
  });

  instance.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          // Client-side: Use signOut
          signOut();
        } else {
          // Server-side: Redirect to signin with logout param
          redirect('/signin?logout=true');
        }
      }
      console.error('Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;
