import type { AxiosError } from "axios";

/**
 * Extracts the most useful error message from an Axios error response.
 * Handles DRF field errors, non_field_errors, and detail strings.
 */
export function getApiError(error: unknown, fallback = "Something went wrong."): string {
  const axiosErr = error as AxiosError<Record<string, unknown>>;
  const data = axiosErr?.response?.data;
  if (!data) return fallback;

  // Single detail string
  if (typeof data.detail === "string") return data.detail;

  // non_field_errors array
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0] as string;

  // Field-level errors — return first message found
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  }

  return fallback;
}
