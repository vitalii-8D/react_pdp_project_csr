import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { paths } from '../lib/paths';
import { UserRole } from '../enums/user-role.enum';

export function RequireAuth({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={paths.login(location.pathname + location.search)} replace />;
  }

  if (requireAdmin && user.role !== UserRole.ADMIN) {
    return <Navigate to={paths.posts()} replace />;
  }

  return <>{children}</>;
}
