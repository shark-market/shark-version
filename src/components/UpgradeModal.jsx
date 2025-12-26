export default function UpgradeModal({
  open,
  title,
  subtitle,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>{title}</h3>
        <p className="muted">{subtitle}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className="btn btn-dark" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
