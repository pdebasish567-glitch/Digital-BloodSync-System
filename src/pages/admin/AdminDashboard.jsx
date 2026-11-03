import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { NavLink, Route, Routes, Link, useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Bell, CalendarClock, Check, CheckCircle2,
  ChevronRight, CircleAlert, Clock, Droplets, FileText, LayoutDashboard, LogOut,
  Menu, Package, Plus, RefreshCw, Search, ShieldCheck, Trash2,
  TrendingUp, Users, X, ClipboardCheck, MapPin, UserRound, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getBloodInventory, createBloodUnit, updateBloodUnit, deleteBloodUnit } from "../../services/bloodService";
import { getDonors } from "../../services/donorService";
import { getEmergencyRequests, createEmergencyRequest, getDonationRecords } from "../../services/emergencyService";
import { apiRequest } from "../../services/apiClient";
import { StockAlert } from "../../components/common/NotificationPopup";
import PendingDonorsAdmin from "./PendingDonorsAdmin";

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AdminSidebar({ open, onClose, pendingCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hospitalName =
    user?.hospital_profile?.hospital_name ||
    user?.first_name || user?.email?.split("@")[0] || "Hospital";

  const links = [
    { to: "/admin",               label: "Overview",          icon: LayoutDashboard, end: true },
    { to: "/admin/inventory",     label: "Blood Inventory",   icon: Droplets },
    { to: "/admin/emergency",     label: "Emergency",         icon: Bell },
    { to: "/admin/donors",        label: "Donors",            icon: Users },
    { to: "/admin/pending-donors",label: "Pending Approvals", icon: ClipboardCheck, badge: pendingCount },
    { to: "/admin/availability",  label: "Blood Availability",icon: Activity },
    { to: "/profile",             label: "Profile",           icon: UserRound },
  ];

  const handleLogout = () => { logout(); onClose?.(); };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} style={{ zIndex: 69 }} />}
      <aside style={{
        position: "fixed", inset: "0 auto 0 0", width: 255, zIndex: 70,
        background: "linear-gradient(180deg, #1a0505 0%, #2d0a0a 35%, #1f0606 100%)",
        display: "flex", flexDirection: "column", padding: "0 10px",
        transform: open ? "translateX(0)" : undefined,
        transition: "transform 0.2s ease",
        boxShadow: "4px 0 40px rgba(185,28,28,0.2)"
      }} className={`admin-sidebar ${open ? "open" : ""}`}>

        {/* Brand */}
        <div style={{ padding: "22px 12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "10px",
                background: "linear-gradient(135deg, #dc2626, #991b1b)",
                display: "grid", placeItems: "center", fontSize: "1.1rem",
                boxShadow: "0 0 20px rgba(220,38,38,0.4)"
              }}>❤️</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.88rem", lineHeight: 1.2 }}>Digital Blood</div>
                <div style={{ color: "#fca5a5", fontSize: "0.64rem", fontWeight: 600 }}>Hospital Portal</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: open ? "block" : "none" }}><X size={16} /></button>
          </div>
          <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#fca5a5", fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Signed in as</div>
            <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700, marginTop: "2px" }}>{hospitalName}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "14px 0", flex: 1, overflowY: "auto" }}>
          {links.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "10px 14px", borderRadius: "10px",
                color: isActive ? "#fff" : "#94a3b8",
                fontWeight: isActive ? 700 : 600, fontSize: "0.82rem",
                background: isActive ? "linear-gradient(135deg, rgba(220,38,38,0.25), rgba(185,28,28,0.12))" : "transparent",
                border: isActive ? "1px solid rgba(220,38,38,0.3)" : "1px solid transparent",
                textDecoration: "none", position: "relative",
                boxShadow: isActive ? "0 0 20px rgba(220,38,38,0.15)" : "none",
                transition: "all 0.15s ease"
              })}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{
                  background: "#dc2626", color: "#fff", fontSize: "0.62rem",
                  fontWeight: 800, borderRadius: "999px", padding: "1px 6px",
                  boxShadow: "0 0 8px rgba(220,38,38,0.5)"
                }}>{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem", width: "100%",
              padding: "10px 14px", borderRadius: "10px", background: "none",
              border: "1px solid transparent", color: "#94a3b8", fontWeight: 600,
              fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <style>{`
        @media(max-width:780px){
          .admin-sidebar{transform:translateX(-100%)!important}
          .admin-sidebar.open{transform:translateX(0)!important}
        }
      `}</style>
    </>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function AdminTopbar({ onMenuClick, notify }) {
  const { user } = useAuth();
  const hospitalName = user?.hospital_profile?.hospital_name || user?.first_name || user?.email?.split("@")[0] || "Admin";
  const initials = hospitalName.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "HA";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, height: 68,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #f1f5f9",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", gap: "1rem",
      boxShadow: "0 1px 20px rgba(15,23,42,0.06)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={onMenuClick} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><Menu size={22} /></button>
        <div>
          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hospital Staff</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Admin Dashboard</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          padding: "0.5rem 0.75rem", background: "#f8fafc",
          border: "1px solid #e2e8f0", borderRadius: "12px"
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #fef2f2, #fecaca)",
            display: "grid", placeItems: "center",
            color: "#b91c1c", fontSize: "0.72rem", fontWeight: 800
          }}>{initials}</div>
          <div style={{ lineBreak: "anywhere" }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#0f172a" }}>{hospitalName}</div>
            <div style={{ fontSize: "0.64rem", color: "#94a3b8" }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
function Layout({ children, notify, pendingCount }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar open={open} onClose={() => setOpen(false)} pendingCount={pendingCount} />
      <div style={{ marginLeft: 255, width: "calc(100% - 255px)", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="admin-content">
        <AdminTopbar onMenuClick={() => setOpen(true)} notify={notify} />
        <main style={{ flex: 1, padding: "28px 30px" }}>
          {children}
        </main>
      </div>
      <style>{`
        @media(max-width:780px){.admin-content{margin-left:0!important;width:100%!important}}
      `}</style>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, tone, onClick }) {
  const colors = {
    red:    { bg: "linear-gradient(135deg, #fef2f2, #fff)", border: "#fecaca", icon: "#dc2626", iconBg: "#fef2f2" },
    amber:  { bg: "linear-gradient(135deg, #fffbeb, #fff)", border: "#fde68a", icon: "#d97706", iconBg: "#fffbeb" },
    green:  { bg: "linear-gradient(135deg, #f0fdf4, #fff)", border: "#bbf7d0", icon: "#16a34a", iconBg: "#f0fdf4" },
    blue:   { bg: "linear-gradient(135deg, #eff6ff, #fff)", border: "#bfdbfe", icon: "#2563eb", iconBg: "#eff6ff" },
    purple: { bg: "linear-gradient(135deg, #faf5ff, #fff)", border: "#ddd6fe", icon: "#7c3aed", iconBg: "#faf5ff" },
    slate:  { bg: "linear-gradient(135deg, #f8fafc, #fff)", border: "#e2e8f0", icon: "#475569", iconBg: "#f1f5f9" },
  }[tone || "slate"];

  return (
    <div onClick={onClick} style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: "16px", padding: "1.25rem",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.18s, box-shadow 0.18s",
      boxShadow: "0 4px 16px rgba(15,23,42,0.05)"
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.1)"; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.05)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: "12px", background: colors.iconBg, border: `1px solid ${colors.border}`, display: "grid", placeItems: "center", color: colors.icon }}>
          {React.createElement(icon, { size: 18 })}
        </div>
        <TrendingUp size={14} style={{ color: "#94a3b8" }} />
      </div>
      <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginTop: "0.3rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ children, tone }) {
  const styles = {
    green:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    amber:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    blue:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    slate:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  }[tone || "slate"];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
      background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`
    }}>{children}</span>
  );
}

function getBadgeTone(text) {
  const t = String(text).toLowerCase();
  if (["available", "approved", "completed", "searching"].includes(t)) return "green";
  if (["urgent", "expiring soon", "low stock"].includes(t)) return "amber";
  if (["critical", "expired", "rejected"].includes(t)) return "red";
  if (["not available", "pending"].includes(t)) return "slate";
  return "blue";
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function Panel({ children, title, sub, action, style: extraStyle }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px",
      boxShadow: "0 4px 16px rgba(15,23,42,0.04)", overflow: "hidden",
      ...extraStyle
    }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.4rem", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{title}</div>
            {sub && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "1px" }}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: "1.4rem" }}>{children}</div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>{eyebrow}</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.025em" }}>{title}</h1>
        {sub && <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ notify }) {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/stats/").then(setStats).catch(err => notify?.("Failed to load stats: " + err.message, "error"));
    getEmergencyRequests().then(setRequests).catch(console.error);
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        eyebrow={today}
        title="Blood Bank Overview"
        sub="Real-time monitoring of your hospital blood bank and emergency coordination."
        action={
          <button
            onClick={() => navigate("/admin/emergency")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #b91c1c, #991b1b)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.65rem 1.2rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 6px 20px rgba(185,28,28,0.3)" }}
          >
            <Bell size={16} /> New Emergency Request
          </button>
        }
      />

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <KPICard icon={Package}       label="Valid Blood Units"     value={stats?.total_blood_units}         sub="Non-expired stock only"     tone="blue"   onClick={() => navigate("/admin/inventory")} />
        <KPICard icon={Bell}          label="Active Emergencies"    value={stats?.active_emergency_requests} sub="Needs immediate attention"   tone={stats?.active_emergency_requests > 0 ? "red" : "green"}  onClick={() => navigate("/admin/emergency")} />
        <KPICard icon={Users}         label="Approved Donors"       value={stats?.approved_donors}           sub="Active verified donors"       tone="purple" onClick={() => navigate("/admin/donors")} />
        <KPICard icon={ClipboardCheck}label="Pending Approvals"     value={stats?.pending_donors}            sub="Awaiting admin review"        tone={stats?.pending_donors > 0 ? "amber" : "slate"} onClick={() => navigate("/admin/pending-donors")} />
        <KPICard icon={CircleAlert}   label="Expiring Soon"         value={stats?.expiring_soon}             sub="Within next 7 days"           tone={stats?.expiring_soon > 0 ? "amber" : "green"} onClick={() => navigate("/admin/inventory")} />
        <KPICard icon={AlertTriangle} label="Expired Batches"       value={stats?.expired}                   sub="Must be removed from stock"   tone={stats?.expired > 0 ? "red" : "slate"}   onClick={() => navigate("/admin/inventory")} />
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Panel title="Recent Emergency Requests" sub="Latest activity from the database"
          action={<Link to="/admin/emergency" style={{ fontSize: "0.78rem", color: "#b91c1c", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>View all <ChevronRight size={14} /></Link>}>
          {requests.length === 0
            ? <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>🚑 No emergency requests yet.</div>
            : requests.slice(0, 4).map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "10px", background: "#fef2f2", display: "grid", placeItems: "center", color: "#b91c1c", fontWeight: 800, fontSize: "0.78rem" }}>{r.blood_group}</div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>{r.patient_name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{r.location_name} · {r.units_required} units</div>
                  </div>
                </div>
                <Badge tone={getBadgeTone(r.urgency_level)}>{r.urgency_level}</Badge>
              </div>
            ))
          }
        </Panel>

        <Panel title="Quick Actions" sub="Common hospital admin tasks">
          {[
            { icon: Plus,          label: "Add Blood Units",       sub: "Update inventory stock",       to: "/admin/inventory",      color: "#2563eb" },
            { icon: Bell,          label: "Create Emergency",      sub: "Alert donors in radius",       to: "/admin/emergency",      color: "#dc2626" },
            { icon: ClipboardCheck,label: "Review Pending Donors", sub: `${stats?.registered_donors ?? 0} registered`,  to: "/admin/pending-donors", color: "#7c3aed" },
            { icon: Activity,      label: "Blood Availability",    sub: "Check stock by group",         to: "/admin/availability",   color: "#16a34a" },
          ].map(({ icon: Icon, label, sub, to, color }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.8rem", borderRadius: "12px", marginBottom: "0.5rem",
              border: "1px solid #f1f5f9", background: "#fafafa",
              textDecoration: "none", transition: "all 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.background = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.background = "#fafafa"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${color}15`, display: "grid", placeItems: "center", color, border: `1px solid ${color}30`, flexShrink: 0 }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#0f172a" }}>{label}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{sub}</div>
              </div>
              <ChevronRight size={15} style={{ marginLeft: "auto", color: "#cbd5e1" }} />
            </Link>
          ))}
        </Panel>
      </div>
    </>
  );
}

