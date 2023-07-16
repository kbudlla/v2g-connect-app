import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';

import { ConfigProvider } from 'antd';

import './stylesheet/main.scss';

import awsExports from './aws-exports';
import { AppContextProvider } from './core/AppContext';
import './i18n';
import { router } from './router';

import { Amplify } from 'aws-amplify';

Amplify.configure(awsExports);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AppContextProvider>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
            colorLink: '#00b96b',
            colorLinkHover: '#00b96b',
            colorSuccess: '#00b96b',
            colorError: '#ff4d4f',
            colorText: '#1d1e20',
          },
          components: {
            Typography: {
              // Globally adjust the Typography.Title component
              // So we need less overrides
              titleMarginBottom: 0,
              titleMarginTop: 0,
              fontFamily: 'Roboto',
            },
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  </AppContextProvider>,
);
