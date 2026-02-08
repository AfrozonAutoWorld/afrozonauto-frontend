import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

/**
 * Hook to get current user from NextAuth session
 * Use this when you need user data
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as User | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    session,
  };
}

/**
 * Lightweight hook to check authentication status
 * Use this when you only need to know if user is logged in
 */
export function useAuth() {
  const { status } = useSession();

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
