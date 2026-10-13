import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const accountTypeEnum = pgEnum("medimatch_account_type", [
  "patient",
  "clinic",
  "partner",
  "admin",
]);

export const appointmentStatusEnum = pgEnum("medimatch_appointment_status", [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
]);

export const appointmentChannelEnum = pgEnum("medimatch_appointment_channel", [
  "video",
  "phone",
  "in_person",
]);

export const clinicsTable = pgTable("medimatch_clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersTable = pgTable(
  "medimatch_users",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    accountType: accountTypeEnum("account_type").notNull().default("patient"),
    clinicId: integer("clinic_id").references(() => clinicsTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    clerkUserIdUnique: uniqueIndex("medimatch_users_clerk_id_uq").on(
      table.clerkUserId,
    ),
    roleClinicIndex: index("medimatch_users_role_clinic_idx").on(
      table.accountType,
      table.clinicId,
    ),
  }),
);

export const providersTable = pgTable(
  "medimatch_providers",
  {
    id: serial("id").primaryKey(),
    clinicId: integer("clinic_id").references(() => clinicsTable.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    specialty: text("specialty").notNull(),
    facility: text("facility").notNull(),
    city: text("city").notNull(),
    bio: text("bio").notNull(),
    languages: text("languages").notNull(),
    isActive: integer("is_active").notNull().default(1),
  },
  (table) => ({
    activeIndex: index("medimatch_providers_active_idx").on(table.isActive),
  }),
);

export const appointmentsTable = pgTable(
  "medimatch_appointments",
  {
    id: serial("id").primaryKey(),
    patientUserId: integer("patient_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerId: integer("provider_id")
      .notNull()
      .references(() => providersTable.id, { onDelete: "restrict" }),
    clinicId: integer("clinic_id").references(() => clinicsTable.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    channel: appointmentChannelEnum("channel").notNull(),
    status: appointmentStatusEnum("status").notNull().default("pending"),
    treatmentName: text("treatment_name").notNull(),
    patientName: text("patient_name").notNull(),
    patientEmail: text("patient_email").notNull(),
    phone: text("phone"),
    country: text("country"),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Cancelled appointments release their slot so it can be booked again.
    providerSlotUnique: uniqueIndex("medimatch_provider_slot_uq")
      .on(table.providerId, table.startsAt)
      .where(sql`${table.status} <> 'cancelled'`),
    patientDateIndex: index("medimatch_patient_date_idx").on(
      table.patientUserId,
      table.startsAt,
    ),
    clinicDateIndex: index("medimatch_clinic_date_idx").on(
      table.clinicId,
      table.startsAt,
    ),
  }),
);

export type AccountType = (typeof accountTypeEnum.enumValues)[number];
export type AppointmentStatus =
  (typeof appointmentStatusEnum.enumValues)[number];
export type AppointmentChannel =
  (typeof appointmentChannelEnum.enumValues)[number];
export type Clinic = typeof clinicsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Provider = typeof providersTable.$inferSelect;
export type Appointment = typeof appointmentsTable.$inferSelect;
