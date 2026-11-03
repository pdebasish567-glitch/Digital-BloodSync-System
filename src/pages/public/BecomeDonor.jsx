import React from "react";
import PageHeader from "../../components/common/PageHeader";
import DonorRegistrationForm from "../../components/forms/DonorRegistrationForm";
import { HeartHandshake, ShieldCheck } from "lucide-react";

export default function BecomeDonor({ notify }) {
  return <>
    <PageHeader eyebrow="Donor Registration" title="Become a Blood Donor" text="Register your details so authorized hospital staff can coordinate eligible donors for emergency requests."/>
    <section className="section"><div className="container form-layout"><div><div className="side-info"><HeartHandshake/><h3>Your donation matters</h3><p>Donor registration helps the hospital maintain an organized donor record and identify available volunteers during emergencies.</p><div className="mini-points"><span><ShieldCheck/> Eligibility information</span><span><ShieldCheck/> Availability status</span><span><ShieldCheck/> Donation history</span></div></div></div><DonorRegistrationForm onSuccess={notify}/></div></section>
  </>;
}