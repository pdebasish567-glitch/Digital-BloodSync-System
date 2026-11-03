import React from "react";
import PageHeader from "../../components/common/PageHeader";
import HospitalRegistrationForm from "../../components/forms/HospitalRegistrationForm";

export default function HospitalRegistration({ notify }) {
  return <><PageHeader eyebrow="Hospital Portal" title="Hospital Registration" text="Register the hospital blood bank that will manage its own stock through this system."/><section className="section"><div className="container content-narrow"><HospitalRegistrationForm onSuccess={notify}/></div></section></>;
}