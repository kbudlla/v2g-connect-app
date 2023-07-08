import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';

import { ConfigProvider } from 'antd';

import './stylesheet/main.scss';

import { AppContextProvider } from './core/AppContext';
import './i18n';
import { router } from './router';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppContextProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#00b96b',
              colorLink: '#00b96b',
              colorLinkHover: '#00b96b',
              colorError: '#ff4d4f',
              colorText: '#1d1e20',
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </AppContextProvider>
  </React.StrictMode>,
);
