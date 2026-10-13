import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Stethoscope,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import {
  getGetDashboardQueryKey,
  useGetDashboard,
  type Account,
} from "@workspace/api-client-react";
import {
  AppointmentStatusSelect,
  useAppointmentStatusUpdater,
} from "@/components/workspace/AppointmentStatusSelect";
import { WorkspaceGate, WorkspaceSignOut } from "@/components/workspace/WorkspaceGate";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  appointmentReference,
  formatShortDate,
  formatTime,
  isoDateKey,
  providerInitials,
  shortChannelLabel,
} from "@/lib/format";

const activeStatuses = new Set(["pending", "confirmed", "checked_in"]);
const requestFilters = [
  ["all", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["checked_in", "Checked in"],
  ["completed", "Completed"],
] as const;

export default function ClinicDashboardPage() {
  return (
    <WorkspaceGate
      allow={["clinic"]}
      loadingText="Checking employee access…"
      signIn={{
        title: "Sign in to your employee workspace.",
        copy: "Clinic requests, appointments, and patient information are protected by account access.",
      }}
      denied={{
        title: "Employee access required.",
        copy: "Your account is not assigned to an employee workspace. Client accounts can continue through the patient portal.",
      }}
    >
      {(account) => <ClinicWorkspace account={account} />}
    </WorkspaceGate>
  );
}

function ClinicWorkspace({ account }: { account: Account }) {
  const query = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 12_000 },
  });
  const updater = useAppointmentStatusUpdater();
  const [requestFilter, setRequestFilter] = useState<string>("all");

  const data = query.data;
  const appointments = data?.appointments ?? [];
  const providers = data?.providers ?? [];
  const providerById = new Map(providers.map((provider) => [provider.id, provider]));
  const clinicName = data?.clinics?.[0]?.name || account.name || "Clinic workspace";

  const todayKey = isoDateKey(new Date());
  const startOfToday = new Date(`${todayKey}T00:00:00Z`);
  const todayCount = appointments.filter(
    (row) => row.status !== "cancelled" && row.startsAt.slice(0, 10) === todayKey,
  ).length;
  const activeCount = appointments.filter((row) => activeStatuses.has(row.status)).length;
  const pendingCount = appointments.filter((row) => row.status === "pending").length;

  const upcomingQueue = appointments
    .filter((row) => activeStatuses.has(row.status) && new Date(row.startsAt) >= startOfToday)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const showingRecent = upcomingQueue.length === 0 && appointments.length > 0;
  const queue = showingRecent
    ? [...appointments].sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    : upcomingQueue;

  const requests = [...appointments]
    .sort((a, b) => b.id - a.id)
    .filter((row) => requestFilter === "all" || row.status === requestFilter);

  return (
    <div className="workspace-shell workspace-shell--internal">
      <div className="workspace-topbar">
        <Link href="/" className="workspace-brand">
          <span>
            <HeartHandshake size={18} />
          </span>
          <strong>MediMATCH</strong>
          <small>Employee workspace</small>
        </Link>
        <nav>
          <Link className="is-active" href="/employee">
            Overview
          </Link>
          <Link href="/appointments">Client portal</Link>
          <a href="#requests">Requests</a>
          <a href="#queue">Appointments</a>
          <Link href="/care-dashboard">Care desk</Link>
        </nav>
        <div className="workspace-user">
          <Building2 size={14} /> {clinicName}
        </div>
        <WorkspaceSignOut />
      </div>
      <main className="workspace-main">
        <header className="workspace-hero workspace-hero--internal">
          <div>
            <span className="care-eyebrow">
              <span className="care-live-dot" /> Employee operations
            </span>
            <h1>
              Keep every request
              <br />
              <em>moving forward.</em>
            </h1>
            <p>
              One professional view for incoming requests, provider capacity, appointment queue,
              and the next patient conversation.
            </p>
          </div>
          <div className="workspace-hero__meta">
            <span>
              <Users size={16} /> {pendingCount} new requests
            </span>
            <span>
              <CalendarDays size={16} /> {appointments.length} appointments
            </span>
          </div>
        </header>
        {updater.error && (
          <div className="care-alert care-alert--error" role="alert">
            {updater.error}
          </div>
        )}
        <section className="workspace-kpi-grid">
          <article>
            <span className="kpi-icon kpi-icon--blue">
              <CalendarDays size={17} />
            </span>
            <div>
              <strong>{todayCount}</strong>
              <small>Today's appointments</small>
            </div>
          </article>
          <article>
            <span className="kpi-icon kpi-icon--mint">
              <Users size={17} />
            </span>
            <div>
              <strong>{activeCount}</strong>
              <small>Active appointments</small>
            </div>
          </article>
          <article>
            <span className="kpi-icon kpi-icon--orange">
              <Stethoscope size={17} />
            </span>
            <div>
              <strong>{providers.length}</strong>
              <small>Active providers</small>
            </div>
          </article>
          <article>
            <span className="kpi-icon kpi-icon--red">
              <Clock3 size={17} />
            </span>
            <div>
              <strong>{pendingCount}</strong>
              <small>Need confirmation</small>
            </div>
          </article>
        </section>
        <div className="workspace-grid workspace-grid--internal">
          <section className="workspace-panel" id="queue">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Clinic queue</span>
                <h2>Today and next up.</h2>
              </div>
              <span className="workspace-live">
                <i /> Updated automatically
              </span>
            </div>
            {query.error ? (
              <div className="care-error" role="alert">
                Unable to load the clinic workspace: {apiErrorMessage(query.error)}
              </div>
            ) : query.isLoading ? (
              <div className="workspace-loading">Loading your clinic queue…</div>
            ) : queue.length ? (
              <>
                {showingRecent && (
                  <div className="care-inline-status">
                    Nothing upcoming — showing the most recent appointments.
                  </div>
                )}
                <div className="clinic-queue">
                  {queue.slice(0, 12).map((row) => (
                    <article className="clinic-queue-item" key={row.id}>
                      <div className="clinic-queue-item__time">
                        <strong>{formatTime(row.startsAt)}</strong>
                        <small>{formatShortDate(row.startsAt)}</small>
                      </div>
                      <div className="clinic-queue-item__patient">
                        <strong>{row.patientName || row.patientEmail || "Patient"}</strong>
                        <span>{row.treatmentName || "Care consultation"}</span>
                        <small>
                          {providerById.get(row.providerId)?.name || "MediMATCH provider"} ·{" "}
                          {shortChannelLabel(row.channel)}
                        </small>
                      </div>
                      <AppointmentStatusSelect appointment={row} updater={updater} />
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="workspace-empty">
                <CalendarDays size={22} />
                <strong>No appointments for this clinic.</strong>
                <span>New bookings will appear here when a patient selects this clinic.</span>
              </div>
            )}
          </section>
          <section className="workspace-panel" id="requests">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Incoming requests</span>
                <h2>Requests to move.</h2>
              </div>
              <span className="care-eyebrow">{Math.min(requests.length, 12)} shown</span>
            </div>
            <div className="workspace-filter-tabs">
              {requestFilters.map(([value, label]) => (
                <button
                  key={value}
                  className={requestFilter === value ? "is-active" : ""}
                  onClick={() => setRequestFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {requests.length ? (
              <div className="clinic-lead-list">
                {requests.slice(0, 12).map((row) => (
                  <article className="clinic-lead" key={row.id}>
                    <div className="clinic-lead__avatar">
                      {(row.patientName || "P").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <strong>{row.patientName || row.patientEmail || "Patient"}</strong>
                      <span>
                        {appointmentReference(row.id)} · {row.treatmentName}
                      </span>
                      <small>
                        {formatShortDate(row.startsAt)} · {formatTime(row.startsAt)} ·{" "}
                        {shortChannelLabel(row.channel)}
                      </small>
                    </div>
                    <AppointmentStatusSelect appointment={row} updater={updater} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">
                <CheckCircle2 size={22} />
                <strong>No requests in this filter.</strong>
                <span>Try another status or wait for a new patient request.</span>
              </div>
            )}
          </section>
        </div>
        <section className="workspace-panel workspace-panel--providers">
          <div className="workspace-panel__head">
            <div>
              <span className="care-eyebrow">Provider coverage</span>
              <h2>Your connected care team.</h2>
            </div>
            <Link href="/care-dashboard">
              Open care desk <ArrowRight size={15} />
            </Link>
          </div>
          {providers.length ? (
            <div className="provider-coverage-grid">
              {providers.map((provider) => (
                <article key={provider.id}>
                  <span className="provider-coverage__avatar">{providerInitials(provider.name)}</span>
                  <div>
                    <strong>{provider.name}</strong>
                    <span>{provider.specialty}</span>
                    <small>{provider.facility}</small>
                  </div>
                  <span className="care-status care-status--confirmed">Available</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              <Stethoscope size={22} />
              <strong>No providers listed for this clinic yet.</strong>
              <span>Contact hello@medimatch.health to list your care team.</span>
            </div>
          )}
        </section>
      </main>
      <footer className="workspace-footer">
        <span>MediMATCH employee workspace</span>
        <span>Clinic-scoped operations · Updated automatically</span>
      </footer>
    </div>
  );
}
