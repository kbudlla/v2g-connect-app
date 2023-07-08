import { Navigate, Outlet } from 'react-router';

export const AuthenticatedOnlyRoute = ({ redirectPath = '/auth/login' }) => {
  const tokenVerified = true;
  const accessToken = true;

  if (!tokenVerified) return null;

  return accessToken ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
