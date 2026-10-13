import { useAuth, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import {
  getGetCurrentAccountQueryKey,
  useGetCurrentAccount,
  type Account,
} from "@workspace/api-client-react";

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefix a file in `public/` with the artifact base path. */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

/** Each account type has exactly one home workspace. Roles are assigned on the server. */
export function workspacePath(
  account: Pick<Account, "accountType"> | null | undefined,
) {
  switch (account?.accountType) {
    case "admin":
      return "/ceo";
    case "partner":
      return "/partner";
    case "clinic":
      return "/employee";
    default:
      return "/account";
  }
}

export type AccountState =
  | { status: "loading"; account: null; error: null; retry: () => void }
  | { status: "signed-out"; account: null; error: null; retry: () => void }
  | { status: "error"; account: null; error: unknown; retry: () => void }
  | { status: "ready"; account: Account; error: null; retry: () => void };

/**
 * Combines the Clerk session with the MediMATCH account record (created on
 * first sign-in by GET /api/auth/me).
 */
export function useMediMatchAccount(): AccountState {
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = Boolean(isLoaded && isSignedIn);
  const query = useGetCurrentAccount({
    query: {
      queryKey: getGetCurrentAccountQueryKey(),
      enabled: signedIn,
      staleTime: 30_000,
    },
  });
  const retry = () => {
    void query.refetch();
  };

  if (!isLoaded) return { status: "loading", account: null, error: null, retry };
  if (!signedIn) return { status: "signed-out", account: null, error: null, retry };
  if (query.data) return { status: "ready", account: query.data, error: null, retry };
  if (query.error) return { status: "error", account: null, error: query.error, retry };
  return { status: "loading", account: null, error: null, retry };
}

/** Opens the sign-in page and returns to the current page afterwards. */
export function useStartSignIn() {
  const [, setLocation] = useLocation();
  return () => {
    const returnTo = window.location.href;
    setLocation(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  };
}

export function useSignOut() {
  const { signOut } = useClerk();
  return () => {
    void signOut({ redirectUrl: basePath || "/" });
  };
}
