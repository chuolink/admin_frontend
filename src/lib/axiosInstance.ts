import axios from 'axios';
import { config } from 'process';

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
