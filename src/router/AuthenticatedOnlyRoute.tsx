import { Navigate, Outlet } from 'react-router';

import { useCognitoAccessTokenFromAppContext } from 'hooks/auth/useCognitoAccessToken';

export const AuthenticatedOnlyRoute = ({ redirectPath = '/auth/login' }) => {
  const { tokenVerified, accessToken } = useCognitoAccessTokenFromAppContext();

  if (!tokenVerified) return null;

  return accessToken ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
