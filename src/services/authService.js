import { apiRequest } from "./apiClient";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginUser = (payload) =>
  apiRequest("/auth/login/", { method: "POST", body: JSON.stringify(payload) });

/**
 * Register a donor — sends multipart/form-data so files (photo, documents)
 * are included. Pass a plain object; this function builds the FormData.
 */
export const registerDonor = (payload) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === null || val === undefined) return;   // skip nulls
    if (val instanceof File) {
      fd.append(key, val, val.name);
    } else {
      fd.append(key, String(val));
    }
  });
  // Pass as FormData — apiClient auto-sets multipart Content-Type
  return apiRequest("/auth/register-donor/", { method: "POST", body: fd });
};

export const registerHospital = (payload) =>
  apiRequest("/auth/register-hospital/", { method: "POST", body: JSON.stringify(payload) });

export const getMe = (token) =>
  apiRequest("/auth/me/", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Step 1 — user submits email; backend emails reset link
export const forgotPassword = (email) =>
  apiRequest("/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

// Step 2 — user submits token + new password from the reset link
export const resetPassword = (token, password, confirm_password) =>
  apiRequest("/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify({ token, password, confirm_password }),
  });

