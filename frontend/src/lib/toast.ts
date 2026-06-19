import toast from "react-hot-toast";
import { getApiError } from "./errors";

export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  apiError: (error: unknown, fallback?: string) =>
    toast.error(getApiError(error, fallback)),
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id?: string) => toast.dismiss(id),
};
