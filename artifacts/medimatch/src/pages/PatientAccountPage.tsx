import {
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  HeartHandshake,
  Link as LinkIcon,
  MapPin,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import {
  getGetDashboardQueryKey,
  useGetDashboard,
  type Account,
  type Appointment,
} from "@workspace/api-client-react";
import { WorkspaceGate, WorkspaceSignOut } from "@/components/workspace/WorkspaceGate";
import { apiErrorMessage } from "@/lib/api-errors";
import { crmLeadStageLabel } from "@/lib/crm-lead-stages";
import {
  appointmentReference,
  formatFullDate,
  formatTime,
  patientReference,
  shortChannelLabel,
  statusLabel,
  statusTone,
} from "@/lib/format";

const journey = [
  "Request submitted",
  "Coordinator assigned",
  "Medical evaluation",
  "Quote available",
  "Booking confirmed",
  "Travel preparation",
  "Treatment",
  "Follow-up",
];

/** Where the latest active request sits on the care journey. */
function journeyPosition(latest: Appointment | undefined) {
  if (!latest) return { index: 0, label: "New" };
  const index =
    latest.status === "confirmed"
      ? 4
      : latest.status === "checked_in"
        ? 6
        : latest.status === "completed"
          ? 7
          : 0;
  return { index, label: journey[index] };
}

export default function PatientAccountPage() {
  return (
    <WorkspaceGate
      allow={["patient"]}
      loadingText="Checking your MediMATCH account…"
      signIn={{
        title: "Sign in to your patient portal.",
        copy: "Your care requests, appointments, and account details are private to your account.",
      }}
      denied={{
        title: "This is a client workspace.",
        copy: "Your account is assigned to a different MediMATCH workspace.",
      }}
    >
      {(account) => <PatientWorkspace account={account} />}
    </WorkspaceGate>
  );
}

function PatientWorkspace({ account }: { account: Account }) {
  const query = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 15_000 },
  });
  const data = query.data;
  const appointments = data?.appointments ?? [];
  const leadByAppointmentId = new Map(
    (data?.leads ?? []).map((lead) => [lead.appointmentId, lead]),
  );
  const providerById = new Map((data?.providers ?? []).map((provider) => [provider.id, provider]));
  const clinicById = new Map((data?.clinics ?? []).map((clinic) => [clinic.id, clinic]));

  const newestFirst = [...appointments].sort((a, b) => b.id - a.id);
  const latestActive = newestFirst.find((row) => row.status !== "cancelled");
  const position = journeyPosition(latestActive);
  const now = new Date();
  const upcoming = appointments
    .filter(
      (row) =>
        row.status !== "cancelled" && row.status !== "completed" && new Date(row.startsAt) >= now,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const completedCount = appointments.filter((row) => row.status === "completed").length;
  const careNetwork =
    (latestActive?.clinicId ? clinicById.get(latestActive.clinicId)?.name : undefined) ||
    "MediMATCH network";

  return (
    <div className="workspace-shell workspace-shell--patient">
      <div className="workspace-topbar">
        <Link href="/" className="workspace-brand">
          <span>
            <HeartHandshake size={18} />
          </span>
          <strong>MediMATCH</strong>
          <small>Patient portal</small>
        </Link>
        <nav>
          <Link className="is-active" href="/account">
            Overview
          </Link>
          <Link href="/appointments">Appointments</Link>
          <a href="#requests">My requests</a>
          <a href="#overview">Account</a>
        </nav>
        <div className="workspace-user">{account.name || account.email || "Patient"}</div>
        <WorkspaceSignOut />
      </div>
      <main className="workspace-main">
        <header className="workspace-hero workspace-hero--patient">
          <div>
            <span className="care-eyebrow">
              <span className="care-live-dot" /> Your care journey
            </span>
            <h1>
              A clearer next step,
              <br />
              <em>all in one place.</em>
            </h1>
            <p>
              Keep your MediMATCH requests, appointments, and care team connected as your journey
              moves forward.
            </p>
          </div>
          <Link href="/appointments" className="workspace-primary-button">
            Book an appointment <ChevronRight size={16} />
          </Link>
        </header>
        {query.error && (
          <div className="care-alert care-alert--error" role="alert">
            Unable to load your patient portal: {apiErrorMessage(query.error)}
          </div>
        )}
        <section className="workspace-journey">
          <div className="workspace-section-head">
            <div>
              <span className="care-eyebrow">Live journey</span>
              <h2>{position.label}.</h2>
            </div>
            <span className="workspace-live">
              <i /> Updated automatically
            </span>
          </div>
          <div className="journey-track">
            {journey.map((stage, index) => (
              <div
                className={`journey-step ${latestActive && index <= position.index ? "is-complete" : ""} ${latestActive && index === position.index ? "is-current" : ""}`}
                key={stage}
              >
                <span>
                  {latestActive && index < position.index ? "✓" : String(index + 1).padStart(2, "0")}
                </span>
                <small>{stage}</small>
              </div>
            ))}
          </div>
        </section>
        <div className="workspace-grid workspace-grid--patient">
          <section className="workspace-panel" id="requests">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Your requests</span>
                <h2>What you asked us to help with.</h2>
              </div>
              <FileText size={20} />
            </div>
            {query.isLoading ? (
              <div className="workspace-loading">Loading your requests…</div>
            ) : newestFirst.length ? (
              <div className="patient-request-list">
                {newestFirst.map((row) => (
                  <article className="patient-request" key={row.id}>
                    <div className="patient-request__mark">
                      <HeartHandshake size={17} />
                    </div>
                    <div>
                      <strong>{row.treatmentName}</strong>
                      <span>
                        {appointmentReference(row.id)} · {statusLabel(row.status)}
                      </span>
                      <small>
                        {providerById.get(row.providerId)?.name ?? "MediMATCH provider"} ·{" "}
                        {formatFullDate(row.startsAt)}
                      </small>
                      {leadByAppointmentId.has(row.id) && (
                        <span>
                          Care coordination ·{" "}
                          {crmLeadStageLabel(leadByAppointmentId.get(row.id)!.stage)}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">
                <FileText size={22} />
                <strong>No care requests yet.</strong>
                <span>Start with an appointment or ask MediMATCH for a recommendation.</span>
                <Link href="/appointments">
                  Start a request <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </section>
          <section className="workspace-panel">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Upcoming care</span>
                <h2>Your next conversations.</h2>
              </div>
              <CalendarDays size={20} />
            </div>
            {query.isLoading ? (
              <div className="workspace-loading">Loading your appointments…</div>
            ) : upcoming.length ? (
              <div className="patient-appointment-list">
                {upcoming.slice(0, 3).map((row) => {
                  const provider = providerById.get(row.providerId);
                  const place =
                    row.channel === "in_person"
                      ? (row.clinicId ? clinicById.get(row.clinicId)?.city : undefined) ||
                        provider?.city ||
                        "In person"
                      : shortChannelLabel(row.channel);
                  return (
                    <article className="patient-appointment" key={row.id}>
                      <div>
                        <span className="care-eyebrow">{formatFullDate(row.startsAt)}</span>
                        <strong>{provider?.name || "MediMATCH care team"}</strong>
                        <span>
                          <Clock3 size={13} /> {formatTime(row.startsAt)} · {place}
                        </span>
                      </div>
                      <span className={`care-status care-status--${statusTone(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="workspace-empty">
                <CalendarDays size={22} />
                <strong>No upcoming appointments.</strong>
                <span>Choose a provider and reserve a time that works for you.</span>
                <Link href="/appointments">
                  Find a time <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </section>
        </div>
        <section className="workspace-panel workspace-panel--payments" id="overview">
          <div className="workspace-panel__head">
            <div>
              <span className="care-eyebrow">Account overview</span>
              <h2>Keep the practical details clear.</h2>
            </div>
            <UserRound size={20} />
          </div>
          <div className="patient-payment-grid">
            <div>
              <strong>{upcoming.length}</strong>
              <span>Upcoming appointments</span>
            </div>
            <div>
              <strong>{completedCount}</strong>
              <span>Completed consultations</span>
            </div>
            <div>
              <strong>{patientReference(account.id)}</strong>
              <span>Patient reference</span>
            </div>
            <div>
              <strong>{careNetwork}</strong>
              <span>Care network</span>
            </div>
          </div>
        </section>
        <section className="workspace-next-actions">
          <div>
            <span className="care-eyebrow">Need help?</span>
            <h2>Your care desk is close by.</h2>
            <p>Ask about a clinic recommendation, an appointment, or the next step in your journey.</p>
          </div>
          <div>
            <a href="mailto:hello@medimatch.health">
              <MapPin size={16} /> Contact coordination
            </a>
            <Link href="/appointments">
              <LinkIcon size={16} /> Open appointments
            </Link>
          </div>
        </section>
      </main>
      <footer className="workspace-footer">
        <span>MediMATCH patient portal</span>
        <span>Private by account · connected care</span>
      </footer>
    </div>
  );
}
