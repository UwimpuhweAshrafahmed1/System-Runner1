import { QueryClient } from "@tanstack/react-query";
import { apiErrorStatus } from "./api-errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx answers (signed out, wrong role, not found) will not change on retry.
      retry: (failureCount, error) => {
        const status = apiErrorStatus(error);
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
