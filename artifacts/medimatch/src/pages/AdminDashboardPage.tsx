import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCurrentAccountQueryKey,
  getGetDashboardQueryKey,
  useGetDashboard,
  useUpdateStaffAccess,
  type Account,
  type Clinic,
  type StaffAccessInputAccountType,
} from "@workspace/api-client-react";
import {
  AppointmentStatusSelect,
  useAppointmentStatusUpdater,
} from "@/components/workspace/AppointmentStatusSelect";
import { WorkspaceGate, WorkspaceSignOut } from "@/components/workspace/WorkspaceGate";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  appointmentReference,
  appointmentStatuses,
  formatMonthDay,
  formatTime,
  statusLabel,
  statusTone,
} from "@/lib/format";

const roleOptions: { value: StaffAccessInputAccountType; label: string }[] = [
  { value: "patient", label: "Client" },
  { value: "clinic", label: "Employee (clinic)" },
  { value: "partner", label: "Partner" },
  { value: "admin", label: "CEO" },
];

export default function AdminDashboardPage() {
  return (
    <WorkspaceGate
      allow={["admin"]}
      loadingText="Checking CEO access…"
      signIn={{
        title: "Sign in to open the CEO workspace.",
        copy: "Network-wide MediMATCH data is protected by CEO account access.",
      }}
      denied={{
        title: "CEO access required.",
        copy: "Your account is assigned to a different MediMATCH workspace.",
      }}
    >
      {(account) => <AdminWorkspace account={account} />}
    </WorkspaceGate>
  );
}

