import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ path, component: Component, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/login" />;
        }

        if (requireAdmin && user.role !== "admin") {
          return <Redirect to="/dashboard" />;
        }

        if (!requireAdmin && user.role === "admin") {
          return <Redirect to="/admin" />;
        }

        return <Component params={params} />;
      }}
    </Route>
  );
}
