import type { CrmLead } from "@workspace/api-client-react";

export const crmLeadStages: { value: CrmLead["stage"]; label: string }[] = [
  { value: "new_inquiry", label: "New inquiry" },
  { value: "contacted", label: "Contacted" },
  { value: "information_requested", label: "Information requested" },
  { value: "photos_received", label: "Photos received" },
  { value: "medical_evaluation_pending", label: "Medical evaluation pending" },
  { value: "consultation_offered", label: "Consultation offered" },
  { value: "quotation_sent", label: "Quotation sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "awaiting_deposit", label: "Awaiting deposit" },
  { value: "deposit_received", label: "Deposit received" },
  { value: "confirmed_booking", label: "Confirmed booking" },
  { value: "arriving_soon", label: "Arriving soon" },
  { value: "treatment_completed", label: "Treatment completed" },
  { value: "aftercare", label: "Aftercare" },
  { value: "closed_won", label: "Closed — successful" },
  { value: "closed_lost", label: "Closed — not proceeding" },
];

export function crmLeadStageLabel(stage: CrmLead["stage"]): string {
  return crmLeadStages.find((option) => option.value === stage)?.label ?? stage;
}
