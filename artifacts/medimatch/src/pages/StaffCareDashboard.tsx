import { useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartHandshake,
  Info,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "lucide-react";
import {
  getGetDashboardQueryKey,
  useGetDashboard,
  type Account,
  type Appointment,
} from "@workspace/api-client-react";
import { useAppointmentStatusUpdater } from "@/components/workspace/AppointmentStatusSelect";
import { apiErrorMessage } from "@/lib/api-errors";
import { useMediMatchAccount, useSignOut, useStartSignIn, workspacePath } from "@/lib/account";
import {
  appointmentReference,
  appointmentStatuses,
  channelLabel,
  formatShortDate,
  formatTime,
  shortChannelLabel,
  statusLabel,
  statusTone,
} from "@/lib/format";

const statusFilters = [
  ["all", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["checked_in", "Checked in"],
  ["completed", "Completed"],
] as const;

/** Upcoming appointments first (soonest first), then past ones (most recent first). */
function queueOrder(rows: Appointment[], now: Date) {
  const upcoming = rows
    .filter((row) => new Date(row.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = rows
    .filter((row) => new Date(row.startsAt) < now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return [...upcoming, ...past];
}

export default function StaffCareDashboard() {
  const accountState = useMediMatchAccount();
  const startSignIn = useStartSignIn();

  if (accountState.status === "loading") {
    return (
      <div className="care-portal care-portal--loading">
        <div className="care-loading">Checking staff access…</div>
      </div>
    );
  }
  if (accountState.status === "signed-out") {
    return (
      <div className="care-portal care-portal--loading">
        <div className="care-login-card">
          <LogIn size={22} />
          <div>
            <strong>Sign in to open the staff care desk.</strong>
            <span>Staff access is protected by MediMATCH account login.</span>
          </div>
          <button onClick={startSignIn}>Sign in</button>
        </div>
      </div>
    );
  }
  if (accountState.status === "error") {
    return (
      <div className="care-portal care-portal--loading">
        <div className="care-access-card" role="alert">
          <AlertTriangle size={25} />
          <h1>We could not open your account.</h1>
          <p>{apiErrorMessage(accountState.error)}</p>
          <button type="button" onClick={accountState.retry}>
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      </div>
    );
  }
  const account = accountState.account;
  if (account.accountType !== "admin" && account.accountType !== "clinic") {
    return (
      <div className="care-portal care-portal--loading">
        <div className="care-access-card">
          <ShieldCheck size={25} />
          <h1>Staff access required</h1>
          <p>
            Your account is signed in, but it is not assigned to a MediMATCH staff role. Patient
            booking remains available.
          </p>
          <Link href="/appointments">
            Go to patient appointments <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    );
  }
  return <StaffDesk account={account} />;
}

function StaffDesk({ account }: { account: Account }) {
  const signOut = useSignOut();
  const query = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 12_000 },
  });
  const [notice, setNotice] = useState<string | null>(null);
  const updater = useAppointmentStatusUpdater((status) =>
    setNotice(`Appointment status updated to ${statusLabel(status)}.`),
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const data = query.data;
  const providerById = new Map((data?.providers ?? []).map((provider) => [provider.id, provider]));
  const clinicById = new Map((data?.clinics ?? []).map((clinic) => [clinic.id, clinic]));
  const ordered = queueOrder(data?.appointments ?? [], new Date());
  const filtered = ordered.filter((row) => statusFilter === "all" || row.status === statusFilter);
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0] ?? null;
  const selectedProvider = selected ? providerById.get(selected.providerId) : undefined;
  const selectedStatus = selected ? updater.displayStatus(selected) : null;
  const workspaceLabel = account.accountType === "admin" ? "CEO workspace" : "Employee workspace";

  const selectAppointment = (id: number) => {
    setSelectedId(id);
    setNotice(null);
    updater.clearError();
  };

  return (
    <div className="care-portal care-portal--staff">
      <div className="care-utility">
        <span>
          <ShieldCheck size={13} /> Staff care desk
        </span>
        <span>
          <Clock3 size={13} /> Queue refreshed every 12 seconds
        </span>
        <span className="care-utility__right">{account.name || "MediMATCH staff"}</span>
      </div>
      <header className="care-header">
        <Link href="/" className="care-brand">
          <span className="care-brand__mark">
            <HeartHandshake size={19} />
          </span>
          <span>
            <strong>MediMATCH</strong>
            <small>Care operations</small>
          </span>
        </Link>
        <nav>
          <Link href="/appointments">Patient portal</Link>
          <Link href={workspacePath(account)}>{workspaceLabel}</Link>
          <Link className="is-active" href="/care-dashboard">
            Care desk
          </Link>
        </nav>
        <div className="care-header__actions">
          <span className="care-connection care-connection--polling">
            <i /> Auto-refresh
          </span>
          <button type="button" className="care-signout" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>
      <main className="staff-main">
        <div className="staff-heading">
          <div>
            <span className="care-eyebrow">MediMATCH operations</span>
            <h1>Care desk.</h1>
            <p>Keep the next patient conversation clear, timely, and documented.</p>
          </div>
          <div className="staff-heading__meta">
            <span className="care-status care-status--confirmed">
              <i /> {filtered.length} in view
            </span>
            <span>Updated automatically</span>
          </div>
        </div>
        <div className="staff-notification-status">
          <div>
            <span className="care-eyebrow">
              <Bell size={14} /> Reminder system
            </span>
            <strong>Automatic reminders are not set up yet</strong>
            <span>Email and SMS reminders need a delivery provider before they can be sent.</span>
          </div>
          <div className="staff-notification-status__chips">
            <span className="is-pending">
              <Mail size={14} /> Email needs setup
            </span>
            <span className="is-pending">
              <MessageCircle size={14} /> SMS needs setup
            </span>
          </div>
        </div>
        <div className="staff-toolbar">
          <div className="care-filter-tabs">
            {statusFilters.map(([value, label]) => (
              <button
                key={value}
                className={statusFilter === value ? "is-active" : ""}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/appointments" className="staff-back-link">
            Patient portal <ArrowLeft size={15} />
          </Link>
        </div>
        <div className="staff-grid">
          <section className="care-panel staff-queue-panel">
            <div className="care-panel__head">
              <div>
                <span className="care-eyebrow">Appointment queue</span>
                <h2>Today and next up.</h2>
              </div>
              <span className="care-timezone">UTC</span>
            </div>
            {query.isLoading ? (
              <div className="care-loading">Loading the queue…</div>
            ) : query.error ? (
              <div className="care-error" role="alert">
                Unable to load the staff queue: {apiErrorMessage(query.error)}
              </div>
            ) : filtered.length ? (
              <div className="staff-queue">
                {filtered.map((row) => (
                  <button
                    key={row.id}
                    className={`staff-queue-item ${selected?.id === row.id ? "is-selected" : ""}`}
                    onClick={() => selectAppointment(row.id)}
                  >
                    <div className="staff-queue-item__time">
                      <strong>{formatTime(row.startsAt)}</strong>
                      <span>{formatShortDate(row.startsAt)}</span>
                    </div>
                    <div className="staff-queue-item__patient">
                      <strong>{row.patientName || row.patientEmail || "Patient"}</strong>
                      <span>
                        {providerById.get(row.providerId)?.name || "MediMATCH provider"} ·{" "}
                        {shortChannelLabel(row.channel)}
                      </span>
                    </div>
                    <span className={`care-status care-status--${statusTone(updater.displayStatus(row))}`}>
                      {statusLabel(updater.displayStatus(row))}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="care-empty care-empty--wide">
                <CalendarDays size={24} />
                <strong>No appointments in this view.</strong>
                <span>New patient bookings appear here within a few seconds.</span>
              </div>
            )}
          </section>
          <aside className="care-panel staff-detail-panel">
            {selected && selectedStatus ? (
              <>
                <div className="care-panel__head">
                  <div>
                    <span className="care-eyebrow">Selected appointment</span>
                    <h2>{selected.patientName || selected.patientEmail || "Patient"}</h2>
                  </div>
                  <span className="staff-patient-avatar">
                    <UserRound size={18} />
                  </span>
                </div>
                <div className="staff-detail-meta">
                  <span>
                    <CalendarDays size={15} /> {formatShortDate(selected.startsAt)} ·{" "}
                    {formatTime(selected.startsAt)} UTC
                  </span>
                  <span>
                    <Stethoscope size={15} /> {selectedProvider?.name || "MediMATCH provider"}
                    {selectedProvider ? ` · ${selectedProvider.specialty}` : ""}
                  </span>
                  <span>
                    {selected.channel === "video" ? (
                      <Video size={15} />
                    ) : selected.channel === "phone" ? (
                      <Phone size={15} />
                    ) : (
                      <HeartHandshake size={15} />
                    )}{" "}
                    {channelLabel(selected.channel)}
                  </span>
                </div>
                <div className="staff-status-actions">
                  <span className="care-eyebrow">Appointment status</span>
                  <div>
                    {appointmentStatuses.map((status) => (
                      <button
                        key={status}
                        className={selectedStatus === status ? "is-active" : ""}
                        disabled={updater.isSaving(selected)}
                        onClick={() => {
                          if (status === selected.status) return;
                          setNotice(null);
                          updater.update(selected.id, status);
                        }}
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
                <dl className="staff-request-details">
                  <div>
                    <dt>Reference</dt>
                    <dd>{appointmentReference(selected.id)}</dd>
                  </div>
                  <div>
                    <dt>Care request</dt>
                    <dd>{selected.treatmentName}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${selected.patientEmail}`}>{selected.patientEmail}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      {selected.phone ? (
                        <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Country</dt>
                    <dd>{selected.country || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Clinic</dt>
                    <dd>
                      {(selected.clinicId ? clinicById.get(selected.clinicId)?.name : undefined) ||
                        "Not assigned"}
                    </dd>
                  </div>
                  <div>
                    <dt>Patient notes</dt>
                    <dd>{selected.reason || "None"}</dd>
                  </div>
                </dl>
                <div className="staff-coming-later">
                  <Info size={15} />
                  <span>
                    Consultation notes and patient-facing summaries are not available yet. Status
                    changes update the patient's timeline right away.
                  </span>
                </div>
                {updater.error && (
                  <div className="care-alert care-alert--error" role="alert">
                    <X size={16} /> {updater.error}
                  </div>
                )}
                {notice && (
                  <div className="care-alert care-alert--success" role="status">
                    <CheckCircle2 size={16} /> {notice}
                  </div>
                )}
              </>
            ) : (
              <div className="care-empty">
                <FileText size={24} />
                <strong>Select an appointment.</strong>
                <span>Its care details will appear here.</span>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
