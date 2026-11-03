import React, { useEffect, useState } from "react";
import {
  ArrowRight, Bell, CheckCircle2, Droplets, HeartPulse,
  MapPin, Search, Shield, UserPlus, Clock, Star, Zap, Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicBloodSummary } from "../../services/bloodService";

/* ── animated counter ── */
function useCounter(target, dur = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = null;
    const go = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(go);
    };
    const id = requestAnimationFrame(go);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return v;
}

function CountUp({ n, suffix = "", color = "#b91c1c" }) {
  const v = useCounter(n);
  return <span style={{ color, fontWeight: 900 }}>{v}{suffix}</span>;
}

const STATUS_COLOR = {
  Available:      { bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", text: "#16a34a" },
  "Low Stock":    { bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", text: "#d97706" },
  Critical:       { bg: "#fff1f2", border: "#fecaca", dot: "#ef4444", text: "#dc2626" },
  "Out of Stock": { bg: "#f8fafc", border: "#e2e8f0", dot: "#94a3b8", text: "#64748b" },
};

export default function Home() {
  const [blood, setBlood]     = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getPublicBloodSummary().then(d => setBlood(Array.isArray(d) ? d : [])).catch(() => {});
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const totalUnits = blood.reduce((s, x) => s + (x.units || 0), 0);
  const availableGroups = blood.filter(x => x.status === "Available").length;

  /* ─── styles ─── */
  const heroFade = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : "translateY(28px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };

  return (
    <div style={{ background: "#fff", fontFamily: "inherit" }}>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(160deg, #fff 0%, #fff8f8 55%, #fff 100%)",
        padding: "6rem 0 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* faint dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#f1f5f9 1px,transparent 0)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        {/* red glow */}
        <div style={{ position: "absolute", top: -100, right: "8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>

            {/* Left */}
            <div style={heroFade}>
              {/* live pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "999px", padding: "0.35rem 0.9rem", marginBottom: "1.75rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "blink 2s infinite", boxShadow: "0 0 6px #ef4444", display: "inline-block" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em" }}>Live Hospital System</span>
              </div>

              <h1 style={{ fontSize: "clamp(2.4rem,4.8vw,3.8rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.06, letterSpacing: "-0.04em", margin: "0 0 1.25rem" }}>
                The Right Blood,<br />
                <span style={{ color: "#dc2626" }}>Right on Time.</span>
              </h1>

              <p style={{ fontSize: "1.05rem", color: "#64748b", lineHeight: 1.78, margin: "0 0 2.25rem", maxWidth: 480 }}>
                Digital Blood Sync connects patients, donors and hospital blood banks in real time. Find blood, request help, and save lives — from any device, instantly.
              </p>

              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                <Link to="/blood-availability"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#dc2626,#991b1b)", color: "#fff", borderRadius: "12px", padding: "0.85rem 1.6rem", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 8px 28px rgba(185,28,28,0.32)", transition: "transform 0.2s,box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(185,28,28,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 28px rgba(185,28,28,0.32)"; }}>
                  <Search size={16} /> Find Blood
                </Link>
                <Link to="/become-donor"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "0.85rem 1.6rem", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 2px 10px rgba(15,23,42,0.06)", transition: "transform 0.2s,border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#fecaca"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                  <UserPlus size={16} /> Become a Donor
                </Link>
              </div>

              {/* trust icons */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[["🔒","Secure & Private"],["📡","Real-Time Data"],["🩺","Hospital Verified"],["🇮🇳","Made for India"]].map(([e, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                    <span>{e}</span>{l}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — blood group cards */}
            <div style={{ ...heroFade, transition: "opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s" }}>
              <div style={{ background: "#fff", borderRadius: "24px", boxShadow: "0 32px 80px rgba(15,23,42,0.12)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                {/* card header */}
                <div style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(90deg,#dc2626,#b91c1c)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center" }}>
                      <Droplets size={16} style={{ color: "#fff" }} />
                    </div>
                    <div>
                      <div style={{ color: "#fecaca", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live Inventory</div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}>Blood Availability</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.3rem 0.7rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "blink 2s infinite", display: "inline-block" }} />
                    <span style={{ fontSize: "0.65rem", color: "#fff", fontWeight: 700 }}>Live</span>
                  </div>
                </div>

                {/* blood group grid */}
                <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                  {blood.length > 0
                    ? blood.slice(0, 8).map(item => {
                        const sc = STATUS_COLOR[item.status] || STATUS_COLOR["Out of Stock"];
                        return (
                          <div key={item.blood_group} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "12px", padding: "0.85rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", display: "grid", placeItems: "center", flexShrink: 0 }}>
                              <span style={{ fontWeight: 900, fontSize: "0.85rem", color: "#b91c1c" }}>{item.blood_group}</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", lineHeight: 1 }}>{item.units}</div>
                              <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "1px" }}>units</div>
                              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                                <span style={{ fontSize: "0.6rem", color: sc.text, fontWeight: 700 }}>{item.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : ["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => (
                        <div key={g} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.85rem", display: "flex", alignItems: "center", gap: "0.65rem", animation: "shimmer 1.5s infinite" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#e2e8f0" }} />
                          <div style={{ height: 28, flex: 1, background: "#e2e8f0", borderRadius: "6px" }} />
                        </div>
                      ))
                  }
                </div>

                {/* card footer */}
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{totalUnits}</span> total units · <span style={{ fontWeight: 800, color: "#16a34a" }}>{availableGroups}</span> groups available
                  </div>
                  <Link to="/blood-availability" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 700, color: "#b91c1c", textDecoration: "none" }}>
                    Full view <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.6} }
        `}</style>
      </section>

      {/* ════════════════════════════════════════════
          LIVE STATS BAR
      ════════════════════════════════════════════ */}
      <div style={{ background: "#0f172a", padding: "0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            {[
              { n: 8,   suffix: "+",   label: "Blood Groups Tracked",  color: "#f87171" },
              { n: totalUnits || 42, suffix: "",  label: "Units in Live Inventory", color: "#4ade80" },
              { n: 24,  suffix: "/7",  label: "Emergency Response",    color: "#60a5fa" },
              { n: 100, suffix: "%",   label: "Digital Records",       color: "#facc15" },
            ].map(({ n, suffix, label, color }, i) => (
              <div key={label} style={{ padding: "2rem 1.25rem", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, lineHeight: 1, marginBottom: "0.35rem" }}>
                  <CountUp n={n} suffix={suffix} color={color} />
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ════════════════════════════════════════════
          LIVE BLOOD STOCK
      ════════════════════════════════════════════ */}
      {blood.length > 0 && (
        <section style={{ padding: "5.5rem 0", background: "#f8fafc" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>No Login Needed</div>
                <h2 style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.025em" }}>Live Blood Stock Right Now</h2>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.4rem" }}>Updated every time the hospital admin makes a change.</p>
              </div>
              <Link to="/blood-availability" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#b91c1c", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
                Full Availability Page <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "1rem" }}>
              {blood.map(item => {
                const sc = STATUS_COLOR[item.status] || STATUS_COLOR["Out of Stock"];
                const pct = Math.min(100, (item.units / 30) * 100);
                return (
                  <div key={item.blood_group}
                    style={{ background: "#fff", border: `1.5px solid ${sc.border}`, borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", boxShadow: "0 2px 12px rgba(15,23,42,0.04)", transition: "transform 0.2s,box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(15,23,42,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.04)"; }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#b91c1c", lineHeight: 1, marginBottom: "0.4rem" }}>{item.blood_group}</div>
                    <div style={{ height: 5, background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", margin: "0.5rem 0" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: sc.dot, borderRadius: "999px", transition: "width 1s ease" }} />
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{item.units}</div>
                    <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginBottom: "0.5rem" }}>units</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "999px", padding: "2px 9px" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: sc.text }}>{item.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          KEY FEATURES
      ════════════════════════════════════════════ */}
      <section style={{ padding: "6rem 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-block", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "999px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em" }}>What We Do</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 0.85rem", letterSpacing: "-0.03em" }}>Every Feature You Need,<br />Nothing You Don't</h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              From donor registration to emergency alerts — every workflow is handled in one unified platform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem" }}>
            {[
              { icon: Droplets,   title: "Real-Time Inventory",  desc: "Live blood unit counts with expiry tracking, low-stock warnings and component breakdown.",  color: "#dc2626", bg: "#fff1f2" },
              { icon: Bell,       title: "Emergency Alerts",      desc: "When blood is urgently needed, matching donors receive instant email and SMS notifications.", color: "#d97706", bg: "#fffbeb" },
              { icon: MapPin,     title: "GPS Donor Matching",    desc: "Donors share verified location during registration for faster emergency response routing.", color: "#0891b2", bg: "#f0f9ff" },
              { icon: Shield,     title: "Verified Donors",       desc: "Every donor is reviewed by hospital admin before approval. Documents are checked on upload.", color: "#7c3aed", bg: "#f5f3ff" },
              { icon: Clock,      title: "Expiry Tracking",       desc: "Blood units expiring within 7 days are flagged automatically — preventing wastage.",          color: "#059669", bg: "#f0fdf4" },
              { icon: Heart,      title: "Donation History",      desc: "Donors log every donation with date, certificate upload and hospital location records.",      color: "#ec4899", bg: "#fdf2f8" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title}
                style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "18px", padding: "1.75rem 1.5rem", boxShadow: "0 2px 12px rgba(15,23,42,0.04)", transition: "transform 0.2s,box-shadow 0.2s,border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 44px rgba(15,23,42,0.09)"; e.currentTarget.style.borderColor = color + "50"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: bg, border: `1px solid ${color}25`, display: "grid", placeItems: "center", marginBottom: "1.25rem" }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.55rem" }}>{title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          IMPACT STATS
      ════════════════════════════════════════════ */}
      <section style={{ padding: "5.5rem 0", background: "linear-gradient(135deg,#0f172a 0%,#1e0707 50%,#0f172a 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-block", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "999px", padding: "0.3rem 1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.12em" }}>Why It Matters</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.03em" }}>
              Every Second Counts in a<br /><span style={{ color: "#f87171" }}>Blood Emergency</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.75 }}>
              Traditional phone-based blood bank coordination takes 2–4 hours on average. Digital Blood Sync brings that down to minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
            {[
              { stat: "2–4 hrs", label: "Average emergency response",      sub: "Traditional phone-based system",  bad: true  },
              { stat: "< 5 min", label: "With Digital Blood Sync",          sub: "Automated donor email + SMS",     bad: false },
              { stat: "14M",     label: "Blood units needed yearly (India)", sub: "Source: WHO 2023",              bad: true  },
              { stat: "100%",    label: "Digital audit trail",              sub: "Every donation, every approval",  bad: false },
            ].map(({ stat, label, sub, bad }) => (
              <div key={label} style={{ background: bad ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)", border: `1px solid ${bad ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: "16px", padding: "1.75rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: 900, color: bad ? "#f87171" : "#4ade80", lineHeight: 1, marginBottom: "0.4rem" }}>{stat}</div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", marginBottom: "0.3rem" }}>{label}</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Simple 4-Step Workflow</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1.5rem" }}>
              {[
                { step: "01", icon: Search,    title: "Search Blood",      desc: "Check live stock — no account needed", color: "#f87171" },
                { step: "02", icon: Bell,      title: "Emergency Request", desc: "Submit urgent need in 30 seconds",     color: "#fb923c" },
                { step: "03", icon: Zap,       title: "Donors Notified",   desc: "SMS + email sent to matching donors",  color: "#facc15" },
                { step: "04", icon: HeartPulse,title: "Life Saved",        desc: "Donor connects — blood delivered",     color: "#4ade80" },
              ].map(({ step, icon: Icon, title, desc, color }) => (
                <div key={step} style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", display: "inline-block", marginBottom: "0.85rem" }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: `${color}18`, border: `2px solid ${color}40`, display: "grid", placeItems: "center", margin: "0 auto" }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <div style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: color, display: "grid", placeItems: "center", fontSize: "0.5rem", fontWeight: 900, color: "#0f172a" }}>{step}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.88rem", marginBottom: "0.25rem" }}>{title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          DONOR CTA  +  3 PERSONA CARDS
      ════════════════════════════════════════════ */}
      <section style={{ padding: "6rem 0", background: "#fff" }}>
        <div className="container">

          {/* top gradient banner */}
          <div style={{ background: "linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#7c3aed 100%)", borderRadius: "28px", padding: "3.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center", boxShadow: "0 32px 80px rgba(127,29,29,0.25)", position: "relative", overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.3) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(185,28,28,0.4) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.3rem 0.85rem", marginBottom: "1.25rem" }}>
                <Star size={12} style={{ color: "#facc15" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#fef9c3", textTransform: "uppercase", letterSpacing: "0.1em" }}>Be a Hero</span>
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.03em" }}>
                One Registration.<br />Infinite Impact.
              </h2>
              <p style={{ color: "#fecaca", fontSize: "0.95rem", lineHeight: 1.75, margin: "0 0 2rem" }}>
                Your blood type might be exactly what a patient needs right now. Register as a donor in under 5 minutes — completely free, fully digital.
              </p>
              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                <Link to="/become-donor"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#b91c1c", borderRadius: "12px", padding: "0.88rem 1.75rem", fontWeight: 800, fontSize: "0.92rem", textDecoration: "none", boxShadow: "0 8px 28px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = ""}>
                  <UserPlus size={16} /> Register as Donor
                </Link>
                <Link to="/about"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "0.88rem 1.75rem", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}>
                  Learn More <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "0.75rem" }}>
              {[
                { icon: "📋", title: "Fill a 4-step form",       sub: "Personal info, health details, documents, location" },
                { icon: "📁", title: "Upload your documents",    sub: "Hemoglobin report + profile photo" },
                { icon: "📍", title: "Share your GPS location",  sub: "Used for emergency donor-hospital matching" },
                { icon: "✅", title: "Get approved by hospital", sub: "Admin reviews your profile within 24 hrs" },
                { icon: "🔔", title: "Receive emergency alerts", sub: "Email + SMS when your blood group is urgently needed" },
              ].map(({ icon, title, sub }) => (
                <div key={title} style={{ display: "flex", alignItems: "center", gap: "0.9rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.84rem" }}>{title}</div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 persona cards — light theme, below the gradient banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
            {[
              {
                emoji: "🏥",
                persona: "Hospital Administrator",
                quote: "Approve donors, manage blood stock and post emergencies — all from one dashboard. No spreadsheets.",
                color: "#b91c1c", bg: "#fff", border: "#fecaca",
                actions: ["Approve / reject donors", "Manage blood stock", "Post emergency requests", "View donation history"],
                cta: { label: "Admin Login", to: "/hospital-login" },
              },
              {
                emoji: "🩸",
                persona: "Blood Donor",
                quote: "Registered once, uploaded my documents and now I get notified when my blood group is urgently needed nearby.",
                color: "#7c3aed", bg: "#fff", border: "#ddd6fe",
                actions: ["Register in 4 easy steps", "Upload health reports", "Toggle availability on/off", "Log every donation"],
                cta: { label: "Become a Donor", to: "/become-donor" },
              },
              {
                emoji: "🔍",
                persona: "Patient / Public",
                quote: "Searched for O- blood for my father's surgery — found available units at Capital Hospital in 30 seconds.",
                color: "#0891b2", bg: "#fff", border: "#bae6fd",
                actions: ["Check live blood stock", "No account needed", "See availability by group", "Navigate to hospital"],
                cta: { label: "Check Blood Availability", to: "/blood-availability" },
              },
            ].map(({ emoji, persona, quote, color, bg, border, actions, cta }) => (
              <div key={persona}
                style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 20px rgba(15,23,42,0.05)", display: "flex", flexDirection: "column", transition: "transform 0.2s,box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,0.05)"; }}>
                <div style={{ fontSize: "2.2rem", marginBottom: "0.85rem" }}>{emoji}</div>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{persona}</div>
                <p style={{ fontSize: "0.87rem", color: "#475569", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 1.25rem", borderLeft: `3px solid ${color}`, paddingLeft: "0.85rem" }}>"{quote}"</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "grid", gap: "0.45rem" }}>
                  {actions.map(a => (
                    <li key={a} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "#334155" }}>
                      <CheckCircle2 size={13} style={{ color, flexShrink: 0 }} /> {a}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "auto" }}>
                  <Link to={cta.to}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: color, color: "#fff", borderRadius: "10px", padding: "0.6rem 1.2rem", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", boxShadow: `0 4px 14px ${color}44`, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    {cta.label} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}