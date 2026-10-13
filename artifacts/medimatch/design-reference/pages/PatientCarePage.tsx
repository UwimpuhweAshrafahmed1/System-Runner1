import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, HeartHandshake, LogIn, Phone, ShieldCheck, Stethoscope, Video, X } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useAppointmentLiveRefresh } from "./careLive";
import NotificationPreferencesPanel from "./NotificationPreferencesPanel";

function isoDateKey(date: Date) { return date.toISOString().slice(0, 10); }
function initialCareDate() { const cursor = new Date(); for (let index = 0; index < 7; index += 1) { const weekday = cursor.getUTCDay(); if (weekday !== 0 && weekday !== 6) return isoDateKey(cursor); cursor.setUTCDate(cursor.getUTCDate() + 1); } return isoDateKey(new Date()); }
function addDays(date: Date, amount: number) { const next = new Date(date); next.setUTCDate(next.getUTCDate() + amount); return next; }
function formatDay(key: string) { return new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }); }
function formatTime(value: string | Date) { return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }); }
function formatAppointmentDate(value: string | Date) { return new Date(value).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }); }
function statusLabel(status: string) { return status.replace("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()); }
function statusTone(status: string) { return status === "confirmed" ? "confirmed" : status === "completed" ? "completed" : status === "cancelled" ? "cancelled" : status === "checked_in" ? "checked-in" : "pending"; }

export default function PatientCarePage() {
  const auth = useAuth();
  const liveStatus = useAppointmentLiveRefresh(auth.isAuthenticated);
  const providersQuery = trpc.care.providers.useQuery();
  const isPatient = auth.user?.accountType === "patient";
  const mineQuery = trpc.care.mine.useQuery(undefined, { enabled: auth.isAuthenticated && isPatient, refetchInterval: 12_000 });
  const utils = trpc.useUtils();
  const [providerId, setProviderId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState(initialCareDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [channel, setChannel] = useState<"video" | "phone" | "in_person">("video");
  const [treatmentName, setTreatmentName] = useState("General consultation");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [reason, setReason] = useState("");
  const [recommendationMode, setRecommendationMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const intent = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("intent");
    if (intent === "second-opinion") {
      setTreatmentName("Second opinion");
      setRecommendationMode(true);
    } else if (intent === "facility") {
      setRecommendationMode(true);
    }
  }, []);

  useEffect(() => { if (!providerId && providersQuery.data?.length) setProviderId(providersQuery.data[0].id); }, [providerId, providersQuery.data]);
  const dateOptions = useMemo(() => Array.from({ length: 8 }, (_, index) => isoDateKey(addDays(new Date(), index))), []);
  const slotsQuery = trpc.care.slots.useQuery({ providerId: providerId ?? 0, from: selectedDate, to: selectedDate }, { enabled: Boolean(providerId) && !recommendationMode, refetchInterval: 12_000 });
  const selectedProvider = providersQuery.data?.find(provider => provider.id === providerId);
  const availableSlots = slotsQuery.data?.[0]?.slots ?? [];
  const bookMutation = trpc.care.book.useMutation({
    onSuccess: async () => { setSelectedSlot(null); setReason(""); setNotice("Your appointment request is in the live care queue. A coordinator will confirm it shortly."); setError(null); await Promise.all([mineQuery.refetch(), slotsQuery.refetch(), utils.care.staffQueue.invalidate()]); },
    onError: mutationError => setError(mutationError.message),
  });
  const recommendationMutation = trpc.care.requestRecommendation.useMutation({
    onSuccess: result => { setNotice(`Recommendation request ${result.leadCode} received. A MediMATCH coordinator will match you with the right clinic.`); setError(null); setReason(""); },
    onError: mutationError => setError(mutationError.message),
  });
  const cancelMutation = trpc.care.cancel.useMutation({
    onSuccess: async () => { setNotice("Appointment cancelled. The slot is available to other patients again."); await Promise.all([mineQuery.refetch(), slotsQuery.refetch()]); },
    onError: mutationError => setError(mutationError.message),
  });

  const handleSubmit = () => {
    if (!auth.isAuthenticated) { startLogin(); return; }
    if (!isPatient) { setError("A Client account is required to submit a patient booking. Open your assigned workspace instead."); return; }
    if (recommendationMode) {
      setNotice(null); setError(null);
      recommendationMutation.mutate({ treatmentName, phone: phone.trim() || undefined, country: country.trim() || undefined, reason: reason.trim() || undefined });
      return;
    }
    if (!providerId || !selectedSlot) { setError("Choose a provider and available time first."); return; }
    setNotice(null); setError(null);
    bookMutation.mutate({ providerId, startsAt: selectedSlot, channel, treatmentName, phone: phone.trim() || undefined, country: country.trim() || undefined, reason: reason.trim() || undefined });
  };

  const upcoming = mineQuery.data?.filter(row => row.appointment.status !== "cancelled" && new Date(row.appointment.startsAt) >= new Date()) ?? [];
  const past = mineQuery.data?.filter(row => row.appointment.status === "completed" || new Date(row.appointment.startsAt) < new Date()) ?? [];
  return <div className="care-portal">
    <div className="care-utility"><span><Phone size={13} /> 24/7 care coordination</span><span><ShieldCheck size={13} /> Private patient portal</span><span className="care-utility__right">MediMATCH time · UTC</span></div>
    <header className="care-header"><Link href="/" className="care-brand"><span className="care-brand__mark"><HeartHandshake size={19} /></span><span><strong>MediMATCH</strong><small>Connected care</small></span></Link><nav><Link href="/">Overview</Link><Link className="is-active" href="/appointments">Appointments</Link><Link href="/account">Patient portal</Link><Link href="/care-dashboard">Care desk</Link></nav><div className="care-header__actions">{auth.isAuthenticated ? <span className="care-user">{auth.user?.name || auth.user?.email || "Patient"}</span> : <button className="care-sign-in" onClick={startLogin}><LogIn size={15} /> Sign in</button>}</div></header>
    <main>
      <section className="care-hero"><div className="care-hero__copy"><span className="care-eyebrow"><span className="care-live-dot" /> CRM-ready appointment desk</span><h1>Care that fits<br /><em>your next step.</em></h1><p>Choose a trusted MediMATCH provider, reserve a time, and keep every care conversation connected to your patient record.</p><div className="care-hero__trust"><span><ShieldCheck size={15} /> Verified providers</span><span><Clock3 size={15} /> 30-minute slots</span><span><Video size={15} /> Video or in-person</span></div></div><div className="care-hero__card"><div className="care-hero__card-icon"><CalendarDays size={22} /></div><strong>Book in a few minutes.</strong><span>Availability updates live as the care team responds.</span><Link href="#book">Find a time <ArrowRight size={15} /></Link></div></section>
      <div className="care-page-grid" id="book">
        <section className="care-panel care-panel--booking"><div className="care-panel__head"><div><span className="care-eyebrow">01 · Choose your care partner</span><h2>Find an available provider.</h2></div><span className={`care-connection care-connection--${liveStatus}`}><i /> {liveStatus === "live" ? "Live updates" : liveStatus === "offline" ? "Sign in for live updates" : "Reconnecting"}</span></div>
          {providersQuery.isLoading ? <div className="care-loading">Loading trusted providers…</div> : providersQuery.error ? <div className="care-error">Unable to load providers. Refresh and try again.</div> : <div className="care-provider-list">{providersQuery.data?.map(provider => <button key={provider.id} className={`care-provider ${provider.id === providerId ? "is-selected" : ""}`} onClick={() => { setProviderId(provider.id); setSelectedSlot(null); setRecommendationMode(false); }}><span className="care-provider__avatar">{provider.name.split(" ").slice(1).map(word => word[0]).join("")}</span><span className="care-provider__copy"><strong>{provider.name}</strong><small>{provider.specialty} · {provider.facility}</small><em>{provider.languages}</em></span><ChevronRight size={17} /></button>)}</div>}
          <div className="care-recommendation-toggle"><span><strong>Not sure which clinic is right?</strong><small>MediMATCH can create a recommendation lead for your care team.</small></span><button className={recommendationMode ? "is-active" : ""} onClick={() => { setRecommendationMode(value => !value); setSelectedSlot(null); }}>{recommendationMode ? "Choose a provider" : "Recommend for me"}</button></div>
          {!recommendationMode && <><div className="care-date-heading"><div><span className="care-eyebrow">02 · Select a time</span><h2>{selectedProvider?.name ?? "Provider"} availability</h2></div><span className="care-timezone">All times shown in UTC</span></div><div className="care-date-strip">{dateOptions.map(date => <button key={date} className={selectedDate === date ? "is-selected" : ""} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}><small>{formatDay(date).split(" ")[0]}</small><strong>{new Date(`${date}T00:00:00Z`).getUTCDate()}</strong><span>{new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })}</span></button>)}</div>{slotsQuery.error ? <div className="care-error" role="alert">Unable to refresh availability. Choose another date or try again.</div> : slotsQuery.isFetching && <div className="care-inline-status">Refreshing live availability…</div>}<div className="care-slot-grid">{availableSlots.length ? availableSlots.map(slot => <button key={slot} className={`care-slot ${selectedSlot === slot ? "is-selected" : ""}`} onClick={() => setSelectedSlot(slot)}><Clock3 size={15} /> {formatTime(slot)}</button>) : <div className="care-empty"><CalendarDays size={21} /><strong>No open slots on this day.</strong><span>Choose another day or provider to keep moving.</span></div>}</div></>}
        </section>
        <aside className="care-panel care-panel--form"><div className="care-panel__head"><div><span className="care-eyebrow">03 · Request details</span><h2>{recommendationMode ? "Tell us what you need." : "Make it yours."}</h2></div><Stethoscope size={22} className="care-panel__icon" /></div>{recommendationMode ? <div className="care-selection care-selection--recommendation"><HeartHandshake size={18} /><span>MediMATCH will match your request with the right clinic and provider.</span></div> : selectedSlot && selectedProvider ? <div className="care-selection"><strong>{formatAppointmentDate(selectedSlot)}</strong><span>{formatTime(selectedSlot)} · {selectedProvider.name}</span></div> : <div className="care-selection care-selection--empty"><CalendarDays size={18} /><span>Select an available time to continue.</span></div>}<label className="care-field"><span>Treatment or care request</span><select value={treatmentName} onChange={event => setTreatmentName(event.target.value)}><option>General consultation</option><option>Dental treatment</option><option>Hair restoration</option><option>Skin and aesthetics</option><option>Orthopaedic care</option><option>Women’s health</option><option>Second opinion</option></select></label><div className="care-field-row"><label className="care-field"><span>Phone <small>Optional</small></span><input value={phone} onChange={event => setPhone(event.target.value)} placeholder="+44 20…" /></label><label className="care-field"><span>Country <small>Optional</small></span><input value={country} onChange={event => setCountry(event.target.value)} placeholder="United Kingdom" /></label></div>{!recommendationMode && <label className="care-field"><span>Consultation channel</span><select value={channel} onChange={event => setChannel(event.target.value as typeof channel)}><option value="video">Video consultation</option><option value="phone">Phone consultation</option><option value="in_person">In-person appointment</option></select></label>}<label className="care-field"><span>Notes for the care coordinator <small>Optional</small></span><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} placeholder="Keep this high-level. Please do not include sensitive clinical details here." /></label>{error && <div className="care-alert care-alert--error" role="alert"><X size={16} /> {error}</div>}{notice && <div className="care-alert care-alert--success" role="status"><CheckCircle2 size={16} /> {notice}</div>}<button className="care-primary-button" disabled={bookMutation.isPending || recommendationMutation.isPending || (!recommendationMode && !selectedSlot) || (auth.isAuthenticated && !isPatient)} onClick={handleSubmit}>{!auth.isAuthenticated ? "Sign in to continue" : !isPatient ? "Client account required" : bookMutation.isPending || recommendationMutation.isPending ? "Saving…" : recommendationMode ? "Request recommendation" : "Request appointment"}<ArrowRight size={16} /></button><small className="care-form-note">By continuing, you agree that MediMATCH may use your account details to create a patient record and coordinate this request. This is a scheduling service, not emergency care.</small></aside>
      </div>
      <section className="care-history"><div className="care-section-heading"><div><span className="care-eyebrow">Your care timeline</span><h2>Appointments, in one view.</h2></div><span className="care-connection care-connection--polling"><i /> Refreshed every 12 seconds</span></div>{!auth.isAuthenticated ? <div className="care-login-card"><LogIn size={22} /><div><strong>Sign in to see your care timeline.</strong><span>Booking and consultation records are private to your account.</span></div><button onClick={startLogin}>Sign in <ArrowRight size={15} /></button></div> : !isPatient ? <div className="care-login-card"><ShieldCheck size={22} /><div><strong>This timeline is for Client accounts.</strong><span>Your role has a different MediMATCH workspace.</span></div><Link href="/login">Open role sign in <ArrowRight size={15} /></Link></div> : mineQuery.error ? <div className="care-error" role="alert">Unable to load your care timeline. Refresh and try again.</div> : mineQuery.isLoading ? <div className="care-loading">Loading your care timeline…</div> : <div className="care-appointment-list">{upcoming.length ? upcoming.map(row => <article className="care-appointment-card" key={row.appointment.id}><div className="care-appointment-card__date"><small>{new Date(row.appointment.startsAt).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })}</small><strong>{new Date(row.appointment.startsAt).getUTCDate()}</strong></div><div className="care-appointment-card__body"><div className="care-appointment-card__top"><div><span className="care-eyebrow">{row.provider.specialty}</span><h3>{row.provider.name}</h3></div><span className={`care-status care-status--${statusTone(row.appointment.status)}`}>{statusLabel(row.appointment.status)}</span></div><p>{formatTime(row.appointment.startsAt)} · {row.appointment.channel === "video" ? "Video consultation" : row.appointment.channel === "phone" ? "Phone consultation" : "In-person appointment"} · {row.provider.facility}</p>{row.appointment.status === "pending" || row.appointment.status === "confirmed" ? <button className="care-cancel" onClick={() => cancelMutation.mutate({ appointmentId: row.appointment.id })} disabled={cancelMutation.isPending}>Cancel appointment</button> : null}</div></article>) : <div className="care-empty care-empty--wide"><CalendarDays size={24} /><strong>No upcoming appointments yet.</strong><span>Choose a provider above to reserve your first care conversation.</span></div>}{past.length > 0 && <div className="care-past-list"><span className="care-eyebrow">Completed consultations</span>{past.filter(row => row.appointment.status === "completed").map(row => <article key={row.appointment.id} className="care-past-card"><div><strong>{row.provider.name}</strong><span>{formatAppointmentDate(row.appointment.startsAt)}</span></div><div>{row.consultation?.patientSummary ? <><span>{row.consultation.patientSummary}</span>{row.consultation.nextSteps && <small>Next steps: {row.consultation.nextSteps}</small>}</> : <span>Your summary will appear here when the care team completes the consultation.</span>}</div></article>)}</div>}</div>}</section>
      {auth.isAuthenticated && isPatient && <NotificationPreferencesPanel isStaff={auth.user?.accountType === "clinic" || auth.user?.role === "admin"} />}
    </main>
    <footer className="care-footer"><div><strong>MediMATCH</strong><span>Connected care, with a clearer next step.</span></div><div><Link href="/">Overview</Link><Link href="/account">Patient portal</Link><Link href="/care-dashboard">Staff care desk</Link><a href="mailto:hello@medimatch.health">Contact coordination</a></div></footer>
  </div>;
}
