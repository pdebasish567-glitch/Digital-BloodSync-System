import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HeartPulse, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = [
    ["/", "Home"],
    ["/about", "About"],
    ["/blood-availability", "Blood Availability"],
    ["/become-donor", "Become a Donor"]
  ];

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon"><HeartPulse size={21} /></span>
          <span><strong>Digital Blood</strong><small>Sync System</small></span>
        </Link>

        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {nav.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <div className="nav-actions">
            <Link className="btn btn-outline btn-small" to="/hospital-login" onClick={() => setOpen(false)}>Hospital Login</Link>
            <Link className="btn btn-primary btn-small" to="/donor-login" onClick={() => setOpen(false)}>Donor Login</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}