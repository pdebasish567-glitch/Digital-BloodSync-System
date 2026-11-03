import React from "react";
import { Droplets } from "lucide-react";

export default function BloodGroupCard({ group, units, status, onClick }) {
  return (
    <button className="blood-card" onClick={onClick}>
      <span className="blood-drop"><Droplets size={22}/></span>
      <strong>{group}</strong>
      <span>{units} units</span>
      <span className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>
    </button>
  );
}