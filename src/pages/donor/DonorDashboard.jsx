import React, { useMemo, useState, useEffect, useCallback } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  Activity, Bell, Calendar, Check, CheckCircle2, Clock, Droplets,
  HeartPulse, LayoutDashboard, LogOut, MapPin, Menu, ShieldCheck,
  TrendingUp, UserRound, X, ChevronRight, ClipboardList, Upload,
  FileText, Trash2, Plus, RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getEmergencyRequests, respondToEmergency, getMyResponses, getDonationRecords, createDonationRecord, deleteDonationRecord } from "../../services/emergencyService";
import { apiRequest } from "../../services/apiClient";
import { EmergencyAlert } from "../../components/common/NotificationPopup";

// ── Eligibility helper ─────────────────────────────────────────────────────────
function getEligibility(lastDonation) {
  if (!lastDonation) return { eligible: true, label: "Eligible", daysLeft: null, text: "No recent donation on record." };
  const last = new Date(`${lastDonation}T12:00:00`);
  const next = new Date(last);
  next.setMonth(next.getMonth() + 4);
  const now = new Date();
  const eligible = now >= next;
  const daysLeft = eligible ? 0 : Math.ceil((next - now) / 86400000);
  return {
    eligible, label: eligible ? "Eligible to Donate" : "Not Yet Eligible",
    daysLeft,
    text: eligible
      ? "The 4-month waiting period has passed. You can donate now."
      : `Next eligible: ${next.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} (${daysLeft} days)`,
  };
}

