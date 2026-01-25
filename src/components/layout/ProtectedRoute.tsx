import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}