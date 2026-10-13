import { ArrowRight, Building2, CheckCircle2, ChevronRight, Globe2, HeartHandshake, LogIn, Mail, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function workspaceFor(user: { accountType?: string; role?: string } | null) {
  if (user?.accountType === "admin" || user?.role === "admin") return "/ceo";
  if (user?.accountType === "clinic") return "/employee";
  return "/account";
}

export default function PartnerDashboardPage() {
  const auth = useAuth();
  const isPartner = auth.user?.accountType === "partner";
  const query = trpc.crm.partnerWorkspace.useQuery(undefined, {
    enabled: auth.isAuthenticated && isPartner,
    refetchInterval: 30_000,
  });
  const data = query.data;

  if (auth.loading) return <div className="workspace-shell workspace-shell--loading"><div className="workspace-loading">Checking partner access…</div></div>;
  if (!auth.isAuthenticated) return <div className="workspace-shell workspace-shell--loading"><div className="workspace-access-card"><LogIn size={24} /><h1>Sign in to your partner workspace.</h1><p>Partner referrals, clinic relationships, and connected care resources are protected by account access.</p><button onClick={startLogin}>Sign in to MediMATCH <ChevronRight size={16} /></button></div></div>;
  if (!isPartner) return <div className="workspace-shell workspace-shell--loading"><div className="workspace-access-card"><ShieldCheck size={24} /><h1>Partner access required.</h1><p>Your account is assigned to a different MediMATCH workspace.</p><Link href={workspaceFor(auth.user)}><ArrowRight size={16} /> Open your workspace</Link></div></div>;

  return <div className="workspace-shell workspace-shell--partner">
    <div className="workspace-topbar"><Link href="/" className="workspace-brand"><span><HeartHandshake size={18} /></span><strong>MediMATCH</strong><small>Partner workspace</small></Link><nav><Link className="is-active" href="/partner">Overview</Link><a href="#referrals">Referrals</a><a href="#network">Care network</a><a href="mailto:partners@medimatch.health">Support</a></nav><div className="workspace-user"><Building2 size={14} /> {data?.partner.name || auth.user.name || "Partner account"}</div></div>
    <main className="workspace-main">
      <header className="workspace-hero workspace-hero--partner"><div><span className="care-eyebrow"><span className="care-live-dot" /> Connected partner network</span><h1>Make the next<br /><em>care connection.</em></h1><p>A focused workspace for trusted partners to share referrals, connect patients with the right care team, and keep every introduction moving.</p></div><a href="mailto:partners@medimatch.health?subject=Partner%20referral%20support" className="workspace-primary-button">Contact partner desk <Mail size={16} /></a></header>
      {query.error && <div className="care-alert care-alert--error" role="alert">Unable to load the partner network. Refresh and try again.</div>}
      <section className="workspace-kpi-grid"><article><span className="kpi-icon kpi-icon--blue"><UsersRound size={17} /></span><div><strong>Active</strong><small>Partner access</small></div></article><article><span className="kpi-icon kpi-icon--mint"><CheckCircle2 size={17} /></span><div><strong>{data?.stats.activeClinics ?? "—"}</strong><small>Active clinics</small></div></article><article><span className="kpi-icon kpi-icon--orange"><Building2 size={17} /></span><div><strong>{data?.stats.activeProviders ?? "—"}</strong><small>Care providers</small></div></article><article><span className="kpi-icon kpi-icon--red"><HeartHandshake size={17} /></span><div><strong>{data?.stats.availableSpecialties ?? "—"}</strong><small>Care specialties</small></div></article></section>
      <div className="workspace-grid workspace-grid--patient" id="referrals">
        <section className="workspace-panel"><div className="workspace-panel__head"><div><span className="care-eyebrow">Referral desk</span><h2>Start a connected referral.</h2></div><UsersRound size={20} /></div><p className="partner-panel-copy">Tell the MediMATCH partner desk what your patient or client needs. A coordinator will help route the request to the right clinic and keep you informed.</p><div className="partner-actions"><a href="mailto:partners@medimatch.health?subject=New%20MediMATCH%20referral"><UsersRound size={16} /> Send a referral <ArrowRight size={15} /></a><Link href="/appointments"><Building2 size={16} /> Explore appointment flow <ArrowRight size={15} /></Link></div></section>
        <section className="workspace-panel" id="standards"><div className="workspace-panel__head"><div><span className="care-eyebrow">Partner standards</span><h2>Built around trust.</h2></div><ShieldCheck size={20} /></div><div className="partner-standard-list"><div><CheckCircle2 size={16} /><span><strong>Clear handoffs</strong><small>Every introduction has a visible next step.</small></span></div><div><CheckCircle2 size={16} /><span><strong>Respectful privacy</strong><small>Patient information stays in the right workspace.</small></span></div><div><CheckCircle2 size={16} /><span><strong>Human support</strong><small>Reach the partner desk when a case needs context.</small></span></div></div></section>
      </div>
      <section className="workspace-panel partner-network-panel" id="network"><div className="workspace-panel__head"><div><span className="care-eyebrow"><Globe2 size={14} /> Live network directory</span><h2>Find the right care pathway.</h2></div><span className="workspace-live"><i /> Database connected</span></div>{query.isLoading ? <div className="workspace-loading">Loading active clinics and providers…</div> : data ? <><div className="partner-network-grid">{data.clinics.map(clinic => <article className="partner-network-card" key={clinic.id}><span className="partner-network-card__icon"><MapPin size={16} /></span><div><strong>{clinic.name}</strong><span>{clinic.city}, {clinic.country}</span><small>{clinic.code} · {clinic.timezone}</small></div></article>)}</div><div className="partner-network-subhead"><div><span className="care-eyebrow">Provider directory</span><h3>Active care team</h3></div><span>{data.providers.length} listed</span></div><div className="provider-coverage-grid">{data.providers.map(provider => <article key={provider.id}><span className="provider-coverage__avatar">{provider.name.split(" ").slice(1).map(word => word[0]).join("") || provider.name.slice(0, 1)}</span><div><strong>{provider.name}</strong><span>{provider.specialty}</span><small>{provider.facility} · {provider.languages}</small></div><span className="care-status care-status--confirmed">Active</span></article>)}</div></> : <div className="workspace-empty"><Globe2 size={22} /><strong>No network records available.</strong><span>Contact the partner desk for help with a care connection.</span></div>}</section>
      <section className="workspace-next-actions"><div><span className="care-eyebrow">Partner desk</span><h2>Need help with a live introduction?</h2><p>Our care coordinators can help with referrals, clinic matching, and appointment handoffs.</p></div><div><a className="workspace-primary-button" href="mailto:partners@medimatch.health?subject=Partner%20desk%20callback">Request a callback <ArrowRight size={15} /></a><a href="mailto:partners@medimatch.health">partners@medimatch.health</a></div></section>
    </main>
    <footer className="workspace-footer"><span>MediMATCH partner workspace</span><span>Connected care · Protected access</span></footer>
  </div>;
}
