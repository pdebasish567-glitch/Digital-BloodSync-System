import React, { useState } from "react";
import Field from "./Field";
import { bloodGroups } from "../../data/sampleData";

const initial = { patientName:"", hospitalName:"Capital Hospital Blood Bank", group:"", units:"", level:"Critical", date:"", location:"Bhubaneswar, Odisha", contact:"", info:"" };

export default function EmergencyRequestForm({ onSuccess }) {
  const [data, setData] = useState(initial);
  const update = e => setData({...data, [e.target.name]: e.target.value});
  const submit = e => {
    e.preventDefault();
    onSuccess("Emergency blood request submitted. Suitable donor search can now begin.", "success");
    setData(initial);
  };
  return <form className="form-card wide" onSubmit={submit}>
    <div className="form-grid">
      <Field label="Patient Name" name="patientName" value={data.patientName} onChange={update} required placeholder="Demo patient name"/>
      <Field label="Hospital Name" name="hospitalName" value={data.hospitalName} onChange={update} required/>
      <Field label="Blood Group" name="group" value={data.group} onChange={update} options={bloodGroups}/>
      <Field label="Required Units" name="units" type="number" value={data.units} onChange={update} required min="1"/>
      <Field label="Emergency Level" name="level" value={data.level} onChange={update} options={["Critical","Urgent","Normal"]}/>
      <Field label="Required Date" name="date" type="date" value={data.date} onChange={update} required/>
      <Field label="Hospital Location" name="location" value={data.location} onChange={update} required/>
      <Field label="Contact Number" name="contact" value={data.contact} onChange={update} required/>
    </div>
    <label className="field"><span>Additional Information</span><textarea name="info" value={data.info} onChange={update} rows="4" placeholder="Add relevant emergency details"></textarea></label>
    <button className="btn btn-primary" type="submit">Submit Emergency Request</button>
  </form>;
}