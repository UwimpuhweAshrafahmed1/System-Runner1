import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  LogIn,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  Video,
  X,
} from "lucide-react";
import {
  getGetDashboardQueryKey,
  useCreateAppointment,
  useGetDashboard,
  useListProviders,
  useUpdateAppointmentStatus,
  type Appointment,
  type AppointmentInputChannel,
  type Provider,
} from "@workspace/api-client-react";
import { apiErrorMessage } from "@/lib/api-errors";
import { useMediMatchAccount, useSignOut, useStartSignIn } from "@/lib/account";
import { careTreatments, carePreferencesNote, treatmentBySlug } from "@/lib/treatments";
import {
  addDays,
  channelLabel,
  formatDay,
  formatLongDate,
  formatTime,
  initialCareDate,
  isWeekend,
  isoDateKey,
  providerInitials,
  statusLabel,
  statusTone,
} from "@/lib/format";

const SLOT_MINUTES = 30;
const FIRST_SLOT_HOUR = 9;
const LAST_SLOT_HOUR = 17;

/** Open 30-minute slots (UTC) on weekdays between 09:00 and 17:00, future only. */
function slotsForDay(key: string, now: Date) {
  if (isWeekend(key)) return [];
  const slots: string[] = [];
  for (let minutes = FIRST_SLOT_HOUR * 60; minutes < LAST_SLOT_HOUR * 60; minutes += SLOT_MINUTES) {
    const start = new Date(`${key}T00:00:00Z`);
    start.setUTCMinutes(minutes);
    if (start > now) slots.push(start.toISOString());
  }
  return slots;
}

