import React, { useEffect, useState } from "react";
import {
  Check, X, MapPin, User, Droplets, Calendar, Phone, Weight,
  ClipboardCheck, RefreshCw, ChevronDown, ChevronUp, FileText,
  AlertCircle, CheckCircle2, Clock, Image, File
} from "lucide-react";
import { apiRequest } from "../../services/apiClient";

/* ── Badge ─────────────────────────────────────────────────────────────────── */
function Badge({ children, tone }) {
  const s = {
    green:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    amber:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    blue:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    slate:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  }[tone || "slate"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {children}
    </span>
  );
}

/* ── Health criteria ────────────────────────────────────────────────────────── */
function getCriteria(d) {
  return [
    { label: "Age 18–65",         ok: d.age >= 18 && d.age <= 65,        value: `${d.age} yrs`         },
    { label: "Weight ≥ 50 kg",    ok: parseFloat(d.weight) >= 50,         value: `${d.weight} kg`       },
    { label: "Hemoglobin ≥ 12.5", ok: parseFloat(d.hemoglobin) >= 12.5,   value: `${d.hemoglobin} g/dL` },
    { label: "Blood group set",   ok: !!d.blood_group,                    value: d.blood_group || "—"   },
  ];
}

/* ── Info grid item ─────────────────────────────────────────────────────────── */
function InfoItem({ label, value }) {
  return (
    <div style={{ padding: "0.6rem 0.75rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: "0.63rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a", marginTop: "0.15rem" }}>{value || "—"}</div>
    </div>
  );
}

/* ── Document tile ──────────────────────────────────────────────────────────── */
function DocTile({ label, url, icon: Icon, isImage }) {
  if (!url) return (
    <div style={{ background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: "12px", padding: "1.25rem", textAlign: "center", color: "#94a3b8" }}>
      <Icon size={22} style={{ display: "block", margin: "0 auto 0.5rem", opacity: 0.4 }} />
      <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>No {label} uploaded</div>
    </div>
  );
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
      {isImage ? (
        <img src={url} alt={label} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ height: 140, display: "grid", placeItems: "center", background: "#f0f9ff" }}>
          <FileText size={40} style={{ color: "#2563eb", opacity: 0.6 }} />
        </div>
      )}
      <div style={{ padding: "0.5rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151" }}>{label}</span>
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 700, textDecoration: "none", background: "#eff6ff", padding: "0.25rem 0.6rem", borderRadius: "6px" }}>
          Open ↗
        </a>
      </div>
    </div>
  );
}

/* ── DonorCard ──────────────────────────────────────────────────────────────── */
function DonorCard({ donor, onApprove, onReject, processing, confirmReject, setConfirmReject }) {
  const [expanded,    setExpanded]    = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const isProcessing = processing === donor.id;
  const criteria    = getCriteria(donor);
  const allPassed   = criteria.every(c => c.ok);
  const hasPhoto    = !!donor.profile_photo_url;
  const hasDoc      = !!donor.hemoglobin_document_url;
  const initials    = (donor.full_name || "D").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: `1.5px solid ${allPassed ? "#bbf7d0" : "#fde68a"}`, boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>

      {/* ── Card header ── */}
      <div style={{ background: `linear-gradient(135deg, ${allPassed ? "#f0fdf4" : "#fffbeb"}, #fff)`, padding: "1.1rem 1.4rem", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            {/* Avatar / photo */}
            {hasPhoto ? (
              <img src={donor.profile_photo_url} alt={donor.full_name}
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #b91c1c" }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #7f1d1d, #b91c1c)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{donor.full_name || "—"}</div>
              <div style={{ fontSize: "0.77rem", color: "#64748b" }}>{donor.email} · {donor.phone || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ display: "inline-grid", placeItems: "center", minWidth: 36, height: 26, padding: "0 8px", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", fontWeight: 800, fontSize: "0.85rem" }}>{donor.blood_group}</span>
            {hasDoc  && <Badge tone="blue">📎 Hb Report</Badge>}
            <Badge tone={allPassed ? "green" : "amber"}>{allPassed ? "✓ Eligible" : "⚠ Review"}</Badge>
            <button onClick={() => setExpanded(v => !v)}
              style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem", fontWeight: 600 }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? "Collapse" : "Full Details"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid #f1f5f9" }}>
        {[
          { icon: Calendar, label: "Age",    value: `${donor.age} yrs`          },
          { icon: Weight,   label: "Weight", value: `${donor.weight} kg`        },
          { icon: Droplets, label: "Hb",     value: `${donor.hemoglobin} g/dL`  },
          { icon: MapPin,   label: "City",   value: donor.city || "—"           },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ padding: "0.75rem 0.5rem", borderRight: "1px solid #f1f5f9", textAlign: "center" }}>
            <Icon size={13} style={{ color: "#94a3b8", display: "block", margin: "0 auto 0.25rem" }} />
            <div style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
            <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#0f172a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Eligibility chips ── */}
      <div style={{ padding: "0.7rem 1.4rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
        {criteria.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.28rem 0.6rem", borderRadius: "8px", background: c.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${c.ok ? "#bbf7d0" : "#fecaca"}`, fontSize: "0.73rem", fontWeight: 600, color: c.ok ? "#166534" : "#991b1b" }}>
            {c.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            {c.label}: <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      {/* ── Expanded full details ── */}
      {expanded && (
        <div style={{ padding: "1.25rem 1.4rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Personal info grid */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>Personal & Contact</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: "0.65rem" }}>
              <InfoItem label="Gender"            value={donor.gender} />
              <InfoItem label="Address"           value={donor.address} />
              <InfoItem label="PIN Code"          value={donor.pin_code} />
              <InfoItem label="Emergency Contact" value={donor.emergency_contact} />
              <InfoItem label="Occupation"        value={donor.occupation} />
              <InfoItem label="Preferred Time"    value={donor.preferred_time} />
              <InfoItem label="Last Donation"     value={donor.last_donation || "First-time donor"} />
              <InfoItem label="Donor ID"          value={`#${donor.id}`} />
            </div>
          </div>

          {/* Documents */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={13} /> Uploaded Documents
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <DocTile
                label="Profile Photo"
                url={donor.profile_photo_url}
                icon={Image}
                isImage={true}
              />
              <DocTile
                label="Hemoglobin Report"
                url={donor.hemoglobin_document_url}
                icon={FileText}
                isImage={donor.hemoglobin_document_url?.match(/\.(jpg|jpeg|png|webp)$/i)}
              />
            </div>
          </div>

          {/* Map */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={13} /> GPS Location
            </div>
            {donor.latitude && donor.longitude ? (
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <iframe
                  title={`map-${donor.id}`}
                  src={`https://maps.google.com/maps?q=${donor.latitude},${donor.longitude}&z=15&output=embed`}
                  width="100%" height="220" style={{ border: "none", display: "block" }}
                  allowFullScreen loading="lazy"
                />
                <div style={{ padding: "0.4rem 0.75rem", fontSize: "0.7rem", color: "#64748b", background: "#f8fafc" }}>
                  {parseFloat(donor.latitude).toFixed(5)}, {parseFloat(donor.longitude).toFixed(5)}
                </div>
              </div>
            ) : (
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.82rem", border: "1.5px dashed #e2e8f0" }}>
                <MapPin size={20} style={{ display: "block", margin: "0 auto 0.5rem", opacity: 0.4 }} />
                No GPS location submitted by this donor.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ padding: "1rem 1.4rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          disabled={isProcessing}
          onClick={() => onApprove(donor.id, donor.full_name)}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.65rem 1.2rem", fontWeight: 700, fontSize: "0.85rem", cursor: isProcessing ? "not-allowed" : "pointer", opacity: isProcessing ? 0.6 : 1, boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
          <Check size={15} /> {isProcessing ? "Processing…" : "Approve Donor"}
        </button>

        {confirmReject === donor.id ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Reason for rejection (required)…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ border: "1px solid #fecaca", borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.8rem", outline: "none", width: 250, fontFamily: "inherit" }}
            />
            <button
              disabled={isProcessing || !rejectReason.trim()}
              onClick={() => onReject(donor.id, donor.full_name, rejectReason)}
              style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "0.55rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: isProcessing || !rejectReason.trim() ? "not-allowed" : "pointer", opacity: !rejectReason.trim() ? 0.5 : 1 }}>
              Confirm Reject
            </button>
            <button onClick={() => setConfirmReject(null)}
              style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.55rem 0.8rem", fontSize: "0.78rem", cursor: "pointer", color: "#64748b" }}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            disabled={isProcessing}
            onClick={() => setConfirmReject(donor.id)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.65rem 1.1rem", fontWeight: 700, fontSize: "0.85rem", cursor: isProcessing ? "not-allowed" : "pointer" }}>
            <X size={15} /> Reject
          </button>
        )}

        <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Clock size={13} /> Pending review
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function PendingDonorsAdmin({ notify }) {
  const [donors,        setDonors]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [processing,    setProcessing]    = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  const fetchPendingDonors = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/donors/pending/");
      setDonors(data);
    } catch (err) {
      notify?.("Failed to load pending donors: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingDonors(); }, []);

  const handleApprove = async (donorId, donorName) => {
    setProcessing(donorId);
    try {
      await apiRequest(`/donors/${donorId}/approve/`, { method: "POST" });
      setDonors(prev => prev.filter(d => d.id !== donorId));
      notify?.(`✅ ${donorName} approved! Approval email sent.`, "success");
    } catch (err) {
      notify?.("Approval failed: " + err.message, "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (donorId, donorName, reason) => {
    setProcessing(donorId);
    setConfirmReject(null);
    try {
      await apiRequest(`/donors/${donorId}/reject/`, { method: "POST", body: JSON.stringify({ reason }) });
      setDonors(prev => prev.filter(d => d.id !== donorId));
      notify?.(`${donorName} rejected. Rejection email sent.`, "error");
    } catch (err) {
      notify?.("Rejection failed: " + err.message, "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Approval Queue</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Pending Donor Approvals</h1>
          <p style={{ fontSize: "0.84rem", color: "#94a3b8", margin: 0 }}>
            Review health eligibility, uploaded documents, and GPS location before approving.
          </p>
        </div>
        <button onClick={fetchPendingDonors}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: "#475569" }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background: "linear-gradient(135deg, #eff6ff, #fff)", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <ClipboardCheck size={18} style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "0.82rem", color: "#1e40af", lineHeight: 1.6 }}>
          <strong>Approval workflow:</strong> Check the eligibility criteria chips, view the donor's uploaded photo and hemoglobin report, and verify GPS location. Approval triggers an automated email and activates the donor for emergency alerts.
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 0.75rem" }} />
          Loading pending applicants…
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {!loading && donors.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "grid", placeItems: "center", margin: "0 auto 1rem" }}>
            <CheckCircle2 size={30} style={{ color: "#16a34a" }} />
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#166534", marginBottom: "0.5rem" }}>All caught up!</div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No donor registrations are currently awaiting approval.</div>
        </div>
      )}

      {!loading && donors.length > 0 && (
        <>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b", marginBottom: "1rem" }}>
            {donors.length} applicant{donors.length !== 1 ? "s" : ""} awaiting review
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {donors.map(donor => (
              <DonorCard
                key={donor.id}
                donor={donor}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
                confirmReject={confirmReject}
                setConfirmReject={setConfirmReject}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
