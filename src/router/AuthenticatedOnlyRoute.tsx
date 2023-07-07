import { Navigate, Outlet } from 'react-router';

export const AuthenticatedOnlyRoute = ({ redirectPath = '/home' }) => {
  const tokenVerified = true;
  const accessToken = false;

  if (!tokenVerified) return null;

  return accessToken ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
