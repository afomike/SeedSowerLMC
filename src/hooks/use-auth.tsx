import { createContext, useContext, ReactNode, useEffect } from "react";
import { getGetMeQueryKey, useGetMe, useLogout, User } from "@/lib/api-client";
import { clearAuthToken, setAuthToken, getAuthToken } from "@/lib/api-client";
import { useLocation } from "wouter";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

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

  const handleLogout = (reason: "manual" | "inactivity" = "manual") => {
    const message =
      reason === "inactivity"
        ? "You have been inactive for 15 minutes. Would you like to sign out now?"
        : "You are about to sign out. Continue?";

    if (typeof window !== "undefined" && !window.confirm(message)) {
      return false;
    }

    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    });

    return true;
  };

  useEffect(() => {
    if (!token) return;

    let timerId: number | undefined;

    const resetTimer = () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }

      timerId = window.setTimeout(() => {
        handleLogout("inactivity");
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [token]);

  const handleLogin = (newToken: string) => {
    setAuthToken(newToken);
    refetch();
  };

  const value = {
    user: user || null,
    isLoading: !!token && isMeLoading,
    login: handleLogin,
    logout: () => handleLogout("manual"),
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
