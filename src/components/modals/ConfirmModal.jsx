import React from "react";
import { X } from "lucide-react";

export default function ConfirmModal({ title, text, onConfirm, onClose }) {
  return <div className="modal-backdrop">
    <div className="modal">
      <button className="modal-close" onClick={onClose}><X/></button>
      <h3>{title}</h3><p>{text}</p>
      <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onConfirm}>Confirm</button></div>
    </div>
  </div>;
}