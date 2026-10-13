import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  BadgeCheck,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Download,
  Eye,
  Filter,
  Gift,
  Globe2,
  HeartHandshake,
  Headphones,
  HelpCircle,
  Layers3,
  Leaf,
  LineChart,
  Mail,
  MapPin,
  MessageCircle,
  Megaphone,
  Minus,
  MoreHorizontal,
  Package,
  Palette,
  Phone,
  Plus,
  Quote,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import PatientCarePage from "./pages/PatientCarePage";
import StaffCareDashboard from "./pages/StaffCareDashboard";
import LoginPage from "./pages/LoginPage";
import PatientAccountPage from "./pages/PatientAccountPage";
import ClinicDashboardPage from "./pages/ClinicDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";

type ProductKey = "hub";

type Theme = {
  name: string;
  eyebrow: string;
  description: string;
  path: string;
  accent: string;
  accentStrong: string;
  wash: string;
  ink: string;
  icon: typeof ShieldCheck;
};

const themes: Record<ProductKey, Theme> = {
  hub: {
    name: "MediMATCH",
    eyebrow: "Coordinated care, in one place",
    description: "A trusted care navigation system for finding the right doctor, hospital, and next step.",
    path: "/",
    accent: "#0a66c2",
    accentStrong: "#002d71",
    wash: "#f5f6fa",
    ink: "#002d71",
    icon: ShieldCheck,
  },
};

function StudioMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`studio-mark ${compact ? "studio-mark--compact" : ""}`} aria-label="MediMATCH mark">
      <span className="mark-orbit">
        {Array.from({ length: 7 }).map((_, index) => (
          <i key={index} style={{ transform: `rotate(${index * 51.4}deg) translateY(-8px)` }} />
        ))}
      </span>
      {!compact && <strong>MediMATCH</strong>}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "dark" | "soft";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button type={type} className={`btn btn--${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "dark" | "light" }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

function SectionHeading({
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

function SiteShell({ product, children, footer = true }: { product: ProductKey; children: ReactNode; footer?: boolean }) {
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
        <div><span><Headphones size={12} /> International patient support</span><span><Phone size={12} /> 24/7 care coordination</span></div>
        <div><a href="mailto:hello@medimatch.health"><Mail size={12} /> hello@medimatch.health</a><span className="ime-language-chip" aria-label="Current language: English"><Globe2 size={12} /> EN</span></div>
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
          <Link href="/appointments" className={location === "/appointments" ? "is-active" : ""}><CalendarDays size={14} /><span>Appointments</span></Link>
          <Link href="/account" className={location === "/account" ? "is-active" : ""}><Users size={14} /><span>Client</span></Link>
          <Link href="/employee" className={location === "/employee" ? "is-active" : ""}><Building2 size={14} /><span>Employee</span></Link>
          <Link href="/partner" className={location === "/partner" ? "is-active" : ""}><HeartHandshake size={14} /><span>Partner</span></Link>
          <Link href="/ceo" className={location === "/ceo" ? "is-active" : ""}><ShieldCheck size={14} /><span>CEO</span></Link>
          <Link href="/care-dashboard" className={location === "/care-dashboard" ? "is-active" : ""}><Stethoscope size={14} /><span>Care desk</span></Link>
        </div>
        <a className="ime-partnership" href="mailto:partners@medimatch.health"><HeartHandshake size={15} /> <span>Partner with us</span></a>
        <Link href="/" className="overview-link">
          <Stethoscope size={15} /><span>MediMATCH home</span>
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <div className="palette-spectrum" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <aside className="ime-float-actions" aria-label="Contact channels">
        <a className="ime-float-actions__telegram" href="mailto:hello@medimatch.health?subject=Care%20navigation%20callback" aria-label="Request a care navigation callback"><Send size={18} /></a>
        <a className="ime-float-actions__viber" href="mailto:hello@medimatch.health?subject=Phone%20callback" aria-label="Request a phone callback"><Phone size={18} /></a>
        <a className="ime-float-actions__whatsapp" href="mailto:hello@medimatch.health?subject=WhatsApp%20callback" aria-label="Request a WhatsApp callback"><MessageCircle size={19} /></a>
        <a className="ime-float-actions__chat" href="mailto:hello@medimatch.health?subject=Expert%20callback" aria-label="Request an expert callback"><Video size={18} /></a>
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
        <><a href="mailto:hello@medimatch.health">Contact</a><a href="mailto:hello@medimatch.health?subject=Support">Support</a></>
      </div>
      <span className="site-footer__note">MediMATCH care network · 2026</span>
    </footer>
  );
}

function HeroGlow({ variant = "grid" }: { variant?: "grid" | "orb" | "rings" }) {
  return (
    <div className={`hero-glow hero-glow--${variant}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function Home() {
  const [guideTab, setGuideTab] = useState("conditions");
  const guideCards = {
    conditions: ["Heart health", "Back and neck pain", "Headaches", "Diabetes"],
    treatments: ["Second opinion", "Check-up planning", "Rehabilitation", "Video consultation"],
    tests: ["Blood work", "Imaging", "Genetic screening", "Specialist review"],
  } as const;
  return (
    <SiteShell product="hub" footer={false}>
      <div className="medimatch-home">
        <section className="medimatch-hero">
          <div className="medimatch-hero__backdrop" aria-hidden="true" />
          <div className="medimatch-hero__copy page-pad">
            <Tag tone="light"><span className="live-dot" /> Trusted care coordination</Tag>
            <h1>For a healthier<br /><em>tomorrow.</em></h1>
            <p>Find the right doctor, hospital, and next step with one clear care partner by your side.</p>
            <div className="medimatch-hero__actions"><a className="btn btn--primary" href="#quick-actions">Find your next step <ArrowRight size={16} /></a><a className="medimatch-text-link" href="#about">Meet MediMATCH <ArrowUpRight size={15} /></a></div>
            <div className="medimatch-hero__proof"><span><BadgeCheck size={16} /> 15+ care pathways</span><span><Users size={16} /> International patient support</span><span><Star size={16} fill="currentColor" /> 4.8 patient trust score</span></div>
          </div>
          <div className="medimatch-hero__image"><img src="/medimatch/checkup.jpg" alt="MediMATCH doctor consultation" /><div className="medimatch-hero__image-card"><span className="eyebrow">MediMATCH care desk</span><strong>One conversation.<br />A clearer path forward.</strong><span><span className="pulse-dot pulse-dot--blue" /> Available today · online or in person</span></div></div>
        </section>

        <section className="clinic-quick-actions page-pad" id="quick-actions">
          {[{ icon: Search, title: "Find a doctor", copy: "Search by specialty, language, or location", href: "/appointments?intent=doctor" }, { icon: Building2, title: "Find a facility", copy: "Explore trusted hospitals and care teams", href: "/appointments?intent=facility" }, { icon: ShieldCheck, title: "Get a second opinion", copy: "Bring clarity to an important decision", href: "/appointments?intent=second-opinion" }, { icon: Phone, title: "Request a callback", copy: "Our coordinators will call you back", href: "mailto:hello@medimatch.health?subject=Care%20navigation%20callback" }].map(({ icon: Icon, title, copy, href }) => <a href={href} className="clinic-quick-action" key={title}><span className="clinic-quick-action__icon"><Icon size={21} /></span><span><strong>{title}</strong><small>{copy}</small></span><ChevronRight size={17} /></a>)}
        </section>

        <section className="clinic-section page-pad" id="about">
          <SectionHeading eyebrow="Care that meets you where you are" title="A coordinated system for better decisions." copy="MediMATCH brings doctors, facilities, digital care, and practical guidance into one calm, trustworthy experience." action={<a className="text-link" href="mailto:hello@medimatch.health">Talk to our care desk <ArrowRight size={15} /></a>} />
          <div className="clinic-feature-grid"><article className="clinic-feature-card clinic-feature-card--wide"><img src="/medimatch/care-strip.png" alt="Doctor and family care scene" /><div><span className="eyebrow">A human first system</span><h3>From first question to next appointment.</h3><p>Clear options, warm guidance, and the confidence to move forward.</p></div></article><article className="clinic-feature-card"><div className="clinic-feature-card__icon"><HeartHandshake size={24} /></div><span className="eyebrow">International care</span><h3>Support that travels with you.</h3><p>Language help, appointment coordination, and practical preparation.</p><a className="text-link" href="mailto:international@medimatch.health">International patients <ArrowRight size={15} /></a></article><article className="clinic-feature-card"><div className="clinic-feature-card__icon clinic-feature-card__icon--orange"><Video size={24} /></div><span className="eyebrow">MediMATCH online</span><h3>Speak with a specialist from home.</h3><p>Video consultations that make expert care more accessible.</p><a className="text-link" href="mailto:hello@medimatch.health">Learn about online care <ArrowRight size={15} /></a></article></div>
        </section>

        <section className="clinic-guide page-pad" id="guide"><div className="clinic-guide__head"><div><span className="eyebrow">MediMATCH health guide</span><h2>Useful answers,<br /><em>without the noise.</em></h2></div><a className="text-link" href="#guide">Explore the guide <ArrowUpRight size={15} /></a></div><div className="clinic-guide__tabs">{Object.keys(guideCards).map((tab) => <button key={tab} className={guideTab === tab ? "is-active" : ""} onClick={() => setGuideTab(tab)}>{tab === "conditions" ? "Conditions & symptoms" : tab === "treatments" ? "Treatments" : "Tests & check-ups"}</button>)}</div><div className="clinic-guide__cards">{guideCards[guideTab as keyof typeof guideCards].map((item, index) => <a href="#guide" key={item} className="clinic-guide-card"><span className="clinic-guide-card__number">0{index + 1}</span><span><strong>{item}</strong><small>Read the MediMATCH guide</small></span><ArrowUpRight size={16} /></a>)}</div></section>

        <section className="clinic-locations page-pad" id="locations"><SectionHeading eyebrow="Where care happens" title="Trusted facilities, thoughtfully connected." copy="A growing network of care teams and facilities, selected for experience, safety, and the way they treat people." action={<a className="text-link" href="#locations">View all locations <ArrowRight size={15} /></a>} /><div className="clinic-location-grid"><article className="clinic-location-card clinic-location-card--feature"><img src="/medimatch/online-care.webp" alt="MediMATCH connected care" /><div><span className="eyebrow">Connected care</span><h3>Wherever your care begins, your story stays connected.</h3><p>In-person expertise and online support working as one.</p></div></article><article className="clinic-location-card"><span className="clinic-location-card__pin"><MapPin size={17} /></span><span className="eyebrow">Istanbul · Turkey</span><h3>MediMATCH International Desk</h3><p>Multilingual coordination · 24/7 patient line</p><a className="text-link" href="mailto:hello@medimatch.health">Get directions <ArrowRight size={15} /></a></article><article className="clinic-location-card"><span className="clinic-location-card__pin clinic-location-card__pin--orange"><CalendarDays size={17} /></span><span className="eyebrow">Start here</span><h3>Book a care planning call</h3><p>Tell us what you need and we will map the next step.</p><a className="text-link" href="mailto:hello@medimatch.health">Request a time <ArrowRight size={15} /></a></article></div></section>

        <section className="clinic-trust page-pad"><div><span className="eyebrow">Trust is a practice</span><h2>Good care is<br /><em>felt in the details.</em></h2></div><div className="clinic-trust__copy"><p>“The right next step is easier to take when someone has made the path clear.”</p><span>— MediMATCH care principle 01</span><div className="clinic-trust__stats"><strong>15+</strong><span>care pathways</span><strong>24/7</strong><span>support line</span><strong>01</strong><span>clear next step</span></div></div></section>

        <footer className="hub-footer"><div><StudioMark compact /><span>MediMATCH</span></div><span>Better decisions. Better connected care.</span><a href="mailto:hello@medimatch.health">hello@medimatch.health <ArrowUpRight size={14} /></a></footer>
      </div>
    </SiteShell>
  );
}

function NotFound() { return <SiteShell product="hub"><section className="not-found page-pad"><Tag tone="accent">404</Tag><h1>That page wandered<br /><em>off the path.</em></h1><p>Return to MediMATCH home to choose a care next step.</p><Link href="/" className="btn btn--dark">Back to MediMATCH <ArrowRight size={16} /></Link></section></SiteShell>; }

export default function App() {
  const [location] = useLocation();
  if (location === "/") return <Home />;
  if (location === "/login") return <LoginPage />;
  if (location === "/account") return <PatientAccountPage />;
  if (location === "/employee") return <ClinicDashboardPage />;
  if (location === "/partner") return <PartnerDashboardPage />;
  if (location === "/ceo") return <AdminDashboardPage />;
  if (location === "/clinic") return <ClinicDashboardPage />;
  if (location === "/admin") return <AdminDashboardPage />;
  if (location === "/appointments") return <PatientCarePage />;
  if (location === "/care-dashboard") return <StaffCareDashboard />;
  return <NotFound />;
}
