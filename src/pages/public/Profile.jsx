import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User, Mail, Phone, Building2, MapPin, ShieldCheck,
  LogOut, KeyRound, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0.9rem",
      padding: "0.85rem 1rem", borderRadius: "12px",
      background: "#f8fafc", border: "1px solid #f1f5f9",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
        background: "linear-gradient(135deg, #fef2f2, #fecaca)",
        display: "grid", placeItems: "center",
      }}>
        <Icon size={16} style={{ color: "#b91c1c" }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a", marginTop: "0.15rem", wordBreak: "break-all" }}>{value || "—"}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.05)" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.78rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {title}
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function Profile({ notify }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email?.split("@")[0]
    : "Administrator";

  const hospitalName = user?.hospital_profile?.hospital_name || "Hospital Administrator";
  const city         = user?.hospital_profile?.city          || null;
  const role         = user?.role || "ADMIN";

  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "AD";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Page eyebrow */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Account</div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.3rem" }}>Admin Profile</h1>
        <p style={{ fontSize: "0.84rem", color: "#94a3b8", margin: 0 }}>Your account details and session information.</p>
      </div>

      {/* Hero card */}
      <div style={{
        background: "linear-gradient(135deg, #1a0505, #7f1d1d)",
        borderRadius: "20px", padding: "2rem 2.5rem",
        marginBottom: "1.5rem", color: "#fff",
        display: "flex", alignItems: "center", gap: "1.5rem",
        flexWrap: "wrap", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circle */}
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", right: -60, top: -60, pointerEvents: "none" }} />

        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(220,38,38,0.6), rgba(153,27,27,0.8))",
          border: "2px solid rgba(255,255,255,0.15)",
          display: "grid", placeItems: "center",
          fontSize: "1.6rem", fontWeight: 900, color: "#fff",
          flexShrink: 0,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.1em" }}>Signed in as</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.2, marginTop: "0.2rem" }}>{fullName}</div>
          <div style={{ fontSize: "0.82rem", color: "#fecaca", marginTop: "0.3rem" }}>{hospitalName}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.3rem 0.85rem", fontSize: "0.75rem", fontWeight: 700 }}>
            <ShieldCheck size={13} />
            {role === "ADMIN" ? "Hospital Admin" : role}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
            <Clock size={11} /> Session active
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <SectionCard title="Account Information">
          <InfoRow icon={User}      label="Full Name"      value={fullName} />
          <InfoRow icon={Mail}      label="Email Address"  value={user?.email} />
          <InfoRow icon={Phone}     label="Phone Number"   value={user?.phone} />
        </SectionCard>

        <SectionCard title="Hospital Details">
          <InfoRow icon={Building2} label="Hospital / Organisation" value={hospitalName} />
          {city && <InfoRow icon={MapPin} label="City" value={city} />}
          <InfoRow icon={ShieldCheck} label="Role" value={role === "ADMIN" ? "Hospital Administrator" : role} />
        </SectionCard>

        <SectionCard title="Security">
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "0.85rem 1rem", fontSize: "0.8rem", color: "#92400e", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <KeyRound size={15} style={{ flexShrink: 0 }} />
            <span>To change your password, contact the system administrator or use the Django admin panel at <strong>localhost:8000/admin/</strong>.</span>
          </div>
        </SectionCard>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          background: "#fff", border: "1.5px solid #fecaca",
          borderRadius: "12px", padding: "0.75rem 1.5rem",
          color: "#dc2626", fontWeight: 700, fontSize: "0.88rem",
          cursor: "pointer", width: "100%", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
      >
        <LogOut size={16} />
        Sign out of admin account
      </button>
    </div>
  );
}