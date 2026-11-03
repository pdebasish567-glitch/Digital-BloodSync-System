import React, { useEffect, useMemo, useState } from "react";
import { getPublicBloodSummary } from "../../services/bloodService";
import { Activity, Droplets, RefreshCw, Search, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

const GROUPS_ORDER = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

function getStatusConfig(status) {
  const map = {
    Available:      { bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "#86efac", badge: "#16a34a", badgeBg: "#dcfce7", bar: "#22c55e", barEnd: "#16a34a", icon: TrendingUp, iconColor: "#22c55e" },
    "Low Stock":    { bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fde68a", badge: "#d97706", badgeBg: "#fef3c7", bar: "#f59e0b", barEnd: "#d97706", icon: TrendingDown, iconColor: "#f59e0b" },
    Critical:       { bg: "linear-gradient(135deg, #fff1f2, #fee2e2)", border: "#fca5a5", badge: "#dc2626", badgeBg: "#fee2e2", bar: "#ef4444", barEnd: "#dc2626", icon: AlertTriangle, iconColor: "#ef4444" },
    "Out of Stock": { bg: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "#e2e8f0", badge: "#64748b", badgeBg: "#f1f5f9", bar: "#94a3b8", barEnd: "#64748b", icon: Activity, iconColor: "#94a3b8" },
  };
  return map[status] || map["Out of Stock"];
}

export default function BloodAvailability({ notify }) {
  const [summary, setSummary]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState("");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchData = () => {
    setLoading(true);
    getPublicBloodSummary()
      .then(data => { setSummary(Array.isArray(data) ? data : []); setLastUpdated(new Date()); })
      .catch(() => notify?.("Could not load inventory. Is the server running?", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Build full 8-group list, filling missing groups with 0
  const fullSummary = useMemo(() => {
    const map = {};
    summary.forEach(x => { map[x.blood_group || x.group] = x; });
    return GROUPS_ORDER.map(g => map[g] || { blood_group: g, units: 0, status: "Out of Stock" });
  }, [summary]);

  const filtered = useMemo(() => fullSummary.filter(x => {
    const grp = x.blood_group || x.group || "";
    const matchQuery = !query || grp.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "All" || x.status === activeFilter;
    return matchQuery && matchFilter;
  }), [fullSummary, query, activeFilter]);

  // Aggregate stats
  const stats = useMemo(() => ({
    total: fullSummary.reduce((s, x) => s + (x.units || 0), 0),
    available: fullSummary.filter(x => x.status === "Available").length,
    critical: fullSummary.filter(x => x.status === "Critical" || x.status === "Out of Stock").length,
    groups: fullSummary.filter(x => x.units > 0).length,
  }), [fullSummary]);

  const FILTERS = ["All", "Available", "Low Stock", "Critical", "Out of Stock"];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ═══════ HERO HEADER ═══════ */}
      <section style={{
        background: "linear-gradient(135deg, #0f0505 0%, #1c0a0a 35%, #7f1d1d 80%, #991b1b 100%)",
        padding: "4.5rem 0 3rem", position: "relative", overflow: "hidden",
      }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "0", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(185,28,28,0.3) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.35rem 0.85rem", marginBottom: "1rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80", animation: "blink 2s ease-in-out infinite" }} />
                <span style={{ fontSize: "0.68rem", color: "#86efac", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Inventory</span>
              </div>
              <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 0.5rem", lineHeight: 1.1, letterSpacing: "-0.04em" }}>
                Blood Availability
              </h1>
              <p style={{ color: "#fecaca", fontSize: "0.95rem", margin: 0, maxWidth: 520 }}>
                Real-time blood unit count from Capital Hospital's live blood bank inventory — refreshes on demand.
              </p>
            </div>

            {/* Refresh button */}
            <button onClick={fetchData} disabled={loading} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px",
              padding: "0.75rem 1.25rem", fontWeight: 700, fontSize: "0.85rem",
              cursor: loading ? "default" : "pointer", backdropFilter: "blur(8px)",
              transition: "background 0.2s", opacity: loading ? 0.7 : 1,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              <RefreshCw size={15} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
              {loading ? "Refreshing…" : "Refresh Stock"}
            </button>
          </div>

          {/* Quick stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Total Units",     val: loading ? "—" : stats.total,     sub: "valid, non-expired" },
              { label: "Groups Available",val: loading ? "—" : stats.available,  sub: "with 10+ units"    },
              { label: "Critical Groups", val: loading ? "—" : stats.critical,   sub: "need replenishment"},
              { label: "Groups Tracked",  val: loading ? "—" : stats.groups,     sub: "have current stock"},
            ].map(({ label, val, sub }, i) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.02)", padding: "1.25rem 1.5rem",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{ fontSize: "0.6rem", color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.35rem" }}>{label}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "0.3rem" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </section>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <section style={{ padding: "2.5rem 0 4rem" }}>
        <div className="container">

          {/* Controls */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(15,23,42,0.05)", padding: "1.25rem 1.5rem", marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.55rem 0.85rem", flex: "1", minWidth: "200px", maxWidth: "300px" }}>
                <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search blood group…" style={{ border: "none", outline: "none", fontSize: "0.85rem", width: "100%", background: "transparent", color: "#334155" }} />
              </div>

              {/* Filter chips */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: 1 }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} style={{
                    padding: "0.45rem 0.9rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                    border: activeFilter === f ? "1px solid #b91c1c" : "1px solid #e2e8f0",
                    background: activeFilter === f ? "#b91c1c" : "#fff",
                    color: activeFilter === f ? "#fff" : "#64748b",
                    transition: "all 0.15s",
                  }}>{f}</button>
                ))}
              </div>

              {/* Timestamp */}
              {lastUpdated && (
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "auto" }}>
                  ⏱ {lastUpdated.toLocaleTimeString("en-IN")}
                </span>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
              {[["#22c55e","Available","10+ units"],["#f59e0b","Low Stock","5–9 units"],["#ef4444","Critical","1–4 units"],["#94a3b8","Out of Stock","0 units"]].map(([color, label, range]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 6px ${color}88` }} />
                  <span style={{ fontSize: "0.73rem", color: "#334155", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>({range})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px,1fr))", gap: "1.25rem" }}>
              {[1,2,3,4,5,6,7,8].map(n => (
                <div key={n} style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", padding: "1.75rem", height: 200, animation: "shimmer 1.5s ease-in-out infinite" }}>
                  <div style={{ height: 12, background: "#f1f5f9", borderRadius: "6px", marginBottom: "1rem", width: "60%" }} />
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: "10px", marginBottom: "0.75rem" }} />
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: "4px", width: "80%" }} />
                </div>
              ))}
              <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            </div>
          )}

          {/* Cards grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px,1fr))", gap: "1.25rem" }}>
              {filtered.map(item => {
                const grp = item.blood_group || item.group;
                const cfg = getStatusConfig(item.status || "Out of Stock");
                const StatusIcon = cfg.icon;
                const pct = Math.min(100, ((item.units || 0) / 30) * 100);
                return (
                  <div key={grp} style={{
                    background: "#fff", borderRadius: "20px", overflow: "hidden",
                    border: `1px solid ${cfg.border}`,
                    boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,0.05)"; }}
                  >
                    {/* Gradient top strip */}
                    <div style={{ background: cfg.bg, padding: "1.5rem 1.5rem 1.25rem", borderBottom: `1px solid ${cfg.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Blood Group</div>
                          <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "#b91c1c", lineHeight: 1.05, marginTop: "0.1rem" }}>{grp}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                          <div style={{ background: cfg.badgeBg, color: cfg.badge, borderRadius: "999px", padding: "3px 10px", fontSize: "0.62rem", fontWeight: 800, border: `1px solid ${cfg.border}` }}>{item.status || "Out of Stock"}</div>
                          <StatusIcon size={16} style={{ color: cfg.iconColor }} />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", marginBottom: "0.85rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{item.units ?? 0}</span>
                        <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600 }}>units available</span>
                      </div>

                      {/* Bar */}
                      <div style={{ height: 7, background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", marginBottom: "0.6rem" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.bar}, ${cfg.barEnd})`, borderRadius: "999px", transition: "width 0.8s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Capital Hospital Blood Bank</span>
                        <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(15,23,42,0.05)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🏥</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#334155", margin: "0 0 0.5rem" }}>No matching blood groups</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>
                {query ? `No results for "${query}" — try a different search.` : "No inventory records found in the database."}
              </p>
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "0.6rem 1.25rem", fontWeight: 700, color: "#334155", cursor: "pointer", fontSize: "0.85rem" }}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
