import React from "react";
import DonorRegistrationForm from "../../components/forms/DonorRegistrationForm";

export default function DonorRegistration({ notify }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff5f5 0%, #fff 40%, #f0f9ff 100%)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "3rem 1rem 4rem",
    }}>
      {/* Decorative side panel — desktop only */}
      <div style={{ display: "none" }} className="reg-side-panel" />

      <div style={{ width: "100%", maxWidth: 720 }}>
        {/* Breadcrumb */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Digital Blood Sync · Donor Portal
          </span>
        </div>

        <DonorRegistrationForm onSuccess={notify} />

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginTop: "1.75rem" }}>
          {[
            { icon: "🔒", label: "256-bit Encrypted" },
            { icon: "🏥", label: "Hospital Verified" },
            { icon: "📍", label: "Location Private" },
          ].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 600, color: "#64748b" }}>
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}