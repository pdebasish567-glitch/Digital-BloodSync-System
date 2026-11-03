import React from "react";

export default function StatsCard({ icon, label, value, note, tone = "" }) {
  return (
    <div className={`stats-card ${tone}`}>
      <div className="stats-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
    </div>
  );
}