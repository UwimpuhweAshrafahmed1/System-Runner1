import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardQueryKey,
  useUpdateCrmLeadStage,
  type Appointment,
  type CrmLead,
} from "@workspace/api-client-react";
import { apiErrorMessage } from "@/lib/api-errors";
import { appointmentReference, formatMonthDay } from "@/lib/format";
import { crmLeadStages } from "@/lib/crm-lead-stages";

export function LeadPipeline({
  leads,
  appointments,
  canEdit,
  title = "CRM lead pipeline",
}: {
  leads: CrmLead[];
  appointments: Appointment[];
  canEdit: boolean;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const updateLead = useUpdateCrmLeadStage({
    mutation: {
      onSuccess: async () => {
        setError(null);
        await queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (mutationError) => setError(apiErrorMessage(mutationError)),
    },
  });
  const appointmentById = new Map(appointments.map((appointment) => [appointment.id, appointment]));

  return (
    <section className="workspace-panel crm-lead-panel" id="crm-leads">
      <div className="workspace-panel__head">
        <div>
          <span className="care-eyebrow">Care coordination · {leads.length} leads</span>
          <h2>{title}</h2>
        </div>
        <span className="workspace-live">
          <i /> Live data
        </span>
      </div>
      {error && (
        <div className="care-alert care-alert--error" role="alert">
          {error}
        </div>
      )}
      {leads.length ? (
        <div className="admin-lead-list crm-lead-list">
          {leads.map((lead) => {
            const appointment = appointmentById.get(lead.appointmentId);
            if (!appointment) return null;
            const isSaving =
              updateLead.isPending && updateLead.variables?.leadId === lead.id;
            const currentStage = isSaving
              ? updateLead.variables?.data.stage ?? lead.stage
              : lead.stage;
            return (
              <article className="admin-lead crm-lead" key={lead.id}>
                <div className="admin-lead__code">{appointmentReference(appointment.id)}</div>
                <div>
                  <strong>{appointment.patientName || "Client"}</strong>
                  <span>{appointment.treatmentName}</span>
                </div>
                <select
                  aria-label={`CRM stage for ${appointment.patientName}`}
                  value={currentStage}
                  disabled={!canEdit || isSaving}
                  onChange={(event) => {
                    setError(null);
                    updateLead.mutate({
                      leadId: lead.id,
                      data: { stage: event.target.value as CrmLead["stage"] },
                    });
                  }}
                >
                  {crmLeadStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
                <small>{formatMonthDay(appointment.startsAt)}</small>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="workspace-empty">
          <strong>No CRM leads yet.</strong>
          <span>New appointment requests will appear here as patient leads.</span>
        </div>
      )}
    </section>
  );
}
