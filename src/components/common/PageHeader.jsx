import React from "react";

export default function PageHeader({ eyebrow = "Digital Blood Sync", title, text }) {
  return (
    <section className="page-header">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}