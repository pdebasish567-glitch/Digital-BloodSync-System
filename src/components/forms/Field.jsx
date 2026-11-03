import React from "react";

export default function Field({ label, name, value, onChange, type = "text", placeholder, required = false, options, min, max }) {
  return (
    <label className="field">
      <span>{label}{required && " *"}</span>
      {options ? (
        <select name={name} value={value} onChange={onChange} required={required}>
          <option value="">Select</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder} required={required} min={min} max={max}/>
      )}
    </label>
  );
}