import { index, integer, pgEnum, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { appointmentsTable } from "./medimatch";

export const crmLeadStageEnum = pgEnum("medimatch_crm_lead_stage", [
  "new_inquiry",
  "contacted",
  "information_requested",
  "photos_received",
  "medical_evaluation_pending",
  "consultation_offered",
  "quotation_sent",
  "negotiation",
  "awaiting_deposit",
  "deposit_received",
  "confirmed_booking",
  "arriving_soon",
  "treatment_completed",
  "aftercare",
  "closed_won",
  "closed_lost",
]);

export const crmLeadsTable = pgTable(
  "medimatch_crm_leads",
  {
    id: serial("id").primaryKey(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointmentsTable.id, { onDelete: "restrict" }),
    stage: crmLeadStageEnum("stage").notNull().default("new_inquiry"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    appointmentUnique: uniqueIndex("medimatch_crm_lead_appointment_uq").on(
      table.appointmentId,
    ),
    stageUpdatedIndex: index("medimatch_crm_lead_stage_updated_idx").on(
      table.stage,
      table.updatedAt,
    ),
  }),
);

export type CrmLeadStage = (typeof crmLeadStageEnum.enumValues)[number];
export type CrmLead = typeof crmLeadsTable.$inferSelect;
