import { Navigate, Outlet } from 'react-router';

import { useCognitoAccessTokenFromAppContext } from 'hooks/auth/useCognitoAccessToken';

type UnauthenticatedOnlyRouteProps = {
  redirectPath?: string;
};

export const UnauthenticatedOnlyRoute = ({ redirectPath = '/' }: UnauthenticatedOnlyRouteProps) => {
  const { tokenVerified, accessToken } = useCognitoAccessTokenFromAppContext();

  if (!tokenVerified) return null;

  return accessToken ? <Navigate to={redirectPath} replace /> : <Outlet />;
};
