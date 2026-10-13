import { type ReactNode } from "react";
import { Link } from "wouter";
import { AlertTriangle, ChevronRight, LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import type { Account } from "@workspace/api-client-react";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  useMediMatchAccount,
  useSignOut,
  useStartSignIn,
  workspacePath,
} from "@/lib/account";

type GateCopy = { title: string; copy: string };

/**
 * Shows the right state for a role-protected workspace: checking access,
 * signed out, account error, wrong role, or the workspace itself.
 * Permissions are enforced again by the API on every request.
 */
export function WorkspaceGate({
  allow,
  loadingText,
  signIn,
  denied,
  children,
}: {
  allow: Account["accountType"][];
  loadingText: string;
  signIn: GateCopy;
  denied: GateCopy;
  children: (account: Account) => ReactNode;
}) {
  const state = useMediMatchAccount();
  const startSignIn = useStartSignIn();

  if (state.status === "loading") {
    return (
      <div className="workspace-shell workspace-shell--loading">
        <div className="workspace-loading">{loadingText}</div>
      </div>
    );
  }
  if (state.status === "signed-out") {
    return (
      <div className="workspace-shell workspace-shell--loading">
        <div className="workspace-access-card">
          <LogIn size={24} />
          <h1>{signIn.title}</h1>
          <p>{signIn.copy}</p>
          <button type="button" onClick={startSignIn}>
            Sign in to MediMATCH <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="workspace-shell workspace-shell--loading">
        <div className="workspace-access-card" role="alert">
          <AlertTriangle size={24} />
          <h1>We could not open your account.</h1>
          <p>{apiErrorMessage(state.error)}</p>
          <button type="button" onClick={state.retry}>
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      </div>
    );
  }
  if (!allow.includes(state.account.accountType)) {
    return (
      <div className="workspace-shell workspace-shell--loading">
        <div className="workspace-access-card">
          <ShieldCheck size={24} />
          <h1>{denied.title}</h1>
          <p>{denied.copy}</p>
          <Link href={workspacePath(state.account)}>
            Open your workspace <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }
  return <>{children(state.account)}</>;
}

export function WorkspaceSignOut({ className = "workspace-signout" }: { className?: string }) {
  const signOut = useSignOut();
  return (
    <button type="button" className={className} onClick={signOut}>
      <LogOut size={13} />
      <span>Sign out</span>
    </button>
  );
}
