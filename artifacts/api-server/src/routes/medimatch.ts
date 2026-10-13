import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";
import {
  appointmentsTable,
  clinicsTable,
  db,
  providersTable,
  usersTable,
} from "@workspace/db";
import {
  CreateAppointmentBody,
  CreateAppointmentResponse,
  GetCurrentAccountResponse,
  GetDashboardResponse,
  ListProvidersResponse,
  ListStaffAccountsResponse,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusResponse,
  UpdateStaffAccessBody,
  UpdateStaffAccessParams,
  UpdateStaffAccessResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const activeAppointmentStatuses = ["pending", "confirmed", "checked_in"] as const;

type CurrentAccount = typeof usersTable.$inferSelect;

function textClaim(
  claims: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = claims[key];
  return typeof value === "string" ? value : fallback;
}

async function getCurrentAccount(req: Parameters<typeof getAuth>[0]) {
  const auth = getAuth(req);
  if (!auth.userId) return null;

  const claims = (auth.sessionClaims ?? {}) as Record<string, unknown>;
  const email = textClaim(claims, "email").trim().toLowerCase();
  const firstName = textClaim(claims, "firstName").trim();
  const lastName = textClaim(claims, "lastName").trim();
  const name =
    [firstName, lastName].filter(Boolean).join(" ") ||
    textClaim(claims, "name").trim() ||
    email ||
    "MediMATCH member";
  const adminEmail = process.env.MEDIMATCH_ADMIN_EMAIL?.trim().toLowerCase();
  const shouldBeAdmin = Boolean(email && adminEmail && email === adminEmail);

  const [account] = await db
    .insert(usersTable)
    .values({
      clerkUserId: auth.userId,
      email: email || `${auth.userId}@account.invalid`,
      name,
      accountType: shouldBeAdmin ? "admin" : "patient",
    })
    .onConflictDoUpdate({
      target: usersTable.clerkUserId,
      set: {
        email: email || `${auth.userId}@account.invalid`,
        name,
        ...(shouldBeAdmin ? { accountType: "admin" as const } : {}),
        updatedAt: new Date(),
      },
    })
    .returning();

  return account ?? null;
}

function accountDto(account: CurrentAccount) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    accountType: account.accountType,
    clinicId: account.clinicId,
  };
}

function appointmentDto(
  appointment: typeof appointmentsTable.$inferSelect,
) {
  return {
    id: appointment.id,
    providerId: appointment.providerId,
    clinicId: appointment.clinicId,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    channel: appointment.channel,
    status: appointment.status,
    treatmentName: appointment.treatmentName,
    patientName: appointment.patientName,
    patientEmail: appointment.patientEmail,
    phone: appointment.phone,
    country: appointment.country,
    reason: appointment.reason,
  };
}

function providerDto(provider: typeof providersTable.$inferSelect) {
  return {
    id: provider.id,
    clinicId: provider.clinicId,
    name: provider.name,
    specialty: provider.specialty,
    facility: provider.facility,
    city: provider.city,
    bio: provider.bio,
    languages: provider.languages,
  };
}

function unauthorized(res: Parameters<Parameters<typeof router.get>[1]>[1]) {
  res.status(401).json({ error: "Sign in to continue." });
}

function forbidden(
  res: Parameters<Parameters<typeof router.get>[1]>[1],
  message: string,
) {
  res.status(403).json({ error: message });
}

router.get("/auth/me", async (req, res): Promise<void> => {
  const account = await getCurrentAccount(req);
  if (!account) {
    unauthorized(res);
    return;
  }
  res.json(GetCurrentAccountResponse.parse(accountDto(account)));
});

router.get("/providers", async (_req, res): Promise<void> => {
  const providers = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.isActive, 1))
    .orderBy(asc(providersTable.name));
  res.json(ListProvidersResponse.parse(providers.map(providerDto)));
});

router.get("/dashboard", async (req, res): Promise<void> => {
  const account = await getCurrentAccount(req);
  if (!account) {
    unauthorized(res);
    return;
  }
  if (account.accountType === "clinic" && !account.clinicId) {
    forbidden(res, "Your clinic workspace is not assigned yet.");
    return;
  }

  let appointmentRows: typeof appointmentsTable.$inferSelect[] = [];
  if (account.accountType === "admin") {
    appointmentRows = await db
      .select()
      .from(appointmentsTable)
      .orderBy(desc(appointmentsTable.startsAt))
      .limit(100);
  } else if (account.accountType === "clinic" && account.clinicId) {
    appointmentRows = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, account.clinicId))
      .orderBy(desc(appointmentsTable.startsAt))
      .limit(100);
  } else if (account.accountType === "patient") {
    appointmentRows = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.patientUserId, account.id))
      .orderBy(desc(appointmentsTable.startsAt))
      .limit(100);
  }

  const clinicRows =
    account.accountType === "clinic" && account.clinicId
      ? await db
          .select()
          .from(clinicsTable)
          .where(eq(clinicsTable.id, account.clinicId))
      : await db.select().from(clinicsTable).orderBy(asc(clinicsTable.name));

  const providerRows =
    account.accountType === "clinic" && account.clinicId
      ? await db
          .select()
          .from(providersTable)
          .where(
            and(
              eq(providersTable.clinicId, account.clinicId),
              eq(providersTable.isActive, 1),
            ),
          )
          .orderBy(asc(providersTable.name))
      : await db
          .select()
          .from(providersTable)
          .where(eq(providersTable.isActive, 1))
          .orderBy(asc(providersTable.name));

  const staffRows =
    account.accountType === "admin"
      ? await db.select().from(usersTable).orderBy(asc(usersTable.name))
      : [];
  const visibleAppointments = appointmentRows.map(appointmentDto);

  res.json(
    GetDashboardResponse.parse({
      account: accountDto(account),
      counts: {
        appointments: visibleAppointments.length,
        pending: visibleAppointments.filter((row) =>
          activeAppointmentStatuses.includes(
            row.status as (typeof activeAppointmentStatuses)[number],
          ),
        ).length,
        clinics: clinicRows.length,
        providers: providerRows.length,
        staff: staffRows.length,
      },
      appointments: visibleAppointments,
      clinics: clinicRows.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        city: clinic.city,
        country: clinic.country,
      })),
      providers: providerRows.map(providerDto),
      staff: staffRows.map(accountDto),
    }),
  );
});

