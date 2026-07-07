import { createContext, useContext, ReactNode } from "react";
import { getGetMeQueryKey, useGetMe, useLogout, User } from "@/lib/api-client";
import { clearAuthToken, setAuthToken, getAuthToken } from "@/lib/api-client";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const token = getAuthToken();

  const { data: user, isLoading: isMeLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    },
  });

  const logoutMutation = useLogout();

  const handleLogin = (newToken: string) => {
    setAuthToken(newToken);
    refetch();
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuthToken();
        window.location.href = "/login";
      },
    });
  };

  const value = {
    user: user || null,
    isLoading: !!token && isMeLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
