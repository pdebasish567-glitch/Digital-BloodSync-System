import React from "react";
import PageHeader from "../../components/common/PageHeader";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return <>
    <PageHeader title="Contact" text="Use the demonstration contact details below for the academic project interface."/>
    <section className="section"><div className="container three-grid">
      <div className="contact-card"><MapPin/><h3>Location</h3><p>Capital Hospital Blood Bank<br/>Bhubaneswar, Odisha, India</p></div>
      <div className="contact-card"><Phone/><h3>Phone</h3><p>+91 90000 00000<br/>Hospital blood bank desk</p></div>
      <div className="contact-card"><Mail/><h3>Email</h3><p>support@digitalbloodsync.demo<br/>Academic project contact</p></div>
    </div></section>
  </>;
}