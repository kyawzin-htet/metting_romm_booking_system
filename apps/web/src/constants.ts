import type { Role } from "./types/domain";

export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
export const roles: Role[] = ["admin", "owner", "user"];
export const minimumAppLoadingMs = 700;
export const minimumSubmitFeedbackMs = 500;
export const protectedAdminUserId = 1;
