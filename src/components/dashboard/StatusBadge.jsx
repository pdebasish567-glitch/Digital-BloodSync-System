import React from "react";

export default function StatusBadge({ children }) {
  const key = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`status ${key}`}>{children}</span>;
}