import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-icon">❤</span><span><strong>Digital Blood</strong><small>Sync System</small></span></div>
          <p>A focused academic blood-management and emergency donor coordination platform for a hospital blood bank.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link><Link to="/about">About</Link><Link to="/blood-availability">Blood Availability</Link><Link to="/become-donor">Become a Donor</Link>
        </div>
        <div>
          <h4>Portal</h4>
          <Link to="/hospital-login">Hospital Login</Link><Link to="/donor-login">Donor Login</Link><Link to="/emergency-request">Emergency Request</Link><Link to="/profile">Profile</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p><Mail size={15}/> support@digitalbloodsync.demo</p>
          <p><Phone size={15}/> +91 90000 00000</p>
          <p><MapPin size={15}/> Bhubaneswar, Odisha, India</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Digital Blood Sync System · Academic Project Prototype</div>
    </footer>
  );
}