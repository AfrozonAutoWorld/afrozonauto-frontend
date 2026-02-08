import { useSession } from "next-auth/react";
import { User } from "next-auth";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as User | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    session,
  };
}

export function useAuth() {
  const { status } = useSession();

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
