import React, { useEffect, useState, useCallback } from "react";
import { X, Check, AlertTriangle, Clock } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   EmergencyAlert — shown to donors when a matching blood request comes in.
   Props:
     alert   : { id, blood_group, units_required, urgency_level, location_name, patient_name }
     onAccept: (alertId) => void
     onDecline:(alertId) => void
     onDismiss:(alertId) => void
──────────────────────────────────────────────────────────────────────────── */
export function EmergencyAlert({ alert, onAccept, onDecline, onDismiss }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!alert) return;
    setCountdown(30);
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); onDismiss?.(alert.id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [alert?.id]);

  if (!alert) return null;

  const urgencyColor = {
    Critical: { bg: "#7f1d1d", border: "#ef4444", glow: "rgba(239,68,68,0.35)" },
    Urgent:   { bg: "#7c2d12", border: "#f97316", glow: "rgba(249,115,22,0.3)" },
    Normal:   { bg: "#14532d", border: "#22c55e", glow: "rgba(34,197,94,0.25)" },
  }[alert.urgency_level] || { bg: "#7f1d1d", border: "#ef4444", glow: "rgba(239,68,68,0.35)" };

  const circumference = 2 * Math.PI * 22;
  const progress = (countdown / 30) * circumference;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9990,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease"
      }} />

      {/* Popup */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999, width: "min(480px, calc(100vw - 32px))",
        background: "#fff", borderRadius: "20px", overflow: "hidden",
        boxShadow: `0 0 0 2px ${urgencyColor.border}, 0 30px 80px rgba(0,0,0,0.35), 0 0 60px ${urgencyColor.glow}`,
        animation: "popupIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${urgencyColor.bg}, #b91c1c)`,
          padding: "1.5rem", color: "#fff", position: "relative"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center",
              fontSize: "1.3rem", flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)",
              animation: "pulse 1.5s ease infinite"
            }}>🚨</div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>
                {alert.urgency_level} · Emergency Blood Request
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.1 }}>
                {alert.blood_group} Blood Needed
              </div>
            </div>
          </div>

          {/* Countdown ring */}
          <div style={{ position: "absolute", right: "1.25rem", top: "1.25rem" }}>
            <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle cx="26" cy="26" r="22" fill="none" stroke="#fff" strokeWidth="3"
                strokeDasharray={circumference} strokeDashoffset={circumference - progress}
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontSize: "0.9rem", fontWeight: 800
            }}>
              {countdown}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              ["🏥", "Patient",   alert.patient_name || "Emergency Patient"],
              ["📍", "Location",  alert.location_name],
              ["🩸", "Units",     `${alert.units_required} unit${alert.units_required !== 1 ? "s" : ""} required`],
            ].map(([icon, label, value]) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem", background: "#f8fafc",
                borderRadius: "10px", border: "1px solid #e2e8f0"
              }}>
                <span style={{ fontSize: "1.25rem", width: 32, textAlign: "center" }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => onAccept?.(alert.id)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#fff", border: "none", borderRadius: "12px",
                padding: "0.9rem 1rem", fontWeight: 800, fontSize: "0.95rem",
                cursor: "pointer", boxShadow: "0 6px 20px rgba(22,163,74,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,163,74,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 20px rgba(22,163,74,0.35)"; }}
            >
              <Check size={18} /> I'll Donate
            </button>
            <button
              onClick={() => onDecline?.(alert.id)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", background: "#fff", color: "#dc2626",
                border: "2px solid #fecaca", borderRadius: "12px",
                padding: "0.9rem 1rem", fontWeight: 800, fontSize: "0.95rem",
                cursor: "pointer", transition: "transform 0.15s"
              }}
            >
              <X size={18} /> Can't Donate
            </button>
          </div>
          <button
            onClick={() => onDismiss?.(alert.id)}
            style={{
              display: "block", width: "100%", marginTop: "0.75rem",
              background: "none", border: "none", color: "#94a3b8",
              fontSize: "0.78rem", cursor: "pointer", padding: "0.5rem"
            }}
          >
            <Clock size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Remind me later (auto-dismisses in {countdown}s)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popupIn { from { opacity: 0; transform: translate(-50%, -45%) scale(0.9) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3) } 50% { box-shadow: 0 0 0 8px rgba(255,255,255,0) } }
      `}</style>
    </>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   StockAlert — shown to admin when there are low-stock or expiring items.
   Props:
     alerts : { lowStock: number, expiringSoon: number, expired: number }
     onView  : () => void  (navigate to inventory)
     onDismiss: () => void
──────────────────────────────────────────────────────────────────────────── */
export function StockAlert({ alerts, onView, onDismiss }) {
  if (!alerts || (alerts.lowStock === 0 && alerts.expiringSoon === 0 && alerts.expired === 0)) return null;

  const items = [
    alerts.expired     > 0 && { icon: "🗑️", label: `${alerts.expired} expired unit${alerts.expired !== 1 ? "s" : ""} — remove from stock`, color: "#dc2626" },
    alerts.expiringSoon> 0 && { icon: "⏰", label: `${alerts.expiringSoon} unit${alerts.expiringSoon !== 1 ? "s" : ""} expiring within 7 days`, color: "#d97706" },
    alerts.lowStock    > 0 && { icon: "📉", label: `${alerts.lowStock} blood group${alerts.lowStock !== 1 ? "s" : ""} below 5 units`, color: "#7c3aed" },
  ].filter(Boolean);

  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9000,
      width: "min(380px, calc(100vw - 2rem))",
      background: "#fff", borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px #fee2e2",
      animation: "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
        padding: "1rem 1.25rem",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#fff" }}>
          <AlertTriangle size={18} />
          <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>Blood Bank Alert</span>
        </div>
        <button onClick={onDismiss} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>
          Dismiss
        </button>
      </div>

      {/* Items */}
      <div style={{ padding: "1rem" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem", background: "#fef2f2", borderRadius: "8px", marginBottom: "0.5rem", border: "1px solid #fecaca" }}>
            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.82rem", color: item.color, fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button
            onClick={onView}
            style={{
              flex: 1, background: "linear-gradient(135deg, #b91c1c, #991b1b)",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "0.65rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer"
            }}
          >
            View Inventory
          </button>
          <button
            onClick={onDismiss}
            style={{
              flex: 1, background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: "8px", padding: "0.65rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer"
            }}
          >
            Later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
