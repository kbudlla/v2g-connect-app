import { Navigate, Outlet } from 'react-router';

export const UnauthenticatedOnlyRoute = ({ redirectPath = '/home' }) => {
  const tokenVerified = true;
  const accessToken = false;

  if (!tokenVerified) return null;

  return accessToken ? <Navigate to={redirectPath} replace /> : <Outlet />;
};
