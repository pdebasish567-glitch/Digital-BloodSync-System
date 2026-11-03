import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === "success" ? <CheckCircle2 size={19}/> : <XCircle size={19}/>}
      <span>{message}</span>
      <button onClick={onClose}><X size={16}/></button>
    </div>
  );
}