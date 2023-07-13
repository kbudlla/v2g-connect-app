import { Navigate, Outlet } from 'react-router';

import { useCognitoAccessTokenFromAppContext } from 'hooks/auth/useCognitoAccessToken';

export const UnauthenticatedOnlyRoute = ({ redirectPath = '/' }) => {
  const { tokenVerified, accessToken } = useCognitoAccessTokenFromAppContext();

  if (!tokenVerified) return null;

  return accessToken ? <Navigate to={redirectPath} replace /> : <Outlet />;
};
