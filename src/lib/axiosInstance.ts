import axios from 'axios';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

const createAxiosInstance = (token: string, type: string = 'backend') => {
  console.log(
    'Creating axios instance with baseURL:',
    process.env.NEXT_PUBLIC_BACKEND_URL
  );
  let baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  switch (type) {
    case 'backend':
      baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      break;
    case 'ai':
      baseURL = process.env.NEXT_PUBLIC_AI_URL;
      break;
    default:
      baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      break;
  }

  const instance = axios.create({
    baseURL: baseURL
  });

  // Helper function to ensure trailing slash
  const ensureTrailingSlash = (url: string): string => {
    if (!url) return url;

    // Handle URLs with query parameters or hash
    if (url.includes('?') || url.includes('#')) {
      const queryIndex = url.indexOf('?');
      const hashIndex = url.indexOf('#');

      // Find the first occurrence of either ? or #
      const splitIndex =
        queryIndex !== -1 && hashIndex !== -1
          ? Math.min(queryIndex, hashIndex)
          : Math.max(queryIndex, hashIndex);

      const basePath = url.substring(0, splitIndex);
      const queryAndHash = url.substring(splitIndex);

      // Add trailing slash to base path if not present
      const basePathWithSlash = basePath.endsWith('/')
        ? basePath
        : `${basePath}/`;

      return basePathWithSlash + queryAndHash;
    }

    // Add trailing slash if not present
    return url.endsWith('/') ? url : `${url}/`;
  };

  instance.interceptors.request.use(
    (config) => {
      // Add authorization header
      config.headers.Authorization = `Bearer ${token}`;

      // Ensure trailing slash on the URL
      if (config.url) {
        config.url = ensureTrailingSlash(config.url);
      }

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
      // Handle 401 unauthorized errors
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          // Client-side: Use signOut
          signOut();
        } else {
          // Server-side: Redirect to signin with logout param
          redirect('/signin?logout=true');
        }
      }

      // Log other errors
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