router.post("/appointments", async (req, res): Promise<void> => {
  const account = await getCurrentAccount(req);
  if (!account) {
    unauthorized(res);
    return;
  }
  if (account.accountType !== "patient") {
    forbidden(res, "Only patient accounts can request appointments.");
    return;
  }

  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const startsAt = new Date(input.startsAt);
  if (!Number.isFinite(startsAt.getTime()) || startsAt <= new Date()) {
    res.status(400).json({ error: "Choose a future appointment time." });
    return;
  }

  const [provider] = await db
    .select()
    .from(providersTable)
    .where(
      and(
        eq(providersTable.id, input.providerId),
        eq(providersTable.isActive, 1),
      ),
    )
    .limit(1);
  if (!provider) {
    res.status(400).json({ error: "That provider is not available." });
    return;
  }

  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
  try {
    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        patientUserId: account.id,
        providerId: provider.id,
        clinicId: provider.clinicId,
        startsAt,
        endsAt,
        channel: input.channel,
        treatmentName: input.treatmentName,
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        phone: input.phone ?? null,
        country: input.country ?? null,
        reason: input.reason ?? null,
      })
      .returning();

    if (!appointment) {
      res.status(500).json({ error: "The appointment could not be saved." });
      return;
    }
    res
      .status(201)
      .json(CreateAppointmentResponse.parse(appointmentDto(appointment)));
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505";
    if (code) {
      res.status(409).json({ error: "That provider and time are already booked." });
      return;
    }
    throw error;
  }
});

router.patch(
  "/appointments/:appointmentId/status",
  async (req, res): Promise<void> => {
    const account = await getCurrentAccount(req);
    if (!account) {
      unauthorized(res);
      return;
    }
    if (account.accountType !== "admin" && account.accountType !== "clinic") {
      forbidden(res, "Clinic or administrator access is required.");
      return;
    }
    if (account.accountType === "clinic" && !account.clinicId) {
      forbidden(res, "Your clinic workspace is not assigned yet.");
      return;
    }

    const params = UpdateAppointmentStatusParams.safeParse(req.params);
    const body = UpdateAppointmentStatusBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid appointment status update." });
      return;
    }

    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, params.data.appointmentId))
      .limit(1);
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found." });
      return;
    }
    if (
      account.accountType === "clinic" &&
      appointment.clinicId !== account.clinicId
    ) {
      forbidden(res, "You can only update appointments for your clinic.");
      return;
    }

    const [updated] = await db
      .update(appointmentsTable)
      .set({ status: body.data.status, updatedAt: new Date() })
      .where(eq(appointmentsTable.id, appointment.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Appointment not found." });
      return;
    }
    res.json(
      UpdateAppointmentStatusResponse.parse(appointmentDto(updated)),
    );
  },
);

router.get("/staff", async (req, res): Promise<void> => {
  const account = await getCurrentAccount(req);
  if (!account) {
    unauthorized(res);
    return;
  }
  if (account.accountType !== "admin") {
    forbidden(res, "Administrator access is required.");
    return;
  }
  const staffRows = await db.select().from(usersTable).orderBy(asc(usersTable.name));
  res.json(ListStaffAccountsResponse.parse(staffRows.map(accountDto)));
});

router.patch("/staff/:userId/access", async (req, res): Promise<void> => {
  const account = await getCurrentAccount(req);
  if (!account) {
    unauthorized(res);
    return;
  }
  if (account.accountType !== "admin") {
    forbidden(res, "Administrator access is required.");
    return;
  }

  const params = UpdateStaffAccessParams.safeParse(req.params);
  const body = UpdateStaffAccessBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid account access update." });
    return;
  }
  if (params.data.userId === account.id) {
    res.status(400).json({ error: "You cannot change your own administrator access." });
    return;
  }

  const clinicId =
    body.data.accountType === "clinic" ? body.data.clinicId ?? null : null;
  if (body.data.accountType === "clinic" && !clinicId) {
    res.status(400).json({ error: "Choose a clinic for clinic access." });
    return;
  }
  if (clinicId) {
    const [clinic] = await db
      .select({ id: clinicsTable.id })
      .from(clinicsTable)
      .where(eq(clinicsTable.id, clinicId))
      .limit(1);
    if (!clinic) {
      res.status(400).json({ error: "That clinic does not exist." });
      return;
    }
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      accountType: body.data.accountType,
      clinicId,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, params.data.userId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Account not found. They must sign in once first." });
    return;
  }
  res.json(UpdateStaffAccessResponse.parse(accountDto(updated)));
});

export default router;
