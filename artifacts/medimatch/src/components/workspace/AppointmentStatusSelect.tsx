import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardQueryKey,
  useUpdateAppointmentStatus,
  type Appointment,
} from "@workspace/api-client-react";
import { apiErrorMessage } from "@/lib/api-errors";
import { appointmentStatuses, type AppointmentStatusValue } from "@/lib/format";

const optionLabels: Record<AppointmentStatusValue, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * Status changes for clinic and CEO workspaces. While a change is saving, the
 * row shows the chosen status instead of snapping back to the old one.
 */
export function useAppointmentStatusUpdater(onSaved?: (status: AppointmentStatusValue) => void) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: async (updated) => {
        setError(null);
        onSaved?.(updated.status);
        await queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (mutationError) => setError(apiErrorMessage(mutationError)),
    },
  });

  const update = (appointmentId: number, status: AppointmentStatusValue) =>
    mutation.mutate({ appointmentId, data: { status } });
  const displayStatus = (row: Appointment): AppointmentStatusValue =>
    mutation.isPending && mutation.variables?.appointmentId === row.id
      ? mutation.variables.data.status
      : row.status;
  const isSaving = (row: Appointment) =>
    mutation.isPending && mutation.variables?.appointmentId === row.id;

  return { update, displayStatus, isSaving, error, clearError: () => setError(null) };
}

export function AppointmentStatusSelect({
  appointment,
  updater,
}: {
  appointment: Appointment;
  updater: ReturnType<typeof useAppointmentStatusUpdater>;
}) {
  return (
    <select
      aria-label={`Status for ${appointment.patientName}`}
      value={updater.displayStatus(appointment)}
      disabled={updater.isSaving(appointment)}
      onChange={(event) =>
        updater.update(appointment.id, event.target.value as AppointmentStatusValue)
      }
    >
      {appointmentStatuses.map((status) => (
        <option key={status} value={status}>
          {optionLabels[status]}
        </option>
      ))}
    </select>
  );
}
