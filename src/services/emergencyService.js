import { apiRequest } from "./apiClient";

export const createEmergencyRequest   = (payload) =>
  apiRequest("/emergency/requests/", { method: "POST", body: JSON.stringify(payload) });

export const getEmergencyRequests     = () =>
  apiRequest("/emergency/requests/");

export const respondToEmergency       = (id, action) =>
  apiRequest(`/emergency/requests/${id}/respond/`, { method: "POST", body: JSON.stringify({ action }) });

export const getEmergencyResponses    = (id) =>
  apiRequest(`/emergency/requests/${id}/responses/`);

export const getMyResponses           = () =>
  apiRequest("/emergency/requests/my-response/");

// Donation Records
export const getDonationRecords       = (donorId) => {
  const url = donorId
    ? `/emergency/donation-records/?donor_id=${donorId}`
    : "/emergency/donation-records/";
  return apiRequest(url);
};

export const createDonationRecord     = (formData) =>
  apiRequest("/emergency/donation-records/", {
    method: "POST",
    body: formData,   // FormData — apiClient auto-omits Content-Type, keeps Authorization
  });

export const deleteDonationRecord     = (id) =>
  apiRequest(`/emergency/donation-records/${id}/`, { method: "DELETE" });