// ── Google Maps embed ──────────────────────────────────────────────────────────
function MapEmbed({ lat, lng }) {
  if (!lat || !lng) return (
    <div style={{ background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: "14px", padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📍</div>
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>No GPS location captured</div>
      <div style={{ fontSize: "0.8rem" }}>Update your profile to enable emergency donor matching.</div>
    </div>
  );
  return (
    <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div style={{ background: "#f0fdf4", padding: "0.6rem 1rem", fontSize: "0.78rem", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <MapPin size={13} /> GPS Location Active · Used for emergency matching within 5–10 km
      </div>
      <iframe title="donor-location" src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`} width="100%" height="260" style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" />
      <div style={{ padding: "0.5rem 1rem", fontSize: "0.72rem", color: "#94a3b8", background: "#f8fafc" }}>
        Coordinates: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function DonorSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "Donor";
  const bloodGroup = user?.donor_profile?.blood_group || "—";
  const links = [
    { to: "/donor-dashboard",          label: "Overview",           icon: LayoutDashboard, end: true },
    { to: "/donor-dashboard/requests", label: "Emergency Requests", icon: Bell },
    { to: "/donor-dashboard/history",  label: "Donation History",   icon: ClipboardList },
    { to: "/donor-dashboard/profile",  label: "My Profile",         icon: UserRound },
  ];
  const handleLogout = () => { logout(); onClose?.(); };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 69 }} />}
      <aside style={{
        position: "fixed", inset: "0 auto 0 0", width: 248, zIndex: 70,
        background: "linear-gradient(180deg, #1a0505 0%, #2d0a0a 40%, #1f0606 100%)",
        display: "flex", flexDirection: "column", padding: "0 10px",
        boxShadow: "4px 0 40px rgba(185,28,28,0.2)",
        transition: "transform 0.2s ease",
        transform: open ? "translateX(0)" : undefined
      }} className={`donor-sidebar ${open ? "open" : ""}`}>

        {/* Brand */}
        <div style={{ padding: "22px 12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #dc2626, #991b1b)", display: "grid", placeItems: "center", fontSize: "1.1rem", boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}>❤️</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.88rem", lineHeight: 1.2 }}>Digital Blood</div>
                <div style={{ color: "#fca5a5", fontSize: "0.64rem", fontWeight: 600 }}>Donor Portal</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: open ? "block" : "none" }}><X size={16} /></button>
          </div>

          {/* Donor profile pill */}
          <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #dc2626, #991b1b)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
              {fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "D"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</div>
              <div style={{ color: "#fca5a5", fontSize: "0.65rem", fontWeight: 600 }}>Blood Group: {bloodGroup}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "14px 0", overflowY: "auto" }}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "10px 14px", borderRadius: "10px",
                color: isActive ? "#fff" : "#94a3b8",
                fontWeight: isActive ? 700 : 600, fontSize: "0.82rem",
                background: isActive ? "linear-gradient(135deg, rgba(220,38,38,0.25), rgba(185,28,28,0.12))" : "transparent",
                border: isActive ? "1px solid rgba(220,38,38,0.3)" : "1px solid transparent",
                textDecoration: "none",
                boxShadow: isActive ? "0 0 20px rgba(220,38,38,0.12)" : "none",
                transition: "all 0.15s"
              })}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "10px 14px", borderRadius: "10px", background: "none", border: "1px solid transparent", color: "#94a3b8", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#94a3b8"; }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <style>{`
        @media(max-width:780px){
          .donor-sidebar{transform:translateX(-100%)!important}
          .donor-sidebar.open{transform:translateX(0)!important}
        }
      `}</style>
    </>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────
function Layout({ children, notify }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [responses, setResponses] = useState({});

  const donorProfile = user?.donor_profile;
  const approvalStatus = donorProfile?.approval_status || "PENDING";
  const bloodGroup = donorProfile?.blood_group;
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "Donor";
  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "D";

  // WebSocket for emergency alerts (only approved donors)
  useEffect(() => {
    if (approvalStatus !== "APPROVED") return;
    let ws;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/emergency/");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "alarm" && data.data) {
            // Only alert if blood group matches or no specific group
            if (!data.data.blood_group || !bloodGroup || data.data.blood_group === bloodGroup) {
              setEmergencyAlert(data.data);
            }
          }
        } catch (_) {}
      };
      ws.onerror = () => {};
    } catch (_) {}
    return () => { if (ws && ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [approvalStatus, bloodGroup]);

  const handleAccept = (id) => {
    setResponses(p => ({ ...p, [id]: "accepted" }));
    setEmergencyAlert(null);
    notify?.("✅ You've accepted the emergency request! Please proceed to donate.", "success");
  };

  const handleDecline = (id) => {
    setResponses(p => ({ ...p, [id]: "declined" }));
    setEmergencyAlert(null);
    notify?.("Request declined. Thank you for responding.", "error");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Emergency Alert Popup */}
      <EmergencyAlert
        alert={emergencyAlert}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onDismiss={() => setEmergencyAlert(null)}
      />

      <DonorSidebar open={open} onClose={() => setOpen(false)} />

      <div style={{ marginLeft: 248, width: "calc(100% - 248px)", display: "flex", flexDirection: "column", minHeight: "100vh" }} className="donor-content">
        {/* Topbar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40, height: 68,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", boxShadow: "0 1px 20px rgba(15,23,42,0.06)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><Menu size={22} /></button>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em" }}>Donor Portal</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>My Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.35rem 0.75rem", borderRadius: "999px", background: approvalStatus === "APPROVED" ? "#f0fdf4" : approvalStatus === "PENDING" ? "#fffbeb" : "#fef2f2", border: `1px solid ${approvalStatus === "APPROVED" ? "#bbf7d0" : approvalStatus === "PENDING" ? "#fde68a" : "#fecaca"}`, fontSize: "0.72rem", fontWeight: 700, color: approvalStatus === "APPROVED" ? "#16a34a" : approvalStatus === "PENDING" ? "#d97706" : "#dc2626" }}>
              {approvalStatus === "APPROVED" ? "✅ Active Donor" : approvalStatus === "PENDING" ? "⏳ Pending Approval" : "❌ Rejected"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #fef2f2, #fecaca)", display: "grid", placeItems: "center", color: "#b91c1c", fontSize: "0.7rem", fontWeight: 800 }}>{initials}</div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{fullName}</div>
                <div style={{ fontSize: "0.63rem", color: "#94a3b8" }}>{donorProfile?.blood_group} · {donorProfile?.city || "—"}</div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 30px" }}>
          {children}
        </main>
      </div>
      <style>{`@media(max-width:780px){.donor-content{margin-left:0!important;width:100%!important}}`}</style>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ children, tone }) {
  const s = {
    green:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    amber:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    slate:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  }[tone || "slate"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {children}
    </span>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function Overview({ notify }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const donorProfile = user?.donor_profile;
  const [available, setAvailable] = useState(donorProfile?.is_available ?? true);
  const [toggling,  setToggling]  = useState(false);
  const [requests, setRequests]   = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading]     = useState(true);

  // Sync if profile reloads
  useEffect(() => { setAvailable(donorProfile?.is_available ?? true); }, [donorProfile?.is_available]);

  const fullName = `${user?.first_name || ""}`.trim() || "Donor";
  const bloodGroup = donorProfile?.blood_group || "—";
  const lastDonation = donorProfile?.last_donation;
  const eligibility = useMemo(() => getEligibility(lastDonation), [lastDonation]);
  const approvalStatus = donorProfile?.approval_status || "PENDING";

  useEffect(() => {
    if (approvalStatus === "APPROVED") {
      Promise.all([
        getEmergencyRequests(),
        getMyResponses(),
      ]).then(([reqs, myResps]) => {
        setRequests(reqs);
        const mapped = {};
        Object.entries(myResps || {}).forEach(([id, action]) => {
          mapped[id] = action === "accepted" ? "Accepted" : "Declined";
        });
        setResponses(mapped);
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [approvalStatus]);

  const handleToggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await apiRequest("/donors/toggle-availability/", { method: "POST" });
      setAvailable(res.is_available);
      notify?.(
        res.is_available ? "🟢 You are now marked as Available." : "⚫ You are now marked as Not Available.",
        res.is_available ? "success" : "error"
      );
    } catch (err) {
      notify?.("Could not update availability: " + err.message, "error");
    } finally {
      setToggling(false);
    }
  };

  const respond = async (id, action) => {
    setResponses(p => ({ ...p, [id]: action }));
    try {
      await respondToEmergency(id, action === "Accepted" ? "accepted" : "declined");
      notify?.(
        action === "Accepted" ? "✅ Response saved! Please proceed to the hospital." : "Response saved. Thank you for replying.",
        action === "Accepted" ? "success" : "error"
      );
    } catch (err) {
      setResponses(p => { const n = { ...p }; delete n[id]; return n; });
      notify?.("Failed to save response: " + err.message, "error");
    }
  };


  return (
    <>
      {/* Status banner */}
      {approvalStatus === "PENDING" && (
        <div style={{ background: "linear-gradient(135deg, #fffbeb, #fff)", border: "1px solid #fde68a", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start", boxShadow: "0 4px 16px rgba(217,119,6,0.1)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#fef3c7", display: "grid", placeItems: "center", fontSize: "1.4rem", flexShrink: 0 }}>⏳</div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#92400e", marginBottom: "0.3rem" }}>Registration Pending Hospital Approval</div>
            <div style={{ fontSize: "0.83rem", color: "#78350f" }}>Your account is under verification by hospital administrators. Once approved, you'll receive emergency donation requests. This typically takes 1–2 working days.</div>
          </div>
        </div>
      )}
      {approvalStatus === "REJECTED" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#fee2e2", display: "grid", placeItems: "center", fontSize: "1.4rem", flexShrink: 0 }}>❌</div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#991b1b", marginBottom: "0.3rem" }}>Registration Rejected</div>
            <div style={{ fontSize: "0.83rem", color: "#7f1d1d" }}>Your donor registration was not approved. Please contact hospital staff for more information.</div>
          </div>
        </div>
      )}

      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg, #1a0505, #7f1d1d)", borderRadius: "20px", padding: "2rem 2.5rem", marginBottom: "1.5rem", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)", right: -80, top: -80 }} />
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>Welcome back</div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.15 }}>Hello, {fullName} 👋</div>
          <div style={{ fontSize: "0.88rem", color: "#fecaca", marginTop: "0.4rem" }}>
            {approvalStatus === "APPROVED"
              ? "You're an active donor. Stay available to save lives."
              : "Complete your verification to start donating."}
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ textAlign: "center", padding: "1rem 1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff" }}>{bloodGroup}</div>
            <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Blood Group</div>
          </div>
          <div onClick={handleToggleAvailability} style={{ textAlign: "center", padding: "1rem 1.5rem", background: available ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)", borderRadius: "14px", border: `1px solid ${available ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`, cursor: toggling ? "wait" : "pointer", transition: "all 0.2s", opacity: toggling ? 0.7 : 1 }}>
            <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{toggling ? "⏳" : available ? "🟢" : "⚫"}</div>
            <div style={{ fontSize: "0.78rem", color: available ? "#86efac" : "#94a3b8", fontWeight: 700 }}>{available ? "Available" : "Not Available"}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{toggling ? "Updating…" : "Tap to toggle"}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          {
            icon: HeartPulse, label: "Eligibility", value: eligibility.label,
            sub: eligibility.daysLeft ? `${eligibility.daysLeft} days remaining` : eligibility.text,
            color: eligibility.eligible ? "#16a34a" : "#d97706", bg: eligibility.eligible ? "#f0fdf4" : "#fffbeb", border: eligibility.eligible ? "#bbf7d0" : "#fde68a"
          },
          {
            icon: Calendar, label: "Last Donation",
            value: lastDonation ? new Date(`${lastDonation}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Never",
            sub: lastDonation ? "Keep donating every 4 months" : "No donation recorded yet",
            color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe"
          },
          {
            icon: Bell, label: "Active Requests",
            value: requests.filter(r => r.status === "Searching").length,
            sub: "Matching blood requests in area",
            color: "#dc2626", bg: "#fef2f2", border: "#fecaca"
          },
          {
            icon: ShieldCheck, label: "Account Status",
            value: approvalStatus,
            sub: approvalStatus === "APPROVED" ? "Verified & active" : "Awaiting hospital review",
            color: approvalStatus === "APPROVED" ? "#16a34a" : "#d97706",
            bg: approvalStatus === "APPROVED" ? "#f0fdf4" : "#fffbeb",
            border: approvalStatus === "APPROVED" ? "#bbf7d0" : "#fde68a"
          },
        ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
          <div key={label} style={{ background: `linear-gradient(135deg, ${bg}, #fff)`, border: `1px solid ${border}`, borderRadius: "16px", padding: "1.1rem 1.25rem", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: bg, border: `1px solid ${border}`, display: "grid", placeItems: "center", color }}><Icon size={17} /></div>
              <TrendingUp size={13} style={{ color: "#cbd5e1" }} />
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginTop: "0.2rem" }}>{label}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Emergency requests + readiness */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem", alignItems: "start" }}>
        {/* Emergency requests */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.4rem", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Emergency Requests</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "1px" }}>Matching requests for {bloodGroup} near your area</div>
            </div>
            <Bell size={18} style={{ color: "#b91c1c" }} />
          </div>
          <div style={{ padding: "1.1rem 1.4rem" }}>
            {approvalStatus !== "APPROVED" ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "grid", placeItems: "center", margin: "0 auto 0.75rem", color: "#94a3b8" }}><Bell size={24} /></div>
                <div style={{ fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Hospital approval required</div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>You'll receive emergency alerts once verified by hospital staff.</div>
              </div>
            ) : loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading requests…</div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                <div style={{ color: "#16a34a", fontWeight: 600 }}>No active emergencies right now</div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>You'll be alerted when blood matching {bloodGroup} is needed nearby.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {requests.slice(0, 4).map(r => {
                  const response = responses[r.id];
                  const urgencyColor = r.urgency_level === "Critical" ? "#dc2626" : r.urgency_level === "Urgent" ? "#d97706" : "#16a34a";
                  const urgencyBg   = r.urgency_level === "Critical" ? "#fef2f2" : r.urgency_level === "Urgent" ? "#fffbeb" : "#f0fdf4";
                  return (
                    <div key={r.id} style={{ border: "1px solid #f1f5f9", borderRadius: "12px", overflow: "hidden", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#fecaca"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#f1f5f9"}>
                      <div style={{ background: urgencyBg, padding: "0.6rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>ER-{r.id}</span>
                        <Badge tone={r.urgency_level === "Critical" ? "red" : r.urgency_level === "Urgent" ? "amber" : "green"}>{r.urgency_level}</Badge>
                      </div>
                      <div style={{ padding: "0.8rem 1rem" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.3rem" }}>
                          <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: "6px", marginRight: "0.4rem", fontSize: "0.85rem" }}>{r.blood_group}</span>
                          {r.units_required} unit{r.units_required !== 1 ? "s" : ""} needed
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <MapPin size={12} /> {r.location_name}
                        </div>
                        {!response ? (
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <button onClick={() => respond(r.id, "Accepted")} style={{ flex: 1, background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.55rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                              <Check size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Accept
                            </button>
                            <button onClick={() => respond(r.id, "Declined")} style={{ flex: 1, background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.55rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                              <X size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Decline
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: "0.75rem" }}>
                            <Badge tone={response === "Accepted" ? "green" : "red"}>{response === "Accepted" ? "✅ You accepted" : "❌ You declined"}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {requests.length > 4 && (
                  <button onClick={() => navigate("/donor-dashboard/requests")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.65rem", fontSize: "0.8rem", fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                    View all {requests.length} requests <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Readiness checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", padding: "1.25rem", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>Donation Readiness</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { label: "Profile complete",         ok: true },
                { label: `Blood group: ${bloodGroup}`, ok: bloodGroup !== "—" },
                { label: `Available: ${available ? "Yes" : "No"}`, ok: available },
                { label: `Eligibility: ${eligibility.label}`,   ok: eligibility.eligible },
                { label: `GPS location: ${donorProfile?.latitude ? "Captured" : "Missing"}`, ok: !!donorProfile?.latitude },
                { label: `Account: ${approvalStatus}`, ok: approvalStatus === "APPROVED" },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", borderRadius: "8px", background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: ok ? "#16a34a" : "#dc2626", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {ok ? <Check size={12} color="#fff" /> : <X size={12} color="#fff" />}
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: ok ? "#166534" : "#991b1b" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility countdown */}
          {!eligibility.eligible && eligibility.daysLeft && (
            <div style={{ background: "linear-gradient(135deg, #fffbeb, #fff)", border: "1px solid #fde68a", borderRadius: "14px", padding: "1.25rem", textAlign: "center" }}>
              <Clock size={28} style={{ color: "#d97706", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{eligibility.daysLeft}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400e", marginTop: "0.25rem" }}>days until next donation</div>
              <div style={{ fontSize: "0.72rem", color: "#a16207", marginTop: "0.5rem" }}>{eligibility.text}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Requests ───────────────────────────────────────────────────────────────────
function Requests({ notify }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const approvalStatus = user?.donor_profile?.approval_status || "PENDING";

  useEffect(() => {
    Promise.all([
      getEmergencyRequests(),
      getMyResponses(),
    ]).then(([reqs, myResps]) => {
      setRequests(reqs);
      const mapped = {};
      Object.entries(myResps || {}).forEach(([id, action]) => {
        mapped[id] = action === "accepted" ? "Accepted" : "Declined";
      });
      setResponses(mapped);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const respond = async (id, action) => {
    setResponses(p => ({ ...p, [id]: action }));
    try {
      await respondToEmergency(id, action === "Accepted" ? "accepted" : "declined");
      notify?.(
        action === "Accepted" ? "✅ Response saved! Please proceed to the hospital." : "Response saved. Thank you.",
        action === "Accepted" ? "success" : "error"
      );
    } catch (err) {
      setResponses(p => { const n = { ...p }; delete n[id]; return n; });
      notify?.("Failed to save response: " + err.message, "error");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Donor Requests</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Emergency Requests</h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Active blood donation requests from the hospital. Your responses are saved to the database.</p>
        </div>
      </div>

      {approvalStatus !== "APPROVED" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
          <div style={{ fontWeight: 700, color: "#991b1b" }}>Hospital approval required to view and respond to requests</div>
        </div>
      )}

      {approvalStatus === "APPROVED" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading…</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155" }}>No active emergency requests</div>
            <div style={{ color: "#94a3b8", marginTop: "0.5rem" }}>You'll be alerted via popup when a matching request comes in.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "1rem" }}>
            {requests.map(r => {
              const response = responses[String(r.id)];
              const isU = r.urgency_level === "Urgent", isC = r.urgency_level === "Critical";
              const c = isC ? { bg: "#fef2f2", border: "#fecaca" } : isU ? { bg: "#fffbeb", border: "#fde68a" } : { bg: "#f0fdf4", border: "#bbf7d0" };
              return (
                <div key={r.id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: `1px solid ${c.border}`, boxShadow: "0 4px 16px rgba(15,23,42,0.05)", transition: "transform 0.18s, box-shadow 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.05)"; }}>
                  <div style={{ background: `linear-gradient(135deg, ${c.bg}, #fff)`, padding: "1rem 1.25rem", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>ER-{r.id}</span>
                    <Badge tone={isC ? "red" : isU ? "amber" : "green"}>{r.urgency_level}</Badge>
                  </div>
                  <div style={{ padding: "1.1rem 1.25rem" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
                      <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 10px", borderRadius: "6px", marginRight: "0.4rem", fontSize: "0.9rem" }}>{r.blood_group}</span>
                      {r.units_required} units needed
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                      <MapPin size={13} /> {r.location_name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Patient: {r.patient_name}</div>
                    <div style={{ margin: "1rem 0 0", padding: "0.75rem 0", borderTop: "1px solid #f1f5f9" }}>
                      {!response ? (
                        <div style={{ display: "flex", gap: "0.6rem" }}>
                          <button onClick={() => respond(r.id, "Accepted")} style={{ flex: 1, background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.65rem", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer" }}>
                            <Check size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />I'll Donate
                          </button>
                          <button onClick={() => respond(r.id, "Declined")} style={{ flex: 1, background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.65rem", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer" }}>
                            <X size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Can't Donate
                          </button>
                        </div>
                      ) : (
                        <Badge tone={response === "Accepted" ? "green" : "red"}>
                          {response === "Accepted" ? "✅ You've accepted — please report to the hospital" : "❌ You've declined this request"}
                        </Badge>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                      <Badge tone="slate">{r.status}</Badge>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </>
  );
}

// ── Donation History ───────────────────────────────────────────────────────────
function History({ notify }) {
  const { user } = useAuth();
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [form, setForm] = useState({
    donation_date: "", blood_group: user?.donor_profile?.blood_group || "O+",
    units_donated: 1, location: "", notes: "", certificate: null
  });

  const load = () => {
    setLoading(true);
    getDonationRecords()
      .then(setRecords)
      .catch(err => notify?.("Failed to load history: " + err.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.donation_date) { notify?.("Donation date is required.", "error"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("donation_date",  form.donation_date);
      fd.append("blood_group",    form.blood_group);
      fd.append("units_donated",  form.units_donated);
      fd.append("location",       form.location);
      fd.append("notes",          form.notes);
      if (form.certificate) fd.append("certificate", form.certificate);
      const created = await createDonationRecord(fd);
      setRecords(prev => [created, ...prev]);
      setShowForm(false);
      setForm({ donation_date: "", blood_group: user?.donor_profile?.blood_group || "O+", units_donated: 1, location: "", notes: "", certificate: null });
      notify?.("✅ Donation record added successfully.", "success");
    } catch (err) {
      notify?.("Failed to add record: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDonationRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      notify?.("Record removed.", "success");
    } catch (err) {
      notify?.("Delete failed: " + err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const inp = { width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Records</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Donation History</h1>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>Your personal donation timeline. Add past records and upload certificates. Visible to hospital admins.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: "#475569" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: showForm ? "#f1f5f9" : "linear-gradient(135deg, #b91c1c, #991b1b)", color: showForm ? "#64748b" : "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1.1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Record</>}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "0 0 0 3px rgba(37,99,235,0.04)" }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>🩸 Add Donation Record</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Donation Date *</div>
              <input type="date" style={inp} value={form.donation_date} onChange={e => setForm({...form, donation_date: e.target.value})} required max={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Blood Group</div>
              <select style={{ ...inp, cursor: "pointer" }} value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Units Donated</div>
              <input type="number" min="1" max="10" style={inp} value={form.units_donated} onChange={e => setForm({...form, units_donated: Number(e.target.value)})} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Hospital / Location</div>
              <input type="text" placeholder="e.g. AIIMS Blood Bank" style={inp} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Notes (optional)</div>
              <input type="text" placeholder="Any additional notes…" style={inp} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Certificate / Proof (JPG, PNG, PDF)</div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", border: "2px dashed #bfdbfe", borderRadius: "10px", cursor: "pointer", background: "#eff6ff" }}>
                <Upload size={18} style={{ color: "#2563eb" }} />
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d4ed8" }}>{form.certificate ? form.certificate.name : "Click to upload certificate"}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Supports JPG, PNG, PDF up to 5 MB</div>
                </div>
                <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={e => setForm({...form, certificate: e.target.files?.[0] || null})} />
              </label>
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ marginTop: "1rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.7rem 1.5rem", fontWeight: 700, fontSize: "0.85rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : "💾 Save Donation Record"}
          </button>
        </form>
      )}

      {loading && <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading…</div>}

      {!loading && records.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🩸</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155" }}>No donation history yet</div>
          <div style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Click "Add Record" above to log a past or current donation and upload your certificate.</div>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {records.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.1rem 1.4rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #fef2f2, #fecaca)", display: "grid", placeItems: "center", color: "#b91c1c", fontSize: "1.2rem", flexShrink: 0 }}>🩸</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                      {r.blood_group} Blood — {r.units_donated} unit{r.units_donated !== 1 ? "s" : ""}
                    </div>
                    <Badge tone="green">Completed</Badge>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                    {r.location || "—"} · {r.donation_date}
                  </div>
                  {r.notes && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>{r.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {r.certificate_url && (
                    <a href={r.certificate_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.8rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                      <FileText size={13} /> Certificate
                    </a>
                  )}
                  <button disabled={deleting === r.id} onClick={() => handleDelete(r.id)} style={{ width: 34, height: 34, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "8px", color: "#dc2626", cursor: deleting === r.id ? "not-allowed" : "pointer", display: "grid", placeItems: "center", opacity: deleting === r.id ? 0.5 : 1 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────
function DonorProfile({ notify }) {
  const { user } = useAuth();
  const dp = user?.donor_profile;
  const [gpsCoords, setGpsCoords] = useState({ lat: dp?.latitude || null, lng: dp?.longitude || null });
  const [gpsLoading, setGpsLoading] = useState(false);
  const eligibility = useMemo(() => getEligibility(dp?.last_donation), [dp?.last_donation]);

  // Rough "lives potentially saved" = past donations × 3 (one unit helps up to 3 people)
  const approxDonations = dp?.last_donation ? 1 : 0;
  const livesSaved = approxDonations * 3;

  const approvalColor = dp?.approval_status === "APPROVED" ? "#16a34a" : dp?.approval_status === "REJECTED" ? "#dc2626" : "#d97706";
  const approvalBg    = dp?.approval_status === "APPROVED" ? "#f0fdf4" : dp?.approval_status === "REJECTED" ? "#fef2f2" : "#fffbeb";
  const approvalBorder= dp?.approval_status === "APPROVED" ? "#bbf7d0" : dp?.approval_status === "REJECTED" ? "#fecaca" : "#fde68a";
  const approvalLabel = dp?.approval_status === "APPROVED" ? "✅ Approved Donor" : dp?.approval_status === "REJECTED" ? "❌ Registration Rejected" : "⏳ Pending Admin Approval";

  const captureGPS = () => {
    if (!navigator.geolocation) { notify?.("Geolocation not supported by your browser.", "error"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoords({ lat: parseFloat(pos.coords.latitude.toFixed(6)), lng: parseFloat(pos.coords.longitude.toFixed(6)) });
        setGpsLoading(false);
        notify?.("GPS location updated.", "success");
      },
      () => { notify?.("Location access denied. Allow browser location permission.", "error"); setGpsLoading(false); }
    );
  };

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Donor";
  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Hero card */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #7f1d1d 100%)", borderRadius: "20px", padding: "2rem", marginBottom: "1.25rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", position: "relative", zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2.5px solid rgba(255,255,255,0.2)", display: "grid", placeItems: "center", fontSize: "1.6rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>{fullName}</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "0.2rem" }}>{user?.email}</div>
          </div>
          <div style={{ textAlign: "center", padding: "0.65rem 1.2rem", background: "rgba(255,255,255,0.12)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{dp?.blood_group || "—"}</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.55)", marginTop: "0.2rem", fontWeight: 700, letterSpacing: "0.06em" }}>BLOOD GROUP</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginTop: "1.5rem", position: "relative", zIndex: 1 }}>
          {[
            { label: "Donation Status", value: dp?.approval_status || "—", color: approvalColor },
            { label: "Availability",    value: dp?.is_available ? "Available" : "Unavailable", color: dp?.is_available ? "#22c55e" : "#94a3b8" },
            { label: "Preferred Time",  value: dp?.preferred_time || "—", color: "#93c5fd" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "0.85rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: s.color, marginTop: "0.25rem" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval status banner */}
      <div style={{ padding: "0.9rem 1.25rem", background: approvalBg, border: `1px solid ${approvalBorder}`, borderRadius: "14px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: approvalColor }}>{approvalLabel}</div>
        {dp?.approval_status === "PENDING" && (
          <span style={{ fontSize: "0.75rem", color: "#92400e", marginLeft: "auto" }}>Hospital admin will review your profile and notify you by email.</span>
        )}
        {dp?.approval_status === "APPROVED" && (
          <span style={{ fontSize: "0.75rem", color: "#166534", marginLeft: "auto" }}>You can respond to emergency requests from your dashboard.</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Health metrics */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", padding: "1.25rem 1.5rem", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Health Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Weight",       value: dp?.weight ? `${dp.weight} kg` : "—",       ok: parseFloat(dp?.weight) >= 50,   hint: "Min 50 kg" },
                { label: "Hemoglobin",   value: dp?.hemoglobin ? `${dp.hemoglobin} g/dL` : "—", ok: parseFloat(dp?.hemoglobin) >= 12.5, hint: "Min 12.5 g/dL" },
                { label: "Age",          value: dp?.age ? `${dp.age} years` : "—",           ok: dp?.age >= 18 && dp?.age <= 65, hint: "18–65 years" },
                { label: "Last Donation",value: dp?.last_donation || "First-time donor",     ok: eligibility.eligible,           hint: "3-month gap needed" },
              ].map(m => (
                <div key={m.label} style={{ padding: "0.85rem", background: m.ok ? "#f0fdf4" : "#fef2f2", borderRadius: "10px", border: `1px solid ${m.ok ? "#bbf7d0" : "#fecaca"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                    <span style={{ fontSize: "0.7rem" }}>{m.ok ? "✅" : "⚠️"}</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: m.ok ? "#166534" : "#dc2626", marginTop: "0.25rem" }}>{m.value}</div>
                  <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "0.1rem" }}>{m.hint}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal info grid */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", padding: "1.25rem 1.5rem", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Contact & Personal</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Phone",      value: user?.phone },
                { label: "Gender",     value: dp?.gender || "—" },
                { label: "City",       value: dp?.city || "—" },
                { label: "PIN Code",   value: dp?.pin_code || "—" },
                { label: "Occupation", value: dp?.occupation || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "#0f172a", marginTop: "0.2rem" }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div style={{ padding: "1.1rem 1.25rem", background: eligibility.eligible ? "linear-gradient(135deg, #f0fdf4, #fff)" : "linear-gradient(135deg, #fffbeb, #fff)", borderRadius: "14px", border: `1px solid ${eligibility.eligible ? "#bbf7d0" : "#fde68a"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ShieldCheck size={20} style={{ color: eligibility.eligible ? "#16a34a" : "#d97706", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: eligibility.eligible ? "#166534" : "#92400e" }}>{eligibility.label}</div>
                <div style={{ fontSize: "0.78rem", color: eligibility.eligible ? "#15803d" : "#a16207", marginTop: "0.15rem" }}>{eligibility.text}</div>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Map panel */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ padding: "1.1rem 1.4rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>📍 My Location</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Used for nearest-donor emergency matching</div>
            </div>
            {gpsCoords.lat && (
              <div style={{ fontSize: "0.65rem", color: "#64748b", textAlign: "right" }}>
                {parseFloat(gpsCoords.lat).toFixed(4)}<br />{parseFloat(gpsCoords.lng).toFixed(4)}
              </div>
            )}
          </div>
          <div style={{ padding: "1.25rem" }}>
            <MapEmbed lat={gpsCoords.lat} lng={gpsCoords.lng} />
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", marginTop: "1rem", background: gpsLoading ? "#f1f5f9" : "linear-gradient(135deg, #b91c1c, #991b1b)", color: gpsLoading ? "#94a3b8" : "#fff", border: "none", borderRadius: "10px", padding: "0.75rem", fontWeight: 700, fontSize: "0.85rem", cursor: gpsLoading ? "not-allowed" : "pointer", boxShadow: gpsLoading ? "none" : "0 4px 14px rgba(185,28,28,0.25)" }}>
              <MapPin size={15} /> {gpsLoading ? "Detecting…" : "Update My GPS Location"}
            </button>
          </div>

          {/* Quick impact card */}
          <div style={{ margin: "0 1.25rem 1.25rem", padding: "1rem", background: "linear-gradient(135deg, #fff7ed, #fff)", borderRadius: "12px", border: "1px solid #fed7aa", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ea580c" }}>❤️</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem" }}>Impact Potential</div>
            <div style={{ fontSize: "0.78rem", color: "#9a3412", marginTop: "0.2rem" }}>
              Each donation can help up to <strong>3 patients</strong>.<br />
              Stay active and available to maximise impact.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function DonorDashboard({ notify }) {
  return (
    <Layout notify={notify}>
      <Routes>
        <Route index            element={<Overview  notify={notify} />} />
        <Route path="requests"  element={<Requests  notify={notify} />} />
        <Route path="history"   element={<History  notify={notify} />} />
        <Route path="profile"   element={<DonorProfile notify={notify} />} />
      </Routes>
    </Layout>
  );
}
