import { useEffect, useState } from "react";
import { ArrowRight, Building2, HeartHandshake, LockKeyhole, ShieldCheck, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

type LoginRole = "client" | "employee" | "partner" | "ceo";

type LoginOption = {
  key: LoginRole;
  label: string;
  kicker: string;
  description: string;
  route: string;
  icon: typeof UsersRound;
  tone: "mint" | "orange" | "purple" | "blue";
};

const loginOptions: LoginOption[] = [
  {
    key: "client",
    label: "Client",
    kicker: "Patient portal",
    description: "Follow your care journey, appointments, documents, and next steps.",
    route: "/account",
    icon: UsersRound,
    tone: "mint",
  },
  {
    key: "employee",
    label: "Employee",
    kicker: "Care team workspace",
    description: "Coordinate patient requests, clinic queues, and the next conversation.",
    route: "/employee",
    icon: Stethoscope,
    tone: "orange",
  },
  {
    key: "partner",
    label: "Partner",
    kicker: "Partner workspace",
    description: "Manage clinic relationships, referrals, and connected care pathways.",
    route: "/partner",
    icon: Building2,
    tone: "purple",
  },
  {
    key: "ceo",
    label: "CEO",
    kicker: "Network command",
    description: "See the complete MediMATCH network, performance, and operations.",
    route: "/ceo",
    icon: ShieldCheck,
    tone: "blue",
  },
];

function destination(user: { accountType?: string; role?: string }) {
  if (user.accountType === "admin" || user.role === "admin") return "/ceo";
  if (user.accountType === "partner") return "/partner";
  if (user.accountType === "clinic") return "/employee";
  return "/account";
}

export default function LoginPage() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<LoginRole>("client");
  const selected = loginOptions.find(option => option.key === selectedRole) ?? loginOptions[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) setLocation(destination(auth.user));
  }, [auth.isAuthenticated, auth.user, setLocation]);

  return <div className="auth-page auth-page--multi">
    <header className="auth-masthead">
      <Link href="/" className="auth-brand"><span><HeartHandshake size={19} /></span><strong>MediMATCH</strong></Link>
      <div className="auth-masthead__right"><span><span className="auth-online-dot" /> Secure access</span><a href="mailto:hello@medimatch.health">Need help?</a></div>
    </header>

    <main className="auth-layout">
      <section className="auth-hero">
        <span className="care-eyebrow"><span className="care-live-dot" /> One connected care network</span>
        <h1>The right doorway<br /><em>for every care partner.</em></h1>
        <p>One secure MediMATCH sign-in, four clear workspaces. Choose the doorway that best describes your relationship with the network.</p>
        <div className="auth-hero__proof"><span><LockKeyhole size={15} /> Server-verified permissions</span><span><Sparkles size={15} /> Calm, connected operations</span></div>
        <div className="auth-hero__quote"><span>“</span><p>Good care feels simpler when everyone knows the next step.</p><small>MediMATCH care principle 01</small></div>
      </section>

      <section className="auth-portal" aria-labelledby="login-heading">
        <div className="auth-portal__head"><div><span className="auth-portal__eyebrow">Welcome back</span><h2 id="login-heading">Choose your workspace.</h2></div><span className="auth-portal__secure"><ShieldCheck size={15} /> Protected</span></div>
        <p className="auth-portal__intro">Select your account type to see the right sign-in language. Your permissions are always assigned and verified by MediMATCH.</p>
        <div className="auth-role-grid auth-role-grid--four" role="list" aria-label="MediMATCH account types">
          {loginOptions.map(option => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.key;
            return <button type="button" role="listitem" key={option.key} className={`auth-role-card auth-role-card--${option.tone} ${isSelected ? "is-selected" : ""}`} onClick={() => setSelectedRole(option.key)} aria-pressed={isSelected}>
              <span className="auth-role-card__top"><span className={`auth-role-card__icon auth-role-card__icon--${option.tone}`}><Icon size={20} /></span>{isSelected && <span className="auth-role-card__check"><ShieldCheck size={13} /></span>}</span>
              <span className="auth-role-card__copy"><strong>{option.label}</strong><small>{option.kicker}</small><span>{option.description}</span></span>
              <span className="auth-role-card__arrow"><ArrowRight size={15} /></span>
            </button>;
          })}
        </div>
        <div className="auth-selected-row"><span className={`auth-selected-row__icon auth-role-card__icon--${selected.tone}`}><SelectedIcon size={17} /></span><span><small>Signing in as</small><strong>{selected.label} · {selected.kicker}</strong></span><span className="auth-selected-row__lock"><LockKeyhole size={14} /> Role locked to account</span></div>
        <button type="button" className="auth-submit" onClick={startLogin}>Continue securely <ArrowRight size={16} /></button>
        <p className="auth-portal__note"><ShieldCheck size={14} /> You will continue through MediMATCH secure authentication. Choosing a card never changes your permissions.</p>
        <div className="auth-portal__links"><a href="mailto:hello@medimatch.health?subject=Account%20access%20support">I cannot access my account</a><a href="mailto:partners@medimatch.health?subject=Partner%20access%20request">Request partner access</a></div>
      </section>
    </main>

    <footer className="auth-footer auth-footer--multi"><Link href="/">Back to MediMATCH</Link><span>Private patient portal · Employee operations · Partner network · CEO oversight</span><span>© 2026 MediMATCH</span></footer>
  </div>;
}
