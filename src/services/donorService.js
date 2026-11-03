import { apiRequest } from "./apiClient";

export const getDonors = () => apiRequest("/donors/");
export const registerDonor = (payload) => apiRequest("/donors/register/", { method: "POST", body: JSON.stringify(payload) });
export const updateDonor = (id, payload) => apiRequest(`/donors/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
