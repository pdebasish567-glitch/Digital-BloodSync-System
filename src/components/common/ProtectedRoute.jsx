import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protects a route requiring authentication.
 * role: 'ADMIN' | 'DONOR' | null (any authenticated user)
 */
export default function ProtectedRoute({ children, role, redirectTo = "/" }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #f3f4f6", borderTop: "4px solid #ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748b", fontWeight: 500 }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (role && user.role !== role) {
    // Wrong role — send to their correct dashboard
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/donor-dashboard"} replace />;
  }

  return children;
}