// ── Inventory ─────────────────────────────────────────────────────────────────
function InventoryPage({ notify }) {
  const [rows, setRows]         = useState([]);
  const [query, setQuery]       = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving,   setSaving]   = useState(null);   // id of row being saved
  const [editId,   setEditId]   = useState(null);   // id of row in edit mode
  const [editData, setEditData] = useState({});     // current edits for that row
  const [newUnit,  setNewUnit]  = useState({ blood_group: "O+", component: "Whole Blood", units: 1, collection_date: "", expiry_date: "" });

  const load = () =>
    getBloodInventory()
      .then(setRows)
      .catch(err => notify?.("Inventory load failed: " + err.message, "error"));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const today = new Date();
    return rows.map(r => {
      let tone = "green", status = "Available";
      if (r.expiry_date) {
        const d = (new Date(r.expiry_date) - today) / 86400000;
        if (d < 0)       { status = "Expired";      tone = "red"; }
        else if (d <= 7) { status = "Expiring Soon"; tone = "amber"; }
        else if (r.units < 5) { status = "Low Stock"; tone = "amber"; }
      }
      return { ...r, status, tone };
    }).filter(r => !query || r.blood_group.includes(query.toUpperCase()) || r.component.toLowerCase().includes(query.toLowerCase()));
  }, [rows, query]);

  // ── Add new unit ────────────────────────────────────────────────────────────
  const handleAdd = async e => {
    e.preventDefault();
    if (!newUnit.collection_date || !newUnit.expiry_date) { notify?.("Both dates are required.", "error"); return; }
    try {
      const created = await createBloodUnit(newUnit);
      setRows(prev => [created, ...prev]);
      setIsAdding(false);
      setNewUnit({ blood_group: "O+", component: "Whole Blood", units: 1, collection_date: "", expiry_date: "" });
      notify?.("Blood unit added to inventory.", "success");
    } catch (err) { notify?.("Add failed: " + err.message, "error"); }
  };

  // ── Start editing a row ─────────────────────────────────────────────────────
  const startEdit = row => {
    setEditId(row.id);
    setEditData({ units: row.units, component: row.component, expiry_date: row.expiry_date, blood_group: row.blood_group, collection_date: row.collection_date });
  };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  // ── Save edited row ─────────────────────────────────────────────────────────
  const handleSave = async id => {
    setSaving(id);
    try {
      const updated = await updateBloodUnit(id, editData);
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      setEditId(null);
      setEditData({});
      notify?.("✅ Blood unit updated successfully.", "success");
    } catch (err) {
      notify?.("Update failed: " + err.message, "error");
    } finally {
      setSaving(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async id => {
    setDeleting(id);
    try { await deleteBloodUnit(id); setRows(p => p.filter(r => r.id !== id)); notify?.("Record deleted.", "success"); }
    catch (err) { notify?.("Delete failed: " + err.message, "error"); }
    finally { setDeleting(null); }
  };

  const Field = ({ label, children }) => (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
  const input  = { width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "0.85rem", outline: "none", background: "#fafafa" };
  const select = { ...input, cursor: "pointer" };
  const cellInp = { border: "1.5px solid #3b82f6", borderRadius: "6px", padding: "5px 8px", fontSize: "0.82rem", outline: "none", background: "#eff6ff", width: "100%", boxSizing: "border-box" };

  return (
    <>
      <PageHeader
        eyebrow="Stock Management"
        title="Blood Inventory"
        sub="Add, edit, and manage blood unit records. Click ✏️ on any row to update it."
        action={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: "#475569" }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setIsAdding(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isAdding ? "#f1f5f9" : "linear-gradient(135deg, #b91c1c, #991b1b)", color: isAdding ? "#64748b" : "#fff", border: "none", borderRadius: "12px", padding: "0.65rem 1.2rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              {isAdding ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Blood Units</>}
            </button>
          </div>
        }
      />

      {isAdding && (
        <form onSubmit={handleAdd} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>📋 Record New Blood Units</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: "1rem" }}>
            <Field label="Blood Group">
              <select style={select} value={newUnit.blood_group} onChange={e => setNewUnit({ ...newUnit, blood_group: e.target.value })}>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Component">
              <select style={select} value={newUnit.component} onChange={e => setNewUnit({ ...newUnit, component: e.target.value })}>
                {["Whole Blood","PRBC","Plasma","Platelets"].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Units">
              <input type="number" min="1" style={input} value={newUnit.units} onChange={e => setNewUnit({ ...newUnit, units: Number(e.target.value) })} />
            </Field>
            <Field label="Collection Date">
              <input type="date" style={input} value={newUnit.collection_date} onChange={e => setNewUnit({ ...newUnit, collection_date: e.target.value })} />
            </Field>
            <Field label="Expiry Date">
              <input type="date" style={input} value={newUnit.expiry_date} onChange={e => setNewUnit({ ...newUnit, expiry_date: e.target.value })} />
            </Field>
          </div>
          <button type="submit" style={{ marginTop: "1rem", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            <Check size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />Save to Database
          </button>
        </form>
      )}

      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.5rem 0.75rem" }}>
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search blood group or component…" style={{ border: "none", background: "none", outline: "none", fontSize: "0.85rem", width: "220px" }} />
          </div>
          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{filtered.length} records</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Blood Group","Component","Units","Collection","Expiry","Status","Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No records found. Add blood units above.</td></tr>
              )}
              {filtered.map(r => {
                const isEditing = editId === r.id;
                return (
                  <tr key={r.id}
                    style={{ borderBottom: "1px solid #f8fafc", background: isEditing ? "#eff6ff" : "", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = ""; }}>

                    {/* Blood Group */}
                    <td style={{ padding: "10px 16px" }}>
                      {isEditing ? (
                        <select value={editData.blood_group} onChange={e => setEditData(p => ({ ...p, blood_group: e.target.value }))}
                          style={{ ...cellInp, width: 72 }}>
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
                        </select>
                      ) : (
                        <span style={{ display: "inline-grid", placeItems: "center", minWidth: 38, height: 28, padding: "0 8px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", fontWeight: 800, fontSize: "0.82rem" }}>{r.blood_group}</span>
                      )}
                    </td>

                    {/* Component */}
                    <td style={{ padding: "10px 16px", fontSize: "0.83rem", fontWeight: 600, color: "#334155" }}>
                      {isEditing ? (
                        <select value={editData.component} onChange={e => setEditData(p => ({ ...p, component: e.target.value }))}
                          style={{ ...cellInp, width: 130 }}>
                          {["Whole Blood","PRBC","Plasma","Platelets"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : r.component}
                    </td>

                    {/* Units */}
                    <td style={{ padding: "10px 16px" }}>
                      {isEditing ? (
                        <input type="number" min="0" value={editData.units}
                          onChange={e => setEditData(p => ({ ...p, units: Number(e.target.value) }))}
                          style={{ ...cellInp, width: 72 }} />
                      ) : (
                        <>
                          <span style={{ fontSize: "1.15rem", fontWeight: 800, color: r.units < 5 ? "#d97706" : "#0f172a" }}>{r.units}</span>
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: 4 }}>units</span>
                        </>
                      )}
                    </td>

                    {/* Collection */}
                    <td style={{ padding: "10px 16px", fontSize: "0.8rem", color: "#64748b" }}>
                      {isEditing ? (
                        <input type="date" value={editData.collection_date}
                          onChange={e => setEditData(p => ({ ...p, collection_date: e.target.value }))}
                          style={{ ...cellInp, width: 140 }} />
                      ) : r.collection_date}
                    </td>

                    {/* Expiry */}
                    <td style={{ padding: "10px 16px", fontSize: "0.8rem", color: "#64748b" }}>
                      {isEditing ? (
                        <input type="date" value={editData.expiry_date}
                          onChange={e => setEditData(p => ({ ...p, expiry_date: e.target.value }))}
                          style={{ ...cellInp, width: 140 }} />
                      ) : r.expiry_date}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "10px 16px" }}>
                      {isEditing
                        ? <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: 600 }}>Editing…</span>
                        : <Badge tone={r.tone}>{r.status}</Badge>}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {isEditing ? (
                          <>
                            <button
                              disabled={saving === r.id}
                              onClick={() => handleSave(r.id)}
                              style={{ display: "flex", alignItems: "center", gap: 4, height: 32, padding: "0 10px", border: "none", borderRadius: "8px", background: saving === r.id ? "#e2e8f0" : "linear-gradient(135deg,#16a34a,#15803d)", color: saving === r.id ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: "0.78rem", cursor: saving === r.id ? "not-allowed" : "pointer" }}>
                              {saving === r.id ? "Saving…" : <><Check size={13} /> Save</>}
                            </button>
                            <button onClick={cancelEdit}
                              style={{ height: 32, width: 32, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "8px", color: "#64748b", cursor: "pointer", display: "grid", placeItems: "center" }}>
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              title="Edit this record"
                              onClick={() => startEdit(r)}
                              style={{ width: 32, height: 32, border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "8px", color: "#2563eb", cursor: "pointer", display: "grid", placeItems: "center", fontSize: "0.85rem" }}>
                              ✏️
                            </button>
                            <button disabled={deleting === r.id} onClick={() => handleDelete(r.id)}
                              style={{ width: 32, height: 32, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "8px", color: "#dc2626", cursor: "pointer", opacity: deleting === r.id ? 0.5 : 1, display: "grid", placeItems: "center" }}>
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Emergency ─────────────────────────────────────────────────────────────────
function EmergencyPage({ notify }) {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [expandedId, setExpandedId]   = useState(null);
  const [responsesMap, setResponsesMap] = useState({});  // { [requestId]: [...] }
  const [loadingResponses, setLoadingResponses] = useState({});
  const [form, setForm] = useState({
    patient_name: "", blood_group: "O+", units_required: 1,
    urgency_level: "Urgent", location_name: ""
  });

  const { getEmergencyResponses: _unused, ..._ } = {};  // suppress lint

  const load = useCallback(() => {
    setLoading(true);
    getEmergencyRequests()
      .then(setRequests)
      .catch(err => notify?.("Load failed: " + err.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.patient_name.trim() || !form.location_name.trim()) {
      notify?.("Patient name and location are required.", "error"); return;
    }
    setSubmitting(true);
    try {
      const created = await createEmergencyRequest({ ...form, status: "Searching" });
      setRequests(prev => [created, ...prev]);
      setShowForm(false);
      setForm({ patient_name: "", blood_group: "O+", units_required: 1, urgency_level: "Urgent", location_name: "" });
      notify?.("🚨 Emergency request created. Donors in the area will be alerted.", "success");
    } catch (err) { notify?.("Create failed: " + err.message, "error"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/emergency/requests/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      notify?.(`✅ Status updated to "${newStatus}".`, "success");
    } catch (err) {
      notify?.("Status update failed: " + err.message, "error");
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await apiRequest(`/emergency/requests/${id}/`, { method: "DELETE" });
      setRequests(prev => prev.filter(r => r.id !== id));
      if (expandedId === id) setExpandedId(null);
      notify?.("Emergency request removed.", "success");
    } catch (err) {
      notify?.("Delete failed: " + err.message, "error");
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (responsesMap[id]) return;
    setLoadingResponses(p => ({ ...p, [id]: true }));
    try {
      const data = await apiRequest(`/emergency/requests/${id}/responses/`);
      setResponsesMap(p => ({ ...p, [id]: data }));
    } catch (_) {
      setResponsesMap(p => ({ ...p, [id]: [] }));
    } finally {
      setLoadingResponses(p => ({ ...p, [id]: false }));
    }
  };

  const urgencyConfig = {
    Critical: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    Urgent:   { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    Normal:   { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  };

  const inp = { width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "9px 12px", fontSize: "0.85rem", outline: "none" };

  return (
    <>
      <PageHeader eyebrow="Emergency Coordination" title="Emergency Requests"
        sub="Create requests and monitor which donors have responded — with their GPS location."
        action={
          <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: showForm ? "#f1f5f9" : "linear-gradient(135deg, #dc2626, #b91c1c)", color: showForm ? "#64748b" : "#fff", border: "none", borderRadius: "12px", padding: "0.65rem 1.2rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: showForm ? "none" : "0 6px 20px rgba(220,38,38,0.3)" }}>
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Emergency Request</>}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "0 0 0 3px rgba(220,38,38,0.06)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #dc2626, #ef4444)" }} />
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>🚨 New Emergency Blood Request</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "1rem" }}>
            {[
              { label: "Patient Name", key: "patient_name", type: "text", placeholder: "Full patient name" },
              { label: "Units Required", key: "units_required", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</div>
                <input type={f.type} min={f.type === "number" ? "1" : undefined} max={f.type === "number" ? "50" : undefined} placeholder={f.placeholder} style={inp} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })} required />
              </div>
            ))}
            {[
              { label: "Blood Group",   key: "blood_group",   opts: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
              { label: "Urgency Level", key: "urgency_level", opts: ["Normal","Urgent","Critical"] },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</div>
                <select style={{ ...inp, cursor: "pointer" }} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Location / Ward</div>
              <input type="text" placeholder="e.g. Ward 3B, ICU, Apollo Hospital" style={inp} value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} required />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ marginTop: "1.2rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.85rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 6px 20px rgba(220,38,38,0.3)" }}>
            {submitting ? "Creating…" : "🚨 Submit Emergency Request"}
          </button>
        </form>
      )}

      {loading && <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading…</div>}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🚑</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155" }}>No emergency requests yet</div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>Create a new emergency request to alert matching donors.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {requests.map(r => {
          const cfg = urgencyConfig[r.urgency_level] || urgencyConfig.Normal;
          const isExpanded = expandedId === r.id;
          const responses = responsesMap[r.id] || [];
          const accepted  = responses.filter(x => x.action === "accepted");
          const declined  = responses.filter(x => x.action === "declined");

          return (
            <div key={r.id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: `1px solid ${cfg.border}`, boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }}>
              {/* Card header */}
              <div style={{ background: `linear-gradient(135deg, ${cfg.bg}, #fff)`, padding: "1rem 1.4rem", borderBottom: `1px solid ${cfg.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>ER-{r.id}</span>
                  <Badge tone={getBadgeTone(r.urgency_level)}>{r.urgency_level}</Badge>
                  <Badge tone={getBadgeTone(r.status)}>{r.status}</Badge>
                  {r.accepted_count > 0 && (
                    <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, color: "#16a34a" }}>
                      ✅ {r.accepted_count} donor{r.accepted_count !== 1 ? "s" : ""} accepted
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {/* Status update */}
                  <select
                    value={r.status}
                    onChange={e => handleUpdateStatus(r.id, e.target.value)}
                    style={{ fontSize: "0.75rem", fontWeight: 700, border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.3rem 0.55rem", background: "#f8fafc", color: "#374151", cursor: "pointer", outline: "none" }}
                  >
                    {["Searching", "Donor Found", "Completed", "Cancelled"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {/* View donors */}
                  <button onClick={() => toggleExpand(r.id)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.4rem 0.75rem", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                    {isExpanded ? <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} /> : <ChevronRight size={14} />}
                    {isExpanded ? "Hide" : "Donors"}
                  </button>
                  {/* Remove */}
                  <button
                    onClick={() => handleDeleteRequest(r.id)}
                    title="Remove this emergency request"
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.4rem 0.7rem", fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", cursor: "pointer" }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "1rem 1.4rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                      <span style={{ display: "inline-grid", placeItems: "center", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", padding: "2px 10px", marginRight: "0.4rem", fontSize: "0.9rem" }}>{r.blood_group}</span>
                      {r.units_required} unit{r.units_required !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={13} /> {r.location_name}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "0.2rem" }}>Patient: {r.patient_name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{new Date(r.created_at).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>

              {/* Donor responses panel */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${cfg.border}`, padding: "1.25rem 1.4rem", background: "#fafafa" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
                    Donor Responses
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8" }}>(live from DB)</span>
                  </div>

                  {loadingResponses[r.id] && <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Loading responses…</div>}

                  {!loadingResponses[r.id] && responses.length === 0 && (
                    <div style={{ textAlign: "center", padding: "1.5rem", background: "#fff", borderRadius: "12px", border: "1px dashed #e2e8f0" }}>
                      <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No donor has responded to this request yet. Donors matching <strong>{r.blood_group}</strong> will be notified via emergency alert.</div>
                    </div>
                  )}

                  {accepted.length > 0 && (
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>✅ Accepted ({accepted.length})</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {accepted.map(res => (
                          <div key={res.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #bbf7d0", overflow: "hidden" }}>
                            <div style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.75rem", color: "#166534" }}>
                                  {(res.donor_name || "D").split(" ").map(w => w[0]).join("").slice(0, 2)}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>{res.donor_name}</div>
                                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{res.blood_group} · {res.city} · {res.phone}</div>
                                </div>
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{new Date(res.responded_at).toLocaleString("en-IN")}</div>
                            </div>
                            {res.latitude && res.longitude && (
                              <div style={{ borderTop: "1px solid #dcfce7" }}>
                                <iframe
                                  title={`resp-map-${res.id}`}
                                  src={`https://maps.google.com/maps?q=${res.latitude},${res.longitude}&z=15&output=embed`}
                                  width="100%" height="200" style={{ border: "none", display: "block" }}
                                  allowFullScreen loading="lazy"
                                />
                                <div style={{ padding: "0.35rem 0.75rem", fontSize: "0.7rem", color: "#94a3b8", background: "#f0fdf4" }}>
                                  Location: {parseFloat(res.latitude).toFixed(4)}, {parseFloat(res.longitude).toFixed(4)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {declined.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                        Declined ({declined.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {declined.map(res => (
                          <span key={res.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.35rem 0.75rem", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                            {res.donor_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// -- Donors ------------------------------------------------------------------
function DonorsPage({ notify }) {
  const [rows, setRows]             = useState([]);
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(true);
  const [mapCoords, setMapCoords]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [historyMap, setHistoryMap] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [deleting, setDeleting]     = useState(null);

  useEffect(() => {
    getDonors().then(setRows).catch(err => notify?.("Load failed: " + err.message, "error")).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(d =>
    !query ||
    (d.full_name || "").toLowerCase().includes(query.toLowerCase()) ||
    d.blood_group.includes(query.toUpperCase()) ||
    (d.city || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleRemoveDonor = async (donorId, donorName) => {
    setDeleting(donorId);
    try {
      await apiRequest(`/donors/${donorId}/`, { method: "DELETE" });
      setRows(prev => prev.filter(d => d.id !== donorId));
      if (expandedId === donorId) setExpandedId(null);
      notify?.(`${donorName} removed from the donor list.`, "success");
    } catch (err) {
      notify?.("Remove failed: " + err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const toggleHistory = async (donorId) => {
    if (expandedId === donorId) { setExpandedId(null); return; }
    setExpandedId(donorId);
    if (historyMap[donorId] !== undefined) return;
    setLoadingHistory(p => ({ ...p, [donorId]: true }));
    try {
      const data = await getDonationRecords(donorId);
      setHistoryMap(p => ({ ...p, [donorId]: data }));
    } catch (_) {
      setHistoryMap(p => ({ ...p, [donorId]: [] }));
    } finally {
      setLoadingHistory(p => ({ ...p, [donorId]: false }));
    }
  };

  return (
    <>
      <PageHeader eyebrow="Donor Records" title="Approved Donors" sub="Only approved donors appear here — available for emergency matching. Click a row to view their donation history." />

      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.5rem 0.75rem" }}>
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, blood group or city…" style={{ border: "none", background: "none", outline: "none", fontSize: "0.85rem", width: "250px" }} />
          </div>
          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>{filtered.length} donors</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Donor","Blood Group","City","Availability","Last Donation","History","Map","Remove"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading donors…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No approved donors yet. Approve donors from the Pending Approvals tab.</td></tr>}
              {filtered.map(d => (
                <React.Fragment key={d.id}>
                  <tr style={{ borderBottom: expandedId === d.id ? "none" : "1px solid #f8fafc", transition: "background 0.12s", background: expandedId === d.id ? "#fafafa" : "" }}
                    onMouseEnter={e => { if (expandedId !== d.id) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={e => { if (expandedId !== d.id) e.currentTarget.style.background = ""; }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #fef2f2, #fecaca)", color: "#b91c1c", display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
                          {(d.full_name || "D").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{d.full_name || "—"}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-grid", placeItems: "center", minWidth: 38, height: 28, padding: "0 8px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", fontWeight: 800, fontSize: "0.82rem" }}>{d.blood_group}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.83rem", color: "#334155" }}>{d.city || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><Badge tone={d.is_available ? "green" : "slate"}>{d.is_available ? "Available" : "Not Available"}</Badge></td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b" }}>{d.last_donation || "None"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => toggleHistory(d.id)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: expandedId === d.id ? "#eff6ff" : "#f8fafc", border: `1px solid ${expandedId === d.id ? "#bfdbfe" : "#e2e8f0"}`, color: expandedId === d.id ? "#2563eb" : "#64748b", borderRadius: "8px", padding: "0.3rem 0.65rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                        {expandedId === d.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />} History
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {d.latitude && d.longitude
                        ? <button onClick={() => setMapCoords({ lat: d.latitude, lng: d.longitude, name: d.full_name })} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "8px", padding: "0.3rem 0.65rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                            <MapPin size={12} /> Map
                          </button>
                        : <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        disabled={deleting === d.id}
                        onClick={() => handleRemoveDonor(d.id, d.full_name || "Donor")}
                        title="Remove this donor"
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: deleting === d.id ? "#f8fafc" : "#fef2f2", border: "1px solid #fecaca", color: deleting === d.id ? "#94a3b8" : "#dc2626", borderRadius: "8px", padding: "0.3rem 0.65rem", fontSize: "0.75rem", fontWeight: 700, cursor: deleting === d.id ? "not-allowed" : "pointer", opacity: deleting === d.id ? 0.6 : 1 }}
                      >
                        <Trash2 size={12} /> {deleting === d.id ? "…" : "Remove"}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Donation History */}
                  {expandedId === d.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: "0 0 12px", background: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ margin: "0 16px", padding: "1rem", background: "#fff", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1d4ed8", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            📋 Donation History for {d.full_name}
                          </div>
                          {loadingHistory[d.id] && <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Loading records…</div>}
                          {!loadingHistory[d.id] && (historyMap[d.id] || []).length === 0 && (
                            <div style={{ color: "#94a3b8", fontSize: "0.82rem", textAlign: "center", padding: "1rem 0" }}>No donation records logged by this donor yet.</div>
                          )}
                          {!loadingHistory[d.id] && (historyMap[d.id] || []).length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {(historyMap[d.id] || []).map(r => (
                                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.85rem", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                                  <div style={{ fontSize: "1rem" }}>🩸</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{r.blood_group} — {r.units_donated} unit{r.units_donated !== 1 ? "s" : ""}</div>
                                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{r.location || "—"} · {r.donation_date}</div>
                                    {r.notes && <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{r.notes}</div>}
                                  </div>
                                  {r.certificate_url && (
                                    <a href={r.certificate_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.65rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                                      <FileText size={11} /> Certificate
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map modal */}
      {mapCoords && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "min(600px, 92vw)", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>📍 {mapCoords.name}'s Location</h3>
              <button onClick={() => setMapCoords(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", fontSize: "0.82rem" }}>✕ Close</button>
            </div>
            <iframe title="donor-map" src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`} width="100%" height="360" style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" />
          </div>
        </div>
      )}
    </>
  );
}

// ── Blood Availability ─────────────────────────────────────────────────────────
function BloodAvailabilityPage({ notify }) {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBloodInventory().then(setRows).catch(err => notify?.("Load failed: " + err.message, "error")).finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const map = {};
    const today = new Date();
    rows.forEach(r => {
      if (!map[r.blood_group]) map[r.blood_group] = { available: 0, expiringSoon: 0, expired: 0, total: 0 };
      const d = r.expiry_date ? (new Date(r.expiry_date) - today) / 86400000 : 999;
      if (d < 0)       map[r.blood_group].expired      += r.units;
      else if (d <= 7) map[r.blood_group].expiringSoon  += r.units;
      else             map[r.blood_group].available      += r.units;
      // total = only valid (non-expired) units
      if (d >= 0)      map[r.blood_group].total          += r.units;
    });
    return Object.entries(map).map(([group, s]) => ({ group, ...s })).sort((a, b) => b.total - a.total);
  }, [rows]);

  const maxTotal = Math.max(...summary.map(s => s.total), 1);

  return (
    <>
      <PageHeader eyebrow="Stock Overview" title="Blood Availability" sub="Aggregated units by blood group — live from inventory."
        action={<Link to="/admin/inventory" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #b91c1c, #991b1b)", color: "#fff", textDecoration: "none", borderRadius: "12px", padding: "0.65rem 1.2rem", fontWeight: 700, fontSize: "0.85rem" }}><Plus size={16} /> Manage Inventory</Link>}
      />
      {loading && <p style={{ color: "#94a3b8" }}>Loading…</p>}
      {!loading && summary.length === 0 && <p style={{ color: "#94a3b8" }}>No inventory records yet. Add blood units to the inventory.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "1rem" }}>
        {summary.map(s => (
          <div key={s.group} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
            <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "linear-gradient(135deg, #fef2f2, #fff)", borderBottom: "1px solid #fecaca" }}>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Blood Group</div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#b91c1c", lineHeight: 1.1 }}>{s.group}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Valid Units</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>{s.total}</div>
              </div>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {/* Progress bar */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ height: 6, background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.available / maxTotal) * 100}%`, background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: "999px", transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ display: "grid", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "#64748b" }}>🟢 Available</span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>{s.available} units</span>
                </div>
                {s.expiringSoon > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#64748b" }}>⚠️ Expiring Soon</span>
                    <span style={{ fontWeight: 700, color: "#d97706" }}>{s.expiringSoon} units</span>
                  </div>
                )}
                {s.expired > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#64748b" }}>🗑️ Expired</span>
                    <span style={{ fontWeight: 700, color: "#dc2626" }}>{s.expired} units</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ notify }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [stockAlerts, setStockAlerts]  = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const navigate = useNavigate();

  // Load pending count for sidebar badge
  useEffect(() => {
    apiRequest("/donors/pending/").then(data => setPendingCount(Array.isArray(data) ? data.length : 0)).catch(() => {});
  }, []);

  // Check stock alerts on load
  useEffect(() => {
    if (alertDismissed) return;
    apiRequest("/stats/").then(stats => {
      if (stats.expired > 0 || stats.expiring_soon > 0 || stats.low_stock > 0) {
        setStockAlerts({ expired: stats.expired, expiringSoon: stats.expiring_soon, lowStock: stats.low_stock });
      }
    }).catch(() => {});
  }, [alertDismissed]);

  return (
    <Layout notify={notify} pendingCount={pendingCount}>
      <StockAlert
        alerts={stockAlerts}
        onView={() => { setStockAlerts(null); setAlertDismissed(true); navigate("/admin/inventory"); }}
        onDismiss={() => { setStockAlerts(null); setAlertDismissed(true); }}
      />
      <Routes>
        <Route index                  element={<Overview             notify={notify} />} />
        <Route path="inventory"       element={<InventoryPage        notify={notify} />} />
        <Route path="emergency"       element={<EmergencyPage        notify={notify} />} />
        <Route path="donors"          element={<DonorsPage           notify={notify} />} />
        <Route path="pending-donors"  element={<PendingDonorsAdmin   notify={notify} />} />
        <Route path="availability"    element={<BloodAvailabilityPage notify={notify} />} />
      </Routes>
    </Layout>
  );
}
