import { apiRequest } from "./apiClient";

export const registerHospital = (payload) => apiRequest("/hospitals/register/", { method: "POST", body: JSON.stringify(payload) });
export const getHospitalProfile = () => apiRequest("/hospitals/profile/");
