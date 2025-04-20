import { useConvexAuth } from 'convex/react';
import { Redirect, usePathname } from 'expo-router';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const pathname = usePathname();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={`/login?redirect=${encodeURIComponent(pathname)}`} />;
  }

  return <>{children}</>;
}
