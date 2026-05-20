import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal
    title={title}
    onClose={onCancel}
    footer={(
      <>
        <button className="btn btn-ghost" onClick={onCancel} type="button" disabled={loading}>
          {cancelLabel}
        </button>
        <button className="btn btn-danger" onClick={onConfirm} type="button" disabled={loading}>
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </>
    )}
  >
    <div className="confirm-dialog">
      <div className="confirm-icon">
        <AlertTriangle size={24} />
      </div>
      <div>
        <p>{message}</p>
        <span>This action cannot be undone.</span>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
