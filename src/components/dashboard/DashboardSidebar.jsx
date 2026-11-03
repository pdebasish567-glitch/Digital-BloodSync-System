import React from "react";
import { NavLink } from "react-router-dom";
import {
  Activity, Bell, ClipboardCheck, ClipboardList,
  Droplets, LayoutDashboard, LogOut, UserRound, Users, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardSidebar({ type = "admin", open, onClose }) {
  const { logout } = useAuth();

  const adminLinks = [
    ["/admin",               "Dashboard",         LayoutDashboard],
    ["/admin/inventory",     "Blood Inventory",   Droplets],
    ["/admin/emergency",     "Emergency Requests", Bell],
    ["/admin/donors",        "Registered Donors", Users],
    ["/admin/pending-donors","Pending Approvals", ClipboardCheck],
    ["/admin/availability",  "Blood Availability", Activity],
    ["/profile",             "Profile",           UserRound],
  ];

  const donorLinks = [
    ["/donor-dashboard",           "Dashboard",        LayoutDashboard],
    ["/donor-dashboard/requests",  "Emergency Requests", Bell],
    ["/donor-dashboard/history",   "Donation History", ClipboardList],
    ["/donor-dashboard/profile",   "Profile",          UserRound],
  ];

  const links = type === "admin" ? adminLinks : donorLinks;
  const base  = type === "admin" ? "admin" : "donor-dashboard";

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-icon">❤</span>
            <span>
              <strong>Digital Blood</strong>
              <small>{type === "admin" ? "Hospital Portal" : "Donor Portal"}</small>
            </span>
          </div>
          <button className="sidebar-close" onClick={onClose}><X /></button>
        </div>

        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === `/${base}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  );
}
