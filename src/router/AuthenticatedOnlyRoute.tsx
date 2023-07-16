import { Navigate, Outlet } from 'react-router';

import { useCognitoAccessTokenFromAppContext } from 'hooks/auth/useCognitoAccessToken';

type AuthenticatedOnlyRouteProps = {
  redirectPath?: string;
};

export const AuthenticatedOnlyRoute = ({ redirectPath = '/auth/login' }: AuthenticatedOnlyRouteProps) => {
  const { tokenVerified, accessToken } = useCognitoAccessTokenFromAppContext();

  if (!tokenVerified) return null;

  return accessToken ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
