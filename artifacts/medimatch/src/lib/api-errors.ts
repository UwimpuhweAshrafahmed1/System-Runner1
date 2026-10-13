/**
 * Helpers for errors thrown by the generated API client. The server answers
 * failures with `{ error: string }`, which the client exposes on `error.data`.
 */
export function apiErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data: unknown }).data;
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
    ) {
      return (data as { error: string }).error;
    }
  }
  if (apiErrorStatus(error) === 401) {
    return "Your session has ended. Sign in again to continue.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
