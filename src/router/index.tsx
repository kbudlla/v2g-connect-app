import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import ChargerMap from 'components/ChargerMap';
import { Home } from 'components/screens/Home/Home';

import ForgotPasswordForm from '../components/screens/Auth/ForgotPassword/ForgotPassword';
import ForgotPasswordVerificationForm from '../components/screens/Auth/ForgotPassword/ForgotPasswordVerification';
import Login from '../components/screens/Auth/Login/Login';
import RegistrationForm from '../components/screens/Auth/Register/Register';
import { AuthenticatedOnlyRoute } from './AuthenticatedOnlyRoute';
import { UnauthenticatedOnlyRoute } from './UnauthenticatedOnlyRoute';

export const router = createBrowserRouter([
  {
    element: <UnauthenticatedOnlyRoute />,
    path: '/',
    children: [
      {
        path: 'home',
        element: <Home />,
      },
    ],
  },
  {
    element: <AuthenticatedOnlyRoute />,
    path: '/auth',
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
        element: <ForgotPasswordForm />,
      },
      {
        path: 'forgot-password-verification',
        element: <ForgotPasswordVerificationForm />,
      },
    ],
  },
]);
