import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import NotFound from 'components/common/NotFound/NotFound';
import { AccessScreen } from 'components/screens/Auth/Access/Access';
import { ResetPassword } from 'components/screens/Auth/ResetPassword/ResetPassword';
import ChargerMapScreen from 'components/screens/ChargerMapScreen/ChargerMapScreen';
import Dashboard from 'components/screens/Dashboard/Dashboard';
import ForumThread from 'components/screens/ForumScreen/components/ForumThread';
import ThreadOverview from 'components/screens/ForumScreen/components/ThreadOverview';
import ForumScreen from 'components/screens/ForumScreen/ForumScreen';
import { Home } from 'components/screens/Home/Home';
import RewardsScreen from 'components/screens/RewardsScreen.tsx/RewardsScreen';
import SustainabilityTracker from 'components/screens/SustainabilityTracker/SustainabilityTracker';

import { ForgotPassword } from '../components/screens/Auth/ForgotPassword/ForgotPassword';
// import ForgotPasswordVerificationForm from '../components/screens/Auth/ForgotPassword/ForgotPasswordVerification';
import { Login } from '../components/screens/Auth/Login/Login';
import RegistrationForm from '../components/screens/Auth/Register/Register';
import { AuthenticatedOnlyRoute } from './AuthenticatedOnlyRoute';
import { UnauthenticatedOnlyRoute } from './UnauthenticatedOnlyRoute';

export const router = createBrowserRouter([
  {
    element: <AuthenticatedOnlyRoute />,
    children: [
      {
        path: '/',
        element: <Home />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'charger-map',
            element: <ChargerMapScreen />,
          },
          {
            path: 'sustainability',
            element: <SustainabilityTracker />,
          },
          {
            path: 'rewards',
            element: <RewardsScreen />,
          },
          {
            path: 'community',
            element: <ForumScreen />,
            children: [
              {
                path: '',
                element: <ThreadOverview />,
              },
              {
                path: ':threadId',
                element: <ForumThread />,
              },
            ],
          },
          {
            path: 'sustainability',
            element: <SustainabilityTracker />,
          },
          {
            element: <NotFound />,
            path: '*',
          },
          {
            element: <Navigate replace to="dashboard" />,
            path: '',
          },
        ],
      },
    ],
  },
  {
    element: <UnauthenticatedOnlyRoute />,
    children: [
      {
        path: '/auth',
        element: <AccessScreen />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <RegistrationForm />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPassword />,
          },
          {
            path: 'reset-password',
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },
]);
