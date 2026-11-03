const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  // If body is FormData, don't set Content-Type (browser sets multipart/form-data with boundary)
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Remove explicit empty headers override (used to signal FormData)
  const cleanOptions = { ...options };
  if (cleanOptions.headers !== undefined) delete cleanOptions.headers;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...cleanOptions,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      console.error("[API Error]", path, response.status, errData);
      if (errData.detail) {
        errorMsg = errData.detail;
      } else {
        // Collect ALL field errors
        const msgs = [];
        Object.entries(errData).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(", ") : String(val);
          msgs.push(key === "non_field_errors" ? msg : `${key}: ${msg}`);
        });
        if (msgs.length > 0) errorMsg = msgs.join(" | ");
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.status === 204 ? null : response.json();
}