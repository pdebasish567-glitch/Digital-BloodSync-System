import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, forgotPassword } from "../../services/authService";

export default function LoginForm({ role, notify }) {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const isDonor = role === "Donor";
  const accent  = isDonor ? "#b91c1c" : "#1d4ed8";
  const accentLight = isDonor ? "#fef2f2" : "#eff6ff";
  const accentBorder = isDonor ? "#fecaca" : "#bfdbfe";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  // Forgot password state
  const [isForgot, setIsForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in both fields."); return; }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.tokens.access, { email, role: res.role, name: res.name });
      notify?.(`Welcome back, ${res.name}!`, "success");
      navigate(res.role === "ADMIN" ? "/admin" : "/donor-dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!resetEmail.includes("@")) { setError("Enter a valid email address."); return; }
    setForgotLoading(true);
    setError("");
    try {
      const res = await forgotPassword(resetEmail.trim().toLowerCase());
      notify?.(res.message || `Reset link sent to ${resetEmail}.`, "success");
      setIsForgot(false);
      setResetEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const inp = {
    width: "100%", border: `1.5px solid #e2e8f0`, borderRadius: "10px",
    padding: "11px 14px", fontSize: "0.9rem", outline: "none",
    background: "#fff", boxSizing: "border-box", transition: "border 0.15s",
  };

  return (
    <div style={{
      background: "#fff", borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
      padding: "2.25rem 2.25rem 2rem",
      width: "100%", maxWidth: 420,
    }}>
      {/* Logo + header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "14px",
          background: accentLight, border: `1px solid ${accentBorder}`,
          display: "grid", placeItems: "center", fontSize: "1.4rem", marginBottom: "1rem",
        }}>
          {isDonor ? "🩸" : "🏥"}
        </div>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
          {role} Portal
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem" }}>
          {isForgot ? "Reset Password" : "Sign In"}
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
          {isForgot
            ? "Enter your registered email to receive a reset link."
            : `Access your ${isDonor ? "donor" : "hospital admin"} dashboard.`}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.7rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⚠ {error}
        </div>
      )}

      {isForgot ? (
        <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
              Email Address
            </label>
            <input style={inp} type="email" placeholder="name@example.com"
              value={resetEmail} onChange={e => { setResetEmail(e.target.value); setError(""); }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              required />
          </div>
          <button type="submit" disabled={forgotLoading}
            style={{ background: forgotLoading ? "#f1f5f9" : `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: forgotLoading ? "#94a3b8" : "#fff", border: "none", borderRadius: "10px", padding: "0.8rem", fontWeight: 700, fontSize: "0.9rem", cursor: forgotLoading ? "not-allowed" : "pointer", boxShadow: forgotLoading ? "none" : `0 4px 14px ${accent}33` }}>
            {forgotLoading ? "Sending…" : "Send Reset Link"}
          </button>
          <button type="button" onClick={() => { setIsForgot(false); setError(""); }}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", color: "#475569" }}>
            ← Back to Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
              Email Address
            </label>
            <input style={inp} type="email" placeholder="name@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              autoComplete="email" required />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Password
              </label>
              <button type="button" onClick={() => { setIsForgot(true); setError(""); }}
                style={{ background: "none", border: "none", color: accent, fontSize: "0.76rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                Forgot Password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inp, paddingRight: "3rem" }}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                autoComplete="current-password" required
              />
              <button type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#94a3b8", padding: 0, lineHeight: 1 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              background: loading ? "#f1f5f9" : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: loading ? "#94a3b8" : "#fff",
              border: "none", borderRadius: "10px", padding: "0.85rem",
              fontWeight: 700, fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 4px 14px ${accent}33`,
              transition: "all 0.2s",
            }}>
            {loading ? "Signing in…" : `Sign In as ${role}`}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
            {isDonor ? (
              <>Not registered?{" "}<Link to="/donor-registration" style={{ color: accent, fontWeight: 700, textDecoration: "none" }}>Create a donor account</Link></>
            ) : (
              <>New Admin?{" "}<Link to="/hospital-registration" style={{ color: accent, fontWeight: 700, textDecoration: "none" }}>Register</Link></>
            )}
          </div>
        </form>
      )}
    </div>
  );
}