function AdminWorkspace({ account }: { account: Account }) {
  const query = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 12_000 },
  });
  const updater = useAppointmentStatusUpdater();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const data = query.data;
  const appointments = data?.appointments ?? [];
  const clinics = data?.clinics ?? [];
  const providers = data?.providers ?? [];
  const staff = data?.staff ?? [];
  const providerById = new Map(providers.map((provider) => [provider.id, provider]));
  const clinicById = new Map(clinics.map((clinic) => [clinic.id, clinic]));

  const patientAccounts = staff.filter((member) => member.accountType === "patient").length;
  const careTeamAccounts = staff.length - patientAccounts;
  const pendingCount = appointments.filter((row) => row.status === "pending").length;
  const completedCount = appointments.filter((row) => row.status === "completed").length;
  const pipeline = [...appointments]
    .sort((a, b) => b.id - a.id)
    .filter((row) => statusFilter === "all" || row.status === statusFilter);

  return (
    <div className="workspace-shell workspace-shell--internal workspace-shell--admin">
      <div className="workspace-topbar">
        <Link href="/" className="workspace-brand">
          <span>
            <HeartHandshake size={18} />
          </span>
          <strong>MediMATCH</strong>
          <small>CEO workspace</small>
        </Link>
        <nav>
          <Link className="is-active" href="/ceo">
            Overview
          </Link>
          <a href="#pipeline">Pipeline</a>
          <a href="#appointments">Appointments</a>
          <a href="#team">Team access</a>
          <a href="#network">Network</a>
          <Link href="/care-dashboard">Care desk</Link>
        </nav>
        <div className="workspace-user">
          <ShieldCheck size={14} /> Network CEO
        </div>
        <WorkspaceSignOut />
      </div>
      <main className="workspace-main">
        <header className="workspace-hero workspace-hero--internal workspace-hero--admin">
          <div>
            <span className="care-eyebrow">
              <span className="care-live-dot" /> CEO network view
            </span>
            <h1>
              See the whole system.
              <br />
              <em>Move the next request.</em>
            </h1>
            <p>
              One operational view across clients, clinics, providers, appointments, and team
              access.
            </p>
          </div>
          <Link href="/appointments" className="workspace-primary-button">
            Open booking flow <ChevronRight size={16} />
          </Link>
        </header>
        {updater.error && (
          <div className="care-alert care-alert--error" role="alert">
            {updater.error}
          </div>
        )}
        {query.error && (
          <div className="care-alert care-alert--error" role="alert">
            Unable to load the CEO workspace: {apiErrorMessage(query.error)}
          </div>
        )}
        <section className="workspace-kpi-grid workspace-kpi-grid--admin">
          <article>
            <span className="kpi-icon kpi-icon--blue">
              <Users size={17} />
            </span>
            <div>
              <strong>{patientAccounts}</strong>
              <small>Patient accounts</small>
            </div>
          </article>
          <article>
            <span className="kpi-icon kpi-icon--mint">
              <Building2 size={17} />
            </span>
            <div>
              <strong>{clinics.length}</strong>
              <small>Active clinics</small>
            </div>
          </article>
          <article>
            <span className="kpi-icon kpi-icon--orange">
              <BarChart3 size={17} />
            </span>
            <div>
              <strong>{appointments.length}</strong>
              <small>Appointment requests</small>
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
        <div className="workspace-grid workspace-grid--admin">
          <section className="workspace-panel" id="pipeline">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Appointment pipeline</span>
                <h2>Every request, one next action.</h2>
              </div>
              <span className="workspace-live">
                <i /> Live data
              </span>
            </div>
            <div className="pipeline-strip pipeline-strip--five">
              {appointmentStatuses.map((status) => (
                <button
                  key={status}
                  className={statusFilter === status ? "is-active" : ""}
                  onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                >
                  <strong>{appointments.filter((row) => row.status === status).length}</strong>
                  <span>{statusLabel(status)}</span>
                </button>
              ))}
            </div>
            {query.isLoading ? (
              <div className="workspace-loading">Loading the appointment pipeline…</div>
            ) : pipeline.length ? (
              <div className="admin-lead-list">
                {pipeline.slice(0, 15).map((row) => (
                  <article className="admin-lead" key={row.id}>
                    <div className="admin-lead__code">{appointmentReference(row.id)}</div>
                    <div>
                      <strong>{row.patientName || row.patientEmail || "Patient"}</strong>
                      <span>
                        {row.treatmentName} ·{" "}
                        {(row.clinicId ? clinicById.get(row.clinicId)?.name : undefined) ||
                          "Unassigned clinic"}
                      </span>
                    </div>
                    <AppointmentStatusSelect appointment={row} updater={updater} />
                    <small>{formatMonthDay(row.startsAt)}</small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">
                <CheckCircle2 size={22} />
                <strong>No requests in this status.</strong>
                <span>New website bookings will arrive here.</span>
              </div>
            )}
          </section>
          <section className="workspace-panel" id="appointments">
            <div className="workspace-panel__head">
              <div>
                <span className="care-eyebrow">Appointment coverage</span>
                <h2>Where care is happening.</h2>
              </div>
              <CalendarDays size={20} />
            </div>
            {appointments.length ? (
              <div className="admin-appointment-list">
                {appointments.slice(0, 10).map((row) => (
                  <article key={row.id}>
                    <div className="admin-appointment__date">
                      <strong>{formatMonthDay(row.startsAt)}</strong>
                      <span>{formatTime(row.startsAt)}</span>
                    </div>
                    <div>
                      <strong>{row.patientName || row.patientEmail || "Patient"}</strong>
                      <span>
                        {providerById.get(row.providerId)?.name || "MediMATCH provider"} ·{" "}
                        {(row.clinicId ? clinicById.get(row.clinicId)?.city : undefined) ||
                          "Unassigned"}
                      </span>
                    </div>
                    <span className={`care-status care-status--${statusTone(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="workspace-empty">
                <CalendarDays size={22} />
                <strong>No appointments yet.</strong>
                <span>Booking records will appear after the first patient request.</span>
              </div>
            )}
          </section>
        </div>
        <TeamAccessPanel
          currentAccountId={account.id}
          staff={staff}
          clinics={clinics}
          loading={query.isLoading}
        />
        <section className="workspace-panel workspace-panel--admin-bottom" id="network">
          <div className="workspace-panel__head">
            <div>
              <span className="care-eyebrow">Network health</span>
              <h2>Keep the care network balanced.</h2>
            </div>
            <Link href="/care-dashboard">
              Open care desk <ArrowRight size={15} />
            </Link>
          </div>
          <div className="admin-bottom-grid">
            <div>
              <UserCog size={21} />
              <strong>{careTeamAccounts}</strong>
              <span>Care team accounts</span>
            </div>
            <div>
              <Stethoscope size={21} />
              <strong>{providers.length}</strong>
              <span>Active providers</span>
            </div>
            <div>
              <Users size={21} />
              <strong>{pendingCount}</strong>
              <span>Pending confirmations</span>
            </div>
            <div>
              <CheckCircle2 size={21} />
              <strong>{completedCount}</strong>
              <span>Completed appointments</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="workspace-footer">
        <span>MediMATCH CEO workspace</span>
        <span>Network operations · Role protected</span>
      </footer>
    </div>
  );
}

function TeamAccessPanel({
  currentAccountId,
  staff,
  clinics,
  loading,
}: {
  currentAccountId: number;
  staff: Account[];
  clinics: Clinic[];
  loading: boolean;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="workspace-panel workspace-panel--team" id="team">
      <div className="workspace-panel__head">
        <div>
          <span className="care-eyebrow">Team access</span>
          <h2>Give each person the right workspace.</h2>
        </div>
        <UserCog size={20} />
      </div>
      <p className="team-access-intro">
        People appear here after they sign in once. New accounts start as Client. Employees need a
        clinic so they only see that clinic's appointments.
      </p>
      {error && (
        <div className="care-alert care-alert--error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="care-alert care-alert--success" role="status">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {loading ? (
        <div className="workspace-loading">Loading accounts…</div>
      ) : staff.length ? (
        <div className="team-access-list">
          {staff.map((member) => (
            <TeamAccessRow
              // Remount when the saved access changes so the draft resets.
              key={`${member.id}-${member.accountType}-${member.clinicId ?? "none"}`}
              member={member}
              clinics={clinics}
              isSelf={member.id === currentAccountId}
              onSaved={(message) => {
                setError(null);
                setNotice(message);
              }}
              onError={(message) => {
                setNotice(null);
                setError(message);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="workspace-empty">
          <Users size={22} />
          <strong>No accounts yet.</strong>
          <span>Accounts appear here after their first sign-in.</span>
        </div>
      )}
    </section>
  );
}

function TeamAccessRow({
  member,
  clinics,
  isSelf,
  onSaved,
  onError,
}: {
  member: Account;
  clinics: Clinic[];
  isSelf: boolean;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<StaffAccessInputAccountType>(member.accountType);
  const [clinicId, setClinicId] = useState<number | null>(member.clinicId);
  const mutation = useUpdateStaffAccess({
    mutation: {
      onSuccess: async (updated) => {
        const label = roleOptions.find((option) => option.value === updated.accountType)?.label;
        onSaved(`${updated.name} now has ${label ?? updated.accountType} access.`);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetCurrentAccountQueryKey() }),
        ]);
      },
      onError: (mutationError) => onError(apiErrorMessage(mutationError)),
    },
  });

  const effectiveClinicId = role === "clinic" ? clinicId : null;
  const changed = role !== member.accountType || effectiveClinicId !== member.clinicId;
  const missingClinic = role === "clinic" && !clinicId;
  const initial = (member.name || member.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="team-access-row">
      <div className="team-access-row__who">
        <span className="team-access-row__avatar">{initial}</span>
        <div>
          <strong>{member.name}</strong>
          <span>{member.email}</span>
        </div>
      </div>
      <div className="team-access-row__controls">
        <select
          aria-label={`Workspace for ${member.name}`}
          value={role}
          disabled={isSelf || mutation.isPending}
          onChange={(event) => setRole(event.target.value as StaffAccessInputAccountType)}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {role === "clinic" && (
          <select
            aria-label={`Clinic for ${member.name}`}
            value={clinicId ?? ""}
            disabled={isSelf || mutation.isPending}
            onChange={(event) => setClinicId(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Choose a clinic</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {isSelf ? (
        <span className="team-access-row__self">You</span>
      ) : (
        <button
          type="button"
          disabled={!changed || missingClinic || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              userId: member.id,
              data: {
                accountType: role,
                ...(role === "clinic" && clinicId ? { clinicId } : {}),
              },
            })
          }
        >
          {mutation.isPending ? "Saving…" : "Save"}
        </button>
      )}
    </div>
  );
}
