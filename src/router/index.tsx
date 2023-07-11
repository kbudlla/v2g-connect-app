import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import NotFound from 'components/common/NotFound/NotFound';
import { AccessScreen } from 'components/screens/Auth/Access/Access';
import { ResetPassword } from 'components/screens/Auth/ResetPassword/ResetPassword';
import ChargerMap from 'components/screens/ChargerMap/ChargerMap';
import Dashboard from 'components/screens/Dashboard/Dashboard';
import { Home } from 'components/screens/Home/Home';
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
            element: <ChargerMap />,
          },
          {
            path: 'sustainability',
            element: <SustainabilityTracker />,
          },
          {
            element: <NotFound />,
            path: '*',
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
            path: 'map',
            element: <ChargerMap />,
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
