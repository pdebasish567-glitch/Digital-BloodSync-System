import React from "react";
import LoginForm from "../../components/forms/LoginForm";

const features = [
  { icon: "🩸", title: "Blood Inventory", desc: "Monitor units by group, filter by expiry, and remove expired batches." },
  { icon: "🚨", title: "Emergency Requests", desc: "Post urgent requests and view which donors accepted with their map location." },
  { icon: "📋", title: "Donor Approvals", desc: "Review applications with full health details and approve or reject with email." },
  { icon: "📊", title: "Live Dashboard", desc: "KPI overview — valid stock, active emergencies, pending donors at a glance." },
];

export default function HospitalLogin({ notify }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0f172a" }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "3rem 3.5rem",
        background: "linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2.5rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center", fontSize: "1.2rem" }}>🏥</div>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Digital Blood Sync</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Secure blood bank<br />management portal.
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 380 }}>
            Complete inventory control, emergency donor coordination, and real-time expiry tracking — all from one hospital admin dashboard.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {features.map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontSize: "1rem", flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{f.title}</div>
                  <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", background: "#f8fafc",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <LoginForm role="Hospital" notify={notify} />
        </div>
      </div>
    </div>
  );
}