function recommendationMailto(input: {
  treatmentName: string;
  phone: string;
  country: string;
  reason: string;
}) {
  const lines = [
    "Hello MediMATCH care desk,",
    "",
    "Please recommend the right clinic and provider for me.",
    "",
    `Care request: ${input.treatmentName}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.country ? `Country: ${input.country}` : null,
    input.reason ? `Notes: ${input.reason}` : null,
  ].filter((line): line is string => line !== null);
  return `mailto:hello@medimatch.health?subject=${encodeURIComponent(
    "Clinic recommendation request",
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export default function PatientCarePage() {
  const accountState = useMediMatchAccount();
  const startSignIn = useStartSignIn();
  const signOut = useSignOut();
  const queryClient = useQueryClient();
  const account = accountState.account;
  const isSignedIn = accountState.status === "ready" || accountState.status === "error";
  const isPatient = account?.accountType === "patient";

  const providersQuery = useListProviders();
  const mineQuery = useGetDashboard({
    query: {
      queryKey: getGetDashboardQueryKey(),
      enabled: isPatient,
      refetchInterval: 12_000,
    },
  });

  const [providerId, setProviderId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState(initialCareDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [channel, setChannel] = useState<AppointmentInputChannel>("video");
  const [treatmentName, setTreatmentName] = useState("General consultation");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [reason, setReason] = useState("");
  const [recommendationMode, setRecommendationMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent");
    if (intent === "second-opinion") {
      setTreatmentName("Second opinion");
      setRecommendationMode(true);
    } else if (intent === "facility") {
      setRecommendationMode(true);
    }
    // Choices made on the homepage (treatment, destination, language).
    const treatment = treatmentBySlug(params.get("treatment"));
    if (treatment) setTreatmentName(treatment.name);
    const preferences = carePreferencesNote(params);
    if (preferences) setReason(preferences);
  }, []);

  useEffect(() => {
    if (!providerId && providersQuery.data?.length) setProviderId(providersQuery.data[0].id);
  }, [providerId, providersQuery.data]);

  const dateOptions = useMemo(
    () => Array.from({ length: 8 }, (_, index) => isoDateKey(addDays(new Date(), index))),
    [],
  );
  const selectedProvider = providersQuery.data?.find((provider) => provider.id === providerId);
  const myAppointments = mineQuery.data?.appointments ?? [];
  // A patient cannot hold two active appointments at the same time.
  const myActiveTimes = new Set(
    myAppointments
      .filter((row) => row.status !== "cancelled")
      .map((row) => new Date(row.startsAt).toISOString()),
  );
  const availableSlots = slotsForDay(selectedDate, new Date()).filter(
    (slot) => !myActiveTimes.has(slot),
  );

  const refreshTimeline = () =>
    queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });

  const bookMutation = useCreateAppointment({
    mutation: {
      onSuccess: async () => {
        setSelectedSlot(null);
        setReason("");
        setNotice(
          "Your appointment request is in the care queue. A coordinator will confirm it shortly.",
        );
        setError(null);
        await refreshTimeline();
      },
      onError: (mutationError) => setError(apiErrorMessage(mutationError)),
    },
  });
  const cancelMutation = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: async () => {
        setError(null);
        setNotice("Appointment cancelled. The slot is available to other patients again.");
        await refreshTimeline();
      },
      onError: (mutationError) => setError(apiErrorMessage(mutationError)),
    },
  });

  const handleSubmit = () => {
    if (recommendationMode) {
      setError(null);
      window.location.href = recommendationMailto({
        treatmentName,
        phone: phone.trim(),
        country: country.trim(),
        reason: reason.trim(),
      });
      setNotice(
        "Your email app should open with this request filled in. Send it and a MediMATCH coordinator will reply with a recommendation.",
      );
      return;
    }
    if (!isSignedIn) {
      startSignIn();
      return;
    }
    if (!account) {
      setError(apiErrorMessage(accountState.error));
      return;
    }
    if (!isPatient) {
      setError(
        "A Client account is required to submit a patient booking. Open your assigned workspace instead.",
      );
      return;
    }
    if (!providerId || !selectedSlot) {
      setError("Choose a provider and available time first.");
      return;
    }
    setNotice(null);
    setError(null);
    bookMutation.mutate({
      data: {
        providerId,
        startsAt: selectedSlot,
        channel,
        treatmentName,
        patientName: account.name,
        patientEmail: account.email,
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        reason: reason.trim() || undefined,
      },
    });
  };

  const providerById = new Map<number, Provider>(
    [...(providersQuery.data ?? []), ...(mineQuery.data?.providers ?? [])].map((provider) => [
      provider.id,
      provider,
    ]),
  );
  const now = new Date();
  const upcoming = myAppointments
    .filter((row) => row.status !== "cancelled" && new Date(row.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const completed = myAppointments.filter((row) => row.status === "completed");

  const submitLabel = recommendationMode
    ? "Email my request"
    : !isSignedIn
      ? "Sign in to continue"
      : account && !isPatient
        ? "Client account required"
        : bookMutation.isPending
          ? "Saving…"
          : "Request appointment";
  const submitDisabled =
    !recommendationMode &&
    (bookMutation.isPending ||
      !selectedSlot ||
      accountState.status === "loading" ||
      Boolean(account && !isPatient));

  return (
    <div className="care-portal">
      <div className="care-utility">
        <span>
          <Phone size={13} /> 24/7 care coordination
        </span>
        <span>
          <ShieldCheck size={13} /> Private patient portal
        </span>
        <span className="care-utility__right">MediMATCH time · UTC</span>
      </div>
      <header className="care-header">
        <Link href="/" className="care-brand">
          <span className="care-brand__mark">
            <HeartHandshake size={19} />
          </span>
          <span>
            <strong>MediMATCH</strong>
            <small>Connected care</small>
          </span>
        </Link>
        <nav>
          <Link href="/">Overview</Link>
          <Link className="is-active" href="/appointments">
            Appointments
          </Link>
          <Link href="/account">Patient portal</Link>
          <Link href="/care-dashboard">Care desk</Link>
        </nav>
        <div className="care-header__actions">
          {accountState.status === "loading" ? null : isSignedIn ? (
            <>
              <span className="care-user">{account?.name || account?.email || "Patient"}</span>
              <button type="button" className="care-signout" onClick={signOut}>
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <button className="care-sign-in" onClick={startSignIn}>
              <LogIn size={15} /> Sign in
            </button>
          )}
        </div>
      </header>
      <main>
        <section className="care-hero">
          <div className="care-hero__copy">
            <span className="care-eyebrow">
              <span className="care-live-dot" /> CRM-ready appointment desk
            </span>
            <h1>
              Care that fits
              <br />
              <em>your next step.</em>
            </h1>
            <p>
              Choose a trusted MediMATCH provider, reserve a time, and keep every care conversation
              connected to your patient record.
            </p>
            <div className="care-hero__trust">
              <span>
                <ShieldCheck size={15} /> Verified providers
              </span>
              <span>
                <Clock3 size={15} /> 30-minute slots
              </span>
              <span>
                <Video size={15} /> Video or in-person
              </span>
            </div>
          </div>
          <div className="care-hero__card">
            <div className="care-hero__card-icon">
              <CalendarDays size={22} />
            </div>
            <strong>Book in a few minutes.</strong>
            <span>Your timeline updates as the care team responds.</span>
            <a href="#book">
              Find a time <ArrowRight size={15} />
            </a>
          </div>
        </section>
        <div className="care-page-grid" id="book">
          <section className="care-panel care-panel--booking">
            <div className="care-panel__head">
              <div>
                <span className="care-eyebrow">01 · Choose your care partner</span>
                <h2>Find an available provider.</h2>
              </div>
              <span
                className={`care-connection care-connection--${isPatient ? "polling" : "offline"}`}
              >
                <i /> {isPatient ? "Refreshed every 12 seconds" : "Sign in for live updates"}
              </span>
            </div>
            {providersQuery.isLoading ? (
              <div className="care-loading">Loading trusted providers…</div>
            ) : providersQuery.error ? (
              <div className="care-error" role="alert">
                Unable to load providers: {apiErrorMessage(providersQuery.error)}
              </div>
            ) : providersQuery.data?.length ? (
              <div className="care-provider-list">
                {providersQuery.data.map((provider) => (
                  <button
                    key={provider.id}
                    className={`care-provider ${provider.id === providerId ? "is-selected" : ""}`}
                    onClick={() => {
                      setProviderId(provider.id);
                      setSelectedSlot(null);
                      setRecommendationMode(false);
                    }}
                  >
                    <span className="care-provider__avatar">{providerInitials(provider.name)}</span>
                    <span className="care-provider__copy">
                      <strong>{provider.name}</strong>
                      <small>
                        {provider.specialty} · {provider.facility}
                      </small>
                      <em>{provider.languages}</em>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="care-empty care-empty--wide">
                <Stethoscope size={21} />
                <strong>No providers are listed yet.</strong>
                <span>Ask MediMATCH to recommend the right clinic for you.</span>
              </div>
            )}
            <div className="care-recommendation-toggle">
              <span>
                <strong>Not sure which clinic is right?</strong>
                <small>MediMATCH can recommend the right clinic and provider for you.</small>
              </span>
              <button
                className={recommendationMode ? "is-active" : ""}
                onClick={() => {
                  setRecommendationMode((value) => !value);
                  setSelectedSlot(null);
                  setNotice(null);
                  setError(null);
                }}
              >
                {recommendationMode ? "Choose a provider" : "Recommend for me"}
              </button>
            </div>
            {!recommendationMode && (
              <>
                <div className="care-date-heading">
                  <div>
                    <span className="care-eyebrow">02 · Select a time</span>
                    <h2>{selectedProvider?.name ?? "Provider"} availability</h2>
                  </div>
                  <span className="care-timezone">All times shown in UTC</span>
                </div>
                <div className="care-date-strip">
                  {dateOptions.map((date) => (
                    <button
                      key={date}
                      className={selectedDate === date ? "is-selected" : ""}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                    >
                      <small>{formatDay(date).split(" ")[0]}</small>
                      <strong>{new Date(`${date}T00:00:00Z`).getUTCDate()}</strong>
                      <span>
                        {new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="care-slot-grid">
                  {selectedProvider && availableSlots.length ? (
                    availableSlots.map((slot) => (
                      <button
                        key={slot}
                        className={`care-slot ${selectedSlot === slot ? "is-selected" : ""}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock3 size={15} /> {formatTime(slot)}
                      </button>
                    ))
                  ) : (
                    <div className="care-empty">
                      <CalendarDays size={21} />
                      <strong>No open slots on this day.</strong>
                      <span>Choose another day or provider to keep moving.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
          <aside className="care-panel care-panel--form">
            <div className="care-panel__head">
              <div>
                <span className="care-eyebrow">03 · Request details</span>
                <h2>{recommendationMode ? "Tell us what you need." : "Make it yours."}</h2>
              </div>
              <Stethoscope size={22} className="care-panel__icon" />
            </div>
            {recommendationMode ? (
              <div className="care-selection care-selection--recommendation">
                <HeartHandshake size={18} />
                <span>
                  MediMATCH will match your request with the right clinic and provider. This opens
                  an email to the care desk with your details filled in.
                </span>
              </div>
            ) : selectedSlot && selectedProvider ? (
              <div className="care-selection">
                <strong>{formatLongDate(selectedSlot)}</strong>
                <span>
                  {formatTime(selectedSlot)} · {selectedProvider.name}
                </span>
              </div>
            ) : (
              <div className="care-selection care-selection--empty">
                <CalendarDays size={18} />
                <span>Select an available time to continue.</span>
              </div>
            )}
            <label className="care-field">
              <span>Treatment or care request</span>
              <select value={treatmentName} onChange={(event) => setTreatmentName(event.target.value)}>
                {careTreatments.map((treatment) => (
                  <option key={treatment.slug}>{treatment.name}</option>
                ))}
              </select>
            </label>
            <div className="care-field-row">
              <label className="care-field">
                <span>
                  Phone <small>Optional</small>
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+44 20…"
                />
              </label>
              <label className="care-field">
                <span>
                  Country <small>Optional</small>
                </span>
                <input
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="United Kingdom"
                />
              </label>
            </div>
            {!recommendationMode && (
              <label className="care-field">
                <span>Consultation channel</span>
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as AppointmentInputChannel)}
                >
                  <option value="video">Video consultation</option>
                  <option value="phone">Phone consultation</option>
                  <option value="in_person">In-person appointment</option>
                </select>
              </label>
            )}
            <label className="care-field">
              <span>
                Notes for the care coordinator <small>Optional</small>
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={1000}
                placeholder="Keep this high-level. Please do not include sensitive clinical details here."
              />
            </label>
            {error && (
              <div className="care-alert care-alert--error" role="alert">
                <X size={16} /> {error}
              </div>
            )}
            {notice && (
              <div className="care-alert care-alert--success" role="status">
                <CheckCircle2 size={16} /> {notice}
              </div>
            )}
            <button className="care-primary-button" disabled={submitDisabled} onClick={handleSubmit}>
              {submitLabel}
              {recommendationMode ? <Mail size={16} /> : <ArrowRight size={16} />}
            </button>
            <small className="care-form-note">
              By continuing, you agree that MediMATCH may use your account details to create a
              patient record and coordinate this request. This is a scheduling service, not
              emergency care.
            </small>
          </aside>
        </div>
        <section className="care-history">
          <div className="care-section-heading">
            <div>
              <span className="care-eyebrow">Your care timeline</span>
              <h2>Appointments, in one view.</h2>
            </div>
            <span className="care-connection care-connection--polling">
              <i /> Refreshed every 12 seconds
            </span>
          </div>
          {accountState.status === "loading" ? (
            <div className="care-loading">Checking your MediMATCH account…</div>
          ) : !isSignedIn ? (
            <div className="care-login-card">
              <LogIn size={22} />
              <div>
                <strong>Sign in to see your care timeline.</strong>
                <span>Booking and consultation records are private to your account.</span>
              </div>
              <button onClick={startSignIn}>
                Sign in <ArrowRight size={15} />
              </button>
            </div>
          ) : accountState.status === "error" ? (
            <div className="care-error" role="alert">
              Unable to load your account: {apiErrorMessage(accountState.error)}
            </div>
          ) : !isPatient ? (
            <div className="care-login-card">
              <ShieldCheck size={22} />
              <div>
                <strong>This timeline is for Client accounts.</strong>
                <span>Your role has a different MediMATCH workspace.</span>
              </div>
              <Link href="/login">
                Open role sign in <ArrowRight size={15} />
              </Link>
            </div>
          ) : mineQuery.error ? (
            <div className="care-error" role="alert">
              Unable to load your care timeline: {apiErrorMessage(mineQuery.error)}
            </div>
          ) : mineQuery.isLoading ? (
            <div className="care-loading">Loading your care timeline…</div>
          ) : (
            <div className="care-appointment-list">
              {upcoming.length ? (
                upcoming.map((row) => (
                  <UpcomingAppointmentCard
                    key={row.id}
                    appointment={row}
                    provider={providerById.get(row.providerId)}
                    cancelling={cancelMutation.isPending}
                    onCancel={() =>
                      cancelMutation.mutate({
                        appointmentId: row.id,
                        data: { status: "cancelled" },
                      })
                    }
                  />
                ))
              ) : (
                <div className="care-empty care-empty--wide">
                  <CalendarDays size={24} />
                  <strong>No upcoming appointments yet.</strong>
                  <span>Choose a provider above to reserve your first care conversation.</span>
                </div>
              )}
              {completed.length > 0 && (
                <div className="care-past-list">
                  <span className="care-eyebrow">Completed consultations</span>
                  {completed.map((row) => (
                    <article key={row.id} className="care-past-card">
                      <div>
                        <strong>{providerById.get(row.providerId)?.name ?? "MediMATCH provider"}</strong>
                        <span>{formatLongDate(row.startsAt)}</span>
                      </div>
                      <div>
                        <span>
                          Online consultation summaries are not available yet. Contact the care desk
                          for your notes.
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <footer className="care-footer">
        <div>
          <strong>MediMATCH</strong>
          <span>Connected care, with a clearer next step.</span>
        </div>
        <div>
          <Link href="/">Overview</Link>
          <Link href="/account">Patient portal</Link>
          <Link href="/care-dashboard">Staff care desk</Link>
          <a href="mailto:hello@medimatch.health">Contact coordination</a>
        </div>
      </footer>
    </div>
  );
}

function UpcomingAppointmentCard({
  appointment,
  provider,
  cancelling,
  onCancel,
}: {
  appointment: Appointment;
  provider: Provider | undefined;
  cancelling: boolean;
  onCancel: () => void;
}) {
  return (
    <article className="care-appointment-card">
      <div className="care-appointment-card__date">
        <small>
          {new Date(appointment.startsAt).toLocaleDateString(undefined, {
            month: "short",
            timeZone: "UTC",
          })}
        </small>
        <strong>{new Date(appointment.startsAt).getUTCDate()}</strong>
      </div>
      <div className="care-appointment-card__body">
        <div className="care-appointment-card__top">
          <div>
            <span className="care-eyebrow">{provider?.specialty ?? appointment.treatmentName}</span>
            <h3>{provider?.name ?? "MediMATCH provider"}</h3>
          </div>
          <span className={`care-status care-status--${statusTone(appointment.status)}`}>
            {statusLabel(appointment.status)}
          </span>
        </div>
        <p>
          {formatTime(appointment.startsAt)} · {channelLabel(appointment.channel)}
          {provider?.facility ? ` · ${provider.facility}` : ""}
        </p>
        {appointment.status === "pending" || appointment.status === "confirmed" ? (
          <button className="care-cancel" onClick={onCancel} disabled={cancelling}>
            Cancel appointment
          </button>
        ) : null}
      </div>
    </article>
  );
}
