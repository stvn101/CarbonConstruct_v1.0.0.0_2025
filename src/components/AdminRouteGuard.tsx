/**
 * AdminRouteGuard - Protects admin routes from unauthorized access
 * CRITICAL SECURITY: Only contact@carbonconstruct.net is allowed admin access
 * This component redirects non-admin users to the home page
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { is_admin: isAdmin, loading: statusLoading } = useSubscriptionStatus();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  // Wait for both auth and subscription status to load before making decision
  const isLoading = authLoading || statusLoading;

  useEffect(() => {
    if (!isLoading) {
      setHasChecked(true);
    }
  }, [isLoading]);

  // Show loading state while checking authentication and admin status
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Verifying access...</span>
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Not admin - redirect to home with no indication admin pages exist
  if (!isAdmin) {
    console.warn(`[AdminRouteGuard] Unauthorized access attempt to ${location.pathname} by user ${user.email}`);
    return <Navigate to="/" replace />;
  }

  // User is admin - render the protected content
  return <>{children}</>;
}

export default AdminRouteGuard;