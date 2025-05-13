'use client';
import React, { FC, useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
const ReactQueryContext: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryContext;
