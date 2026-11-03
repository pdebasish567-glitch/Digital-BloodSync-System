import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerDonor } from "../../services/authService";
import { bloodGroups } from "../../data/sampleData";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
function calcAge(dobStr) {
  if (!dobStr) return null;
  const today = new Date(), b = new Date(dobStr);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

async function geocodeAddress(address, city, pin) {
  const q = encodeURIComponent(`${address}, ${city}, ${pin}, India`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=1`;
  const r = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await r.json();
  if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

async function reverseGeocode(lat, lng) {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
  const d = await r.json();
  if (d?.address) {
    const a = d.address;
    return {
      road: a.road || a.suburb || a.neighbourhood || "",
      city: a.city || a.town || a.village || a.county || "",
      pin:  a.postcode ? a.postcode.replace(/\D/g, "").slice(0, 6) : "",
    };
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────────── */
function MapPreview({ lat, lng }) {
  if (!lat || !lng) return (
    <div style={{ height: 180, background: "#f8fafc", borderRadius: "12px", border: "1.5px dashed #e2e8f0", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
      📍 Map will appear after location is set
    </div>
  );
  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #bfdbfe" }}>
      <div style={{ padding: "0.35rem 0.75rem", background: "#eff6ff", fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", display: "flex", justifyContent: "space-between" }}>
        <span>📍 Location confirmed</span>
        <span style={{ fontWeight: 400, color: "#64748b" }}>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</span>
      </div>
      <iframe
        title="location-preview"
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        width="100%" height="200"
        style={{ border: "none", display: "block" }}
        allowFullScreen loading="lazy"
      />
    </div>
  );
}

function F({ label, req, err, hint, children, full }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}{req && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      {children}
      {hint && !err && <span style={{ fontSize: "0.66rem", color: "#9ca3af" }}>{hint}</span>}
      {err  && <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 600 }}>⚠ {err}</span>}
    </div>
  );
}

function UploadBox({ label, accept, hint, icon, value, onChange, error }) {
  const ref = useRef();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: `2px dashed ${error ? "#fca5a5" : value ? "#6ee7b7" : "#e2e8f0"}`,
          borderRadius: "10px", padding: "0.85rem", cursor: "pointer",
          background: value ? "#f0fdf4" : "#f8fafc",
          display: "flex", alignItems: "center", gap: "0.75rem",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>{value ? "✅" : icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {value ? (
            <>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.name}</div>
              <div style={{ fontSize: "0.68rem", color: "#4ade80" }}>{(value.size / 1024).toFixed(1)} KB — click to replace</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Click to upload</div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{hint}</div>
            </>
          )}
        </div>
        {value && (
          <button type="button"
            onClick={e => { e.stopPropagation(); onChange(null); }}
            style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "1rem", padding: 0, flexShrink: 0 }}>✕</button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => onChange(e.target.files[0] || null)} />
      {error && <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 600 }}>⚠ {error}</span>}
      {/* Preview for image */}
      {value && value.type?.startsWith("image/") && (
        <img src={URL.createObjectURL(value)} alt="preview"
          style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: "8px", marginTop: 4 }} />
      )}
    </div>
  );
}

function Steps({ step }) {
  const steps = [
    { label: "Personal",  icon: "👤" },
    { label: "Health",    icon: "🩺" },
    { label: "Documents", icon: "📎" },
    { label: "Location",  icon: "📍" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: i < step ? "#b91c1c" : i === step ? "linear-gradient(135deg, #b91c1c, #dc2626)" : "#f1f5f9",
              border: i === step ? "2px solid #b91c1c" : "2px solid transparent",
              display: "grid", placeItems: "center",
              fontSize: "0.9rem",
              boxShadow: i === step ? "0 0 0 4px #fecaca" : "none",
              transition: "all 0.3s",
            }}>
              {i < step ? <span style={{ fontSize: "0.85rem", color: "#fff" }}>✓</span> : <span>{s.icon}</span>}
            </div>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, color: i <= step ? "#b91c1c" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4, textAlign: "center" }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? "#b91c1c" : "#f1f5f9", margin: "0 4px", marginBottom: 20, transition: "background 0.3s" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN FORM
───────────────────────────────────────────────────────────────────────────── */
const INP = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "9px",
  padding: "9px 12px", fontSize: "0.88rem", outline: "none",
  background: "#fff", boxSizing: "border-box", fontFamily: "inherit",
};
const SEL = { ...INP, cursor: "pointer" };

export default function DonorRegistrationForm({ onSuccess }) {
  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors },
  } = useForm({ defaultValues: { preferred_time: "Morning", gender: "", blood_group: "" } });

  const [step,         setStep]        = useState(0);
  const [loading,      setLoading]     = useState(false);
  const [submitErr,    setSubmitErr]   = useState("");
  const [gpsLoading,   setGpsLoading]  = useState(false);
  const [gpsErr,       setGpsErr]      = useState("");
  const [geocoding,    setGeocoding]   = useState(false);
  const [photoFile,    setPhotoFile]   = useState(null);
  const [docFile,      setDocFile]     = useState(null);
  const [mapCoords,    setMapCoords]   = useState({ lat: null, lng: null });
  const navigate = useNavigate();

  const pw  = watch("password");
  const dob = watch("date_of_birth");
  const computedAge = calcAge(dob);

  const stepFields = [
    ["first_name","last_name","email","phone","password","confirm_password","date_of_birth","gender","blood_group","emergency_contact","occupation"],
    ["weight","hemoglobin","preferred_time","last_donation"],
    [],                                           // Step 2 = documents (optional)
    ["address","city","pin_code"],
  ];

  /* ── Next ──────────────────────────────────────────────────────────────── */
  const goNext = async () => {
    if (step === 0 && (!dob || !computedAge || computedAge < 18 || computedAge > 65)) {
      await trigger("date_of_birth"); return;
    }
    const ok = await trigger(stepFields[step]);
    if (ok) setStep(s => s + 1);
  };

  /* ── Live GPS ──────────────────────────────────────────────────────────── */
  const captureGPS = () => {
    if (!navigator.geolocation) { setGpsErr("Geolocation not supported by this browser."); return; }
    setGpsLoading(true); setGpsErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setValue("latitude", lat); setValue("longitude", lng);
        setMapCoords({ lat, lng });
        try {
          const geo = await reverseGeocode(lat, lng);
          if (geo) {
            if (geo.road) setValue("address", geo.road);
            if (geo.city) setValue("city",    geo.city);
            if (geo.pin)  setValue("pin_code", geo.pin);
          }
        } catch (_) {}
        setGpsLoading(false);
      },
      () => { setGpsErr("Location access denied. Please allow browser location permission or enter address manually."); setGpsLoading(false); },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  /* ── Geocode typed address ─────────────────────────────────────────────── */
  const geocodeTyped = async () => {
    const addr = watch("address"); const city = watch("city"); const pin = watch("pin_code");
    if (!addr && !city) { setGpsErr("Please enter an address or city first."); return; }
    setGeocoding(true); setGpsErr("");
    try {
      const coords = await geocodeAddress(addr || "", city || "", pin || "");
      if (coords) {
        setValue("latitude", coords.lat); setValue("longitude", coords.lng);
        setMapCoords({ lat: coords.lat, lng: coords.lng });
      } else {
        setGpsErr("Could not find this address on the map. Try being more specific.");
      }
    } catch (_) { setGpsErr("Geocoding failed. Check your internet connection."); }
    setGeocoding(false);
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const onSubmit = async (data) => {
    setSubmitErr("");
    const age = calcAge(data.date_of_birth);
    if (!age || age < 18 || age > 65) { setSubmitErr("Date of birth must result in age 18–65 years."); return; }
    setLoading(true);
    try {
      const payload = {
        full_name:         `${data.first_name} ${data.last_name}`.trim(),
        email:             data.email.trim().toLowerCase(),
        phone:             data.phone,
        password:          data.password,
        blood_group:       data.blood_group,
        age,
        gender:            data.gender || "",
        weight:            parseFloat(data.weight),
        hemoglobin:        parseFloat(data.hemoglobin),
        address:           data.address,
        city:              data.city,
        pin_code:          data.pin_code,
        emergency_contact: data.emergency_contact,
        occupation:        data.occupation || "",
        preferred_time:    data.preferred_time || "Morning",
        latitude:          mapCoords.lat  || null,
        longitude:         mapCoords.lng  || null,
        last_donation:     data.last_donation || null,
        ...(photoFile ? { profile_photo: photoFile } : {}),
        ...(docFile   ? { hemoglobin_document: docFile } : {}),
      };
      const res = await registerDonor(payload);
      if (res?.tokens?.access) localStorage.setItem("token", res.tokens.access);
      onSuccess?.("✅ Registration submitted! Awaiting hospital admin approval. Check your email.", "success");
      navigate("/donor-login");
    } catch (err) {
      setSubmitErr(err.message || "Registration failed. Please check all fields and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };

  return (
    <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 20px 60px rgba(15,23,42,0.10)", padding: "2.25rem", maxWidth: 700, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "16px", background: "linear-gradient(135deg, #fef2f2, #fecaca)", display: "grid", placeItems: "center", fontSize: "1.7rem", margin: "0 auto 0.9rem", boxShadow: "0 4px 14px rgba(185,28,28,0.15)" }}>🩸</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Donor Registration</h2>
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.3rem" }}>Step {step + 1} of 4 — complete all sections to register</p>
      </div>

      <Steps step={step} />

      {/* Global error */}
      {submitErr && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#dc2626", fontWeight: 600, lineHeight: 1.5 }}>
          ⚠ {submitErr}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ══════════════ STEP 0 — Personal Details ══════════════════════ */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "0.85rem 1.1rem", fontSize: "0.78rem", color: "#475569", borderLeft: "3px solid #b91c1c" }}>
              Fill in your personal and account details. All fields marked <strong style={{ color: "#dc2626" }}>*</strong> are required.
            </div>
            <div style={G2}>
              <F label="First Name" req err={errors.first_name?.message}>
                <input style={INP} placeholder="e.g. Rahul"
                  {...register("first_name", { required: "Required", pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" } })} />
              </F>
              <F label="Last Name" req err={errors.last_name?.message}>
                <input style={INP} placeholder="e.g. Sharma"
                  {...register("last_name", { required: "Required", pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" } })} />
              </F>
              <F label="Email Address" req err={errors.email?.message} full>
                <input style={INP} type="email" placeholder="you@email.com"
                  {...register("email", { required: "Required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} />
              </F>
              <F label="Mobile Number" req hint="10-digit, starts 6–9" err={errors.phone?.message}>
                <input style={INP} type="tel" maxLength={10} placeholder="9XXXXXXXXX"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, "")}
                  {...register("phone", { required: "Required", pattern: { value: /^[6-9]\d{9}$/, message: "Valid 10-digit number" } })} />
              </F>
              <F label="Emergency Contact" req hint="Must be different person, valid 10-digit" err={errors.emergency_contact?.message}>
                <input style={INP} type="tel" maxLength={10} placeholder="9XXXXXXXXX"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, "")}
                  {...register("emergency_contact", {
                    required: "Emergency contact is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Valid 10-digit Indian mobile" },
                  })} />
              </F>
              <F label="Password" req err={errors.password?.message}>
                <input style={INP} type="password" placeholder="Min. 8 characters"
                  {...register("password", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })} />
              </F>
              <F label="Confirm Password" req err={errors.confirm_password?.message}>
                <input style={INP} type="password" placeholder="Re-enter password"
                  {...register("confirm_password", { required: "Required", validate: v => v === pw || "Passwords do not match" })} />
              </F>
              <F label="Date of Birth" req hint="Age must be 18–65 years" err={errors.date_of_birth?.message}>
                <input style={INP} type="date"
                  max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0]}
                  min={new Date(Date.now() - 65 * 365.25 * 86400000).toISOString().split("T")[0]}
                  {...register("date_of_birth", {
                    required: "Date of birth is required",
                    validate: v => { const a = calcAge(v); return (a >= 18 && a <= 65) || "Age must be 18–65 years"; }
                  })} />
                {computedAge !== null && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: computedAge >= 18 && computedAge <= 65 ? "#16a34a" : "#dc2626" }}>
                    Calculated age: {computedAge} years {computedAge >= 18 && computedAge <= 65 ? "✓" : "✗"}
                  </span>
                )}
              </F>
              <F label="Occupation" err={undefined}>
                <input style={INP} placeholder="Student / Engineer / Doctor…"
                  {...register("occupation")} />
              </F>
              <F label="Gender" req err={errors.gender?.message}>
                <select style={SEL} {...register("gender", { required: "Required" })}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </F>
              <F label="Blood Group" req err={errors.blood_group?.message}>
                <select style={SEL} {...register("blood_group", { required: "Required" })}>
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </F>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 1 — Health Eligibility ════════════════════ */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "0.9rem 1.1rem", fontSize: "0.79rem", color: "#92400e", lineHeight: 1.6 }}>
              💡 <strong>Eligibility criteria:</strong> Weight ≥ 50 kg · Hemoglobin ≥ 12.5 g/dL · Age 18–65 years. Hospital admin verifies before approval.
            </div>
            <div style={G2}>
              <F label="Weight (kg)" req hint="Minimum 50 kg" err={errors.weight?.message}>
                <input style={INP} type="number" step="0.1" min="50" max="200" placeholder="e.g. 65.5"
                  {...register("weight", { required: "Required", min: { value: 50, message: "Min 50 kg" }, max: { value: 200, message: "Invalid weight" } })} />
              </F>
              <F label="Hemoglobin (g/dL)" req hint="Minimum 12.5 g/dL" err={errors.hemoglobin?.message}>
                <input style={INP} type="number" step="0.1" min="12.5" max="25" placeholder="e.g. 13.5"
                  {...register("hemoglobin", { required: "Required", min: { value: 12.5, message: "Min 12.5 g/dL" }, max: { value: 25, message: "Invalid value" } })} />
              </F>
              <F label="Last Donation Date" hint="Leave blank if first-time donor" err={errors.last_donation?.message}>
                <input style={INP} type="date" max={new Date().toISOString().split("T")[0]}
                  {...register("last_donation")} />
              </F>
              <F label="Preferred Donation Time" req err={errors.preferred_time?.message}>
                <select style={SEL} {...register("preferred_time", { required: "Required" })}>
                  <option value="">Select Time</option>
                  <option value="Morning">🌅 Morning (6 AM – 12 PM)</option>
                  <option value="Afternoon">☀️ Afternoon (12 PM – 6 PM)</option>
                  <option value="Evening">🌇 Evening (6 PM – 10 PM)</option>
                </select>
              </F>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 2 — Documents ═════════════════════════════ */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "0.9rem 1.1rem", fontSize: "0.79rem", color: "#0369a1", lineHeight: 1.6 }}>
              📎 <strong>Upload supporting documents</strong> to help the admin verify your eligibility quickly. Documents are securely stored and only visible to hospital administrators.
            </div>
            <div style={G2}>
              <UploadBox
                label="Profile Photo"
                accept="image/jpeg,image/png,image/webp"
                hint="JPG / PNG / WebP — max 5 MB"
                icon="📸"
                value={photoFile}
                onChange={setPhotoFile}
              />
              <UploadBox
                label="Hemoglobin Report / Lab Document"
                accept="image/jpeg,image/png,application/pdf"
                hint="JPG / PNG / PDF — max 10 MB"
                icon="🧾"
                value={docFile}
                onChange={setDocFile}
              />
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "0.85rem 1rem", fontSize: "0.76rem", color: "#64748b", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ flexShrink: 0 }}>💡</span>
              <span>Documents are optional at registration but help speed up admin approval. You can request the admin to upload on your behalf if not available.</span>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 3 — Location ══════════════════════════════ */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "0.9rem 1.1rem", fontSize: "0.79rem", color: "#166534", lineHeight: 1.6 }}>
              📍 <strong>Your location</strong> is used only for nearest-donor emergency matching. Never shared publicly.
            </div>
            <div style={G2}>
              <F label="Address / Locality" req err={errors.address?.message} full>
                <input style={INP} placeholder="Street / Area / Locality"
                  {...register("address", { required: "Address is required" })} />
              </F>
              <F label="City" req err={errors.city?.message}>
                <input style={INP} placeholder="e.g. Mumbai"
                  {...register("city", { required: "City is required" })} />
              </F>
              <F label="PIN Code" req hint="6 digits" err={errors.pin_code?.message}>
                <input style={INP} maxLength={6} placeholder="400001"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, "")}
                  {...register("pin_code", {
                    required: "PIN code is required",
                    pattern: { value: /^\d{6}$/, message: "Must be exactly 6 digits" },
                  })} />
              </F>
            </div>

            {/* GPS options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button type="button" onClick={captureGPS} disabled={gpsLoading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "10px", background: gpsLoading ? "#f8fafc" : "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px dashed #93c5fd", color: "#1d4ed8", fontWeight: 700, fontSize: "0.82rem", cursor: gpsLoading ? "wait" : "pointer" }}>
                {gpsLoading ? "⏳ Detecting…" : "📡 Use Live GPS"}
              </button>
              <button type="button" onClick={geocodeTyped} disabled={geocoding}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "10px", background: geocoding ? "#f8fafc" : "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1.5px dashed #6ee7b7", color: "#166534", fontWeight: 700, fontSize: "0.82rem", cursor: geocoding ? "wait" : "pointer" }}>
                {geocoding ? "🔍 Searching…" : "🔍 Trace Typed Address"}
              </button>
            </div>
            {gpsErr && <div style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600, background: "#fef2f2", padding: "0.5rem 0.75rem", borderRadius: "8px" }}>⚠ {gpsErr}</div>}

            {/* Hidden lat/lng */}
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />

            <MapPreview lat={mapCoords.lat} lng={mapCoords.lng} />

            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center" }}>
              You can use <strong>Live GPS</strong> for automatic detection, or enter your address above then click <strong>Trace Typed Address</strong> to find it on the map.
            </div>
          </div>
        )}

        {/* ══════════════ Navigation ══════════════════════════════════════ */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          {step > 0 && (
            <button type="button" onClick={() => { setStep(s => s - 1); setSubmitErr(""); }}
              style={{ flex: 1, padding: "0.82rem", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", color: "#475569" }}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={goNext}
              style={{ flex: 2, padding: "0.82rem", borderRadius: "10px", background: "linear-gradient(135deg, #b91c1c, #991b1b)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(185,28,28,0.25)" }}>
              Continue →
            </button>
          ) : (
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: "0.82rem", borderRadius: "10px", background: loading ? "#f1f5f9" : "linear-gradient(135deg, #b91c1c, #991b1b)", color: loading ? "#94a3b8" : "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(185,28,28,0.25)" }}>
              {loading ? "⏳ Submitting registration…" : "🩸 Complete Registration"}
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8", marginTop: "1rem", marginBottom: 0 }}>
          Already registered?{" "}
          <a href="/donor-login" style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "none" }}>Log in here</a>
        </p>
      </form>
    </div>
  );
}