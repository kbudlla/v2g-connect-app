import { Navigate, Outlet } from 'react-router';

export const UnauthenticatedOnlyRoute = ({ redirectPath = '/' }) => {
  const tokenVerified = true;
  const accessToken = true;

  if (!tokenVerified) return null;

  return accessToken ? <Navigate to={redirectPath} replace /> : <Outlet />;
};
