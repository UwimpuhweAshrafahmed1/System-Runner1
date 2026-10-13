import { type ReactNode } from "react";
import { SignIn, SignUp } from "@clerk/react";
import { Link } from "wouter";
import { HeartHandshake, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { basePath } from "@/lib/account";

// After signing in without a specific return page, /login routes each
// account to the workspace it is assigned to.
const afterAuthUrl = `${basePath}/login`;

function AuthFrame({
  eyebrow,
  title,
  accent,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page auth-page--multi">
      <header className="auth-masthead">
        <Link href="/" className="auth-brand">
          <span>
            <HeartHandshake size={19} />
          </span>
          <strong>MediMATCH</strong>
        </Link>
        <div className="auth-masthead__right">
          <span>
            <span className="auth-online-dot" /> Secure access
          </span>
          <a href="mailto:hello@medimatch.health">Need help?</a>
        </div>
      </header>

      <main className="auth-layout auth-layout--clerk">
        <section className="auth-hero">
          <span className="care-eyebrow">
            <span className="care-live-dot" /> {eyebrow}
          </span>
          <h1>
            {title}
            <br />
            <em>{accent}</em>
          </h1>
          <p>{copy}</p>
          <div className="auth-hero__proof">
            <span>
              <LockKeyhole size={15} /> Server-verified permissions
            </span>
            <span>
              <Sparkles size={15} /> Calm, connected operations
            </span>
          </div>
          <div className="auth-hero__quote">
            <span>“</span>
            <p>Good care feels simpler when everyone knows the next step.</p>
            <small>MediMATCH care principle 01</small>
          </div>
        </section>

        <section className="auth-clerk-slot">
          {children}
          <p className="auth-clerk-slot__note">
            <ShieldCheck size={14} /> Your workspace is assigned by MediMATCH. New accounts start in
            the patient portal.
          </p>
        </section>
      </main>

      <footer className="auth-footer auth-footer--multi">
        <Link href="/">Back to MediMATCH</Link>
        <span>Private patient portal · Employee operations · Partner network · CEO oversight</span>
        <span>© 2026 MediMATCH</span>
      </footer>
    </div>
  );
}

export function SignInPage() {
  return (
    <AuthFrame
      eyebrow="One connected care network"
      title="Welcome back"
      accent="to connected care."
      copy="Sign in once to reach your patient portal, care team workspace, partner desk, or network view."
    >
      {/* path must be the full browser path — Clerk reads window.location.pathname directly */}
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={afterAuthUrl}
      />
    </AuthFrame>
  );
}

export function SignUpPage() {
  return (
    <AuthFrame
      eyebrow="Join the MediMATCH network"
      title="Start with"
      accent="one clear account."
      copy="Create your account to request appointments, follow your care journey, and keep every conversation connected."
    >
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={afterAuthUrl}
      />
    </AuthFrame>
  );
}
