import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, children, onClose, footer }) => (
  <div className="modal-backdrop" role="presentation">
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>
      </div>
      <div className="modal-body">
        {children}
      </div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

export default Modal;
