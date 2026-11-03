import React, { useState } from "react";
import { Search } from "lucide-react";
import { bloodGroups } from "../../data/sampleData";

export default function SearchBloodForm({ onSearch }) {
  const [group, setGroup] = useState("");

  function submit(e) {
    e.preventDefault();
    onSearch({ group });
  }

  return (
    <form className="search-form blood-search-form" onSubmit={submit}>
      <label>Blood Group<select value={group} onChange={e => setGroup(e.target.value)}><option value="">All groups</option>{bloodGroups.map(g => <option key={g}>{g}</option>)}</select></label>
      <button className="btn btn-primary" type="submit"><Search size={17}/> Search Blood</button>
    </form>
  );
}
