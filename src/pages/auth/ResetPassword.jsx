import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";

export default function ResetPassword({ notify }) {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token") || "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new password reset.");
  }, [token]);

  /* ── password strength checker ── */
  const strength = (() => {
    if (!password) return { score: 0, label: "", color: "#e2e8f0" };
    let s = 0;
    if (password.length >= 8)              s++;
    if (/[A-Z]/.test(password))            s++;
    if (/[0-9]/.test(password))            s++;
    if (/[^A-Za-z0-9]/.test(password))     s++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["#e2e8f0", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
    return { score: s, label: labels[s], color: colors[s] };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token)          { setError("No reset token found in the URL."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await resetPassword(token, password, confirm);
      setSuccess(true);
      notify?.(res.message || "Password reset successful!", "success");
      setTimeout(() => navigate("/donor-login"), 2500);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px",
    padding: "11px 14px", fontSize: "0.9rem", outline: "none",
    background: "#fff", boxSizing: "border-box", transition: "border 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#fff 0%,#fff5f5 50%,#fff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem",
      backgroundImage: "radial-gradient(circle at 1px 1px, #f1f5f9 1px, transparent 0)",
      backgroundSize: "32px 32px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
        padding: "2.25rem", width: "100%", maxWidth: 420,
      }}>

        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#fef2f2", border: "1px solid #fecaca", display: "grid", placeItems: "center", fontSize: "1.4rem", marginBottom: "1rem" }}>
            🔑
          </div>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
            Digital Blood Sync
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem" }}>
            {success ? "Password Reset!" : "Set New Password"}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
            {success
              ? "Your password has been updated. Redirecting to login…"
              : "Enter a strong new password for your account."}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Password changed successfully!
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Redirecting you to login in 3 seconds…
            </div>
            <Link to="/donor-login" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg,#b91c1c,#991b1b)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}>
              Go to Login →
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.7rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#dc2626", fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}

            {/* Token missing warning */}
            {!token ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
                  This link is invalid. Please request a new password reset from the login page.
                </p>
                <Link to="/donor-login" style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "none", fontSize: "0.88rem" }}>
                  ← Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                {/* New password */}
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inp, paddingRight: "3rem" }}
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      onFocus={e => e.target.style.borderColor = "#b91c1c"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#94a3b8", padding: 0, lineHeight: 1 }}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div style={{ height: 4, background: "#f1f5f9", borderRadius: "2px", overflow: "hidden", marginBottom: "0.25rem" }}>
                        <div style={{ height: "100%", width: `${(strength.score / 4) * 100}%`, background: strength.color, borderRadius: "2px", transition: "width 0.3s, background 0.3s" }} />
                      </div>
                      <div style={{ fontSize: "0.68rem", color: strength.color, fontWeight: 700 }}>{strength.label}</div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
                    Confirm Password
                  </label>
                  <input
                    style={{ ...inp, borderColor: confirm && confirm !== password ? "#ef4444" : "#e2e8f0" }}
                    type={showPass ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(""); }}
                    onFocus={e => e.target.style.borderColor = "#b91c1c"}
                    onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? "#ef4444" : "#e2e8f0"}
                    required
                  />
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.3rem", fontWeight: 600 }}>
                      Passwords don't match
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading || !token}
                  style={{
                    background: loading ? "#f1f5f9" : "linear-gradient(135deg,#dc2626,#b91c1c)",
                    color: loading ? "#94a3b8" : "#fff", border: "none", borderRadius: "10px",
                    padding: "0.85rem", fontWeight: 700, fontSize: "0.9rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 14px rgba(185,28,28,0.3)",
                    transition: "all 0.2s",
                  }}>
                  {loading ? "Resetting Password…" : "Reset Password"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <Link to="/donor-login" style={{ fontSize: "0.8rem", color: "#64748b", textDecoration: "none" }}>
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
