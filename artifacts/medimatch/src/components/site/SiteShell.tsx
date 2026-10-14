import { type CSSProperties, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Globe2,
  Headphones,
  HeartHandshake,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";

type ProductKey = "hub";

type Theme = {
  name: string;
  eyebrow: string;
  description: string;
  accent: string;
  accentStrong: string;
  wash: string;
  ink: string;
};

const themes: Record<ProductKey, Theme> = {
  hub: {
    name: "MediMATCH",
    eyebrow: "Coordinated care, in one place",
    description:
      "A trusted care navigation system for finding the right doctor, hospital, and next step.",
    accent: "#0866cc",
    accentStrong: "#072f69",
    wash: "#f4f7fb",
    ink: "#102a43",
  },
};

export function StudioMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`studio-mark ${compact ? "studio-mark--compact" : ""}`}
      aria-label="MediMATCH mark"
    >
      <span className="mark-orbit">
        {Array.from({ length: 7 }).map((_, index) => (
          <i
            key={index}
            style={{ transform: `rotate(${index * 51.4}deg) translateY(-8px)` }}
          />
        ))}
      </span>
      {!compact && <strong>MediMATCH</strong>}
    </span>
  );
}

export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "dark" | "light";
}) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </div>
  );
}

export function SiteShell({
  product = "hub",
  children,
  footer = true,
}: {
  product?: ProductKey;
  children: ReactNode;
  footer?: boolean;
}) {
  const theme = themes[product];
  const [location] = useLocation();
  return (
    <div
      className={`site-root site-root--${product}`}
      style={
        {
          "--accent": theme.accent,
          "--accent-strong": theme.accentStrong,
          "--wash": theme.wash,
          "--ink": theme.ink,
        } as CSSProperties
      }
    >
      <div className="ime-utility-bar">
        <div>
          <span>
            <Headphones size={12} /> International patient support
          </span>
          <span>
            <Phone size={12} /> 24/7 care coordination
          </span>
        </div>
        <div>
          <a href="mailto:hello@medimatch.health">
            <Mail size={12} /> hello@medimatch.health
          </a>
          <span className="ime-language-chip" aria-label="Current language: English">
            <Globe2 size={12} /> EN
          </span>
        </div>
      </div>
      <header className="global-bar">
        <Link href="/" className="brand-link" aria-label="MediMATCH home">
          <StudioMark />
        </Link>
        <div className="global-bar__current">
          <span className="current-dot" style={{ background: theme.accent }} />
          <span>{theme.name}</span>
        </div>
        <div className="care-nav-links">
          <Link href="/appointments" className={location === "/appointments" ? "is-active" : ""}>
            <CalendarDays size={14} />
            <span>Appointments</span>
          </Link>
          <Link href="/account" className={location === "/account" ? "is-active" : ""}>
            <Users size={14} />
            <span>Client</span>
          </Link>
          <Link href="/employee" className={location === "/employee" ? "is-active" : ""}>
            <Building2 size={14} />
            <span>Employee</span>
          </Link>
          <Link href="/partner" className={location === "/partner" ? "is-active" : ""}>
            <HeartHandshake size={14} />
            <span>Partner</span>
          </Link>
          <Link href="/ceo" className={location === "/ceo" ? "is-active" : ""}>
            <ShieldCheck size={14} />
            <span>CEO</span>
          </Link>
          <Link
            href="/care-dashboard"
            className={location === "/care-dashboard" ? "is-active" : ""}
          >
            <Stethoscope size={14} />
            <span>Care desk</span>
          </Link>
        </div>
        <a className="ime-partnership" href="mailto:partners@medimatch.health">
          <HeartHandshake size={15} /> <span>Partner with us</span>
        </a>
        <Link href="/" className="overview-link">
          <Stethoscope size={15} />
          <span>MediMATCH home</span>
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <div className="palette-spectrum" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <aside className="ime-float-actions" aria-label="Contact channels">
        <a
          className="ime-float-actions__telegram"
          href="mailto:hello@medimatch.health?subject=Care%20navigation%20callback"
          aria-label="Request a care navigation callback"
        >
          <Send size={18} />
        </a>
        <a
          className="ime-float-actions__viber"
          href="mailto:hello@medimatch.health?subject=Phone%20callback"
          aria-label="Request a phone callback"
        >
          <Phone size={18} />
        </a>
        <a
          className="ime-float-actions__whatsapp"
          href="mailto:hello@medimatch.health?subject=WhatsApp%20callback"
          aria-label="Request a WhatsApp callback"
        >
          <MessageCircle size={19} />
        </a>
        <a
          className="ime-float-actions__chat"
          href="mailto:hello@medimatch.health?subject=Expert%20callback"
          aria-label="Request an expert callback"
        >
          <Video size={18} />
        </a>
      </aside>
      <main>{children}</main>
      {footer && <SiteFooter product={product} />}
    </div>
  );
}

function SiteFooter({ product }: { product: ProductKey }) {
  const theme = themes[product];
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <StudioMark compact />
        <div>
          <strong>{theme.name}</strong>
          <p>{theme.description}</p>
        </div>
      </div>
      <div className="site-footer__links">
        <Link href="/">MediMATCH home</Link>
        <a href="mailto:hello@medimatch.health">Contact</a>
        <a href="mailto:hello@medimatch.health?subject=Support">Support</a>
      </div>
      <span className="site-footer__note">MediMATCH care network · 2026</span>
    </footer>
  );
}
