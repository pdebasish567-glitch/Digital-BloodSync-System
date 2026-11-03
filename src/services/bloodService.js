import { apiRequest } from "./apiClient";

export const getBloodInventory   = () => apiRequest("/blood/inventory/");
export const createBloodUnit     = (payload) => apiRequest("/blood/inventory/", { method: "POST", body: JSON.stringify(payload) });
export const updateBloodUnit     = (id, payload) => apiRequest(`/blood/inventory/${id}/`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBloodUnit     = (id) => apiRequest(`/blood/inventory/${id}/`, { method: "DELETE" });

// Public — no auth required. Used by Home + BloodAvailability public pages.
export const getPublicBloodSummary = () => apiRequest("/blood/summary/");
