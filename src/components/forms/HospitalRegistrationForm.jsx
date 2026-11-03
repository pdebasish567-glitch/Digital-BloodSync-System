import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Field from "./Field";
import { registerHospital } from "../../services/authService";

const initial = {
  hospital_name: "", registration_number: "", email: "", phone: "",
  password: "", confirm: "", address: "", city: "", pin_code: "",
  latitude: null, longitude: null,
};

function MapPreview({ lat, lng }) {
  if (!lat || !lng) return null;
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  return (
    <div style={{ marginTop: "0.75rem", borderRadius: "0.75rem", overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
      <div style={{ background: "#f0fdf4", padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>
        📍 Hospital location on Google Maps
      </div>
      <iframe title="Hospital Location" src={src} width="100%" height="220"
        style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" />
    </div>
  );
}

export default function HospitalRegistrationForm({ onSuccess }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const navigate = useNavigate();
  const update = e => setData({ ...data, [e.target.name]: e.target.value });

  const captureGPS = () => {
    if (!navigator.geolocation) return onSuccess("Geolocation not supported.", "error");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setData(d => ({
          ...d,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setGpsLoading(false);
      },
      () => { onSuccess("Could not get location. Please allow browser location permission.", "error"); setGpsLoading(false); }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(data.phone))
      return onSuccess("Enter a valid 10-digit Indian phone number.", "error");
    if (data.password !== data.confirm)
      return onSuccess("Passwords do not match.", "error");
    if (data.password.length < 8)
      return onSuccess("Password must be at least 8 characters.", "error");

    const payload = {
      hospital_name: data.hospital_name,
      registration_number: data.registration_number,
      email: data.email,
      phone: data.phone,
      password: data.password,
      address: data.address,
      city: data.city,
      pin_code: data.pin_code,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    setLoading(true);
    try {
      const res = await registerHospital(payload);
      localStorage.setItem("token", res.tokens.access);
      onSuccess("Hospital registered successfully! Please log in.", "success");
      navigate("/hospital-login");
    } catch (err) {
      onSuccess(err.message || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-card wide" onSubmit={submit}>
      <div className="profile-form-banner">
        <div>
          <span className="eyebrow">Hospital / Blood Bank</span>
          <h3>Register your hospital</h3>
          <p>Create a secure admin account to manage your hospital's blood bank.</p>
        </div>
        <span className="profile-avatar">🏥</span>
      </div>

      <div className="form-section-title">Hospital Details</div>
      <div className="form-grid">
        <Field label="Hospital Name *" name="hospital_name" value={data.hospital_name} onChange={update} required placeholder="e.g. Capital Hospital" />
        <Field label="Registration Number *" name="registration_number" value={data.registration_number} onChange={update} required placeholder="Official registration ID" />
        <Field label="Email *" name="email" type="email" value={data.email} onChange={update} required placeholder="admin@hospital.com" />
        <Field label="Phone *" name="phone" value={data.phone} onChange={update} required placeholder="10-digit mobile" />
        <Field label="Password *" name="password" type="password" value={data.password} onChange={update} required placeholder="Min. 8 characters" />
        <Field label="Confirm Password *" name="confirm" type="password" value={data.confirm} onChange={update} required placeholder="Re-enter password" />
      </div>

      <div className="form-section-title">Address & GPS Location</div>
      <div className="form-grid">
        <Field label="Address *" name="address" value={data.address} onChange={update} required placeholder="Hospital address" />
        <Field label="City *" name="city" value={data.city} onChange={update} required placeholder="e.g. Bhubaneswar" />
        <Field label="PIN Code *" name="pin_code" value={data.pin_code} onChange={update} required placeholder="6-digit PIN" />
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="button" className="btn btn-outline" onClick={captureGPS} disabled={gpsLoading}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {gpsLoading ? "⏳ Getting location…" : "📍 Capture Hospital GPS Location"}
          </button>
          <MapPreview lat={data.latitude} lng={data.longitude} />
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Registering…" : "Register Hospital"}
      </button>
    </form>
  );
}