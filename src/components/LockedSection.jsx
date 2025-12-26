export default function LockedSection({
  title,
  isLocked,
  actionLabel,
  onAction,
  message,
  children,
}) {
  return (
    <section className={`details-card ${isLocked ? "locked" : ""}`}>
      <div className="locked-content">
        <h3>{title}</h3>
        {children}
      </div>
      {isLocked ? (
        <div className="locked-overlay">
          {message ? <p className="muted">{message}</p> : null}
          {actionLabel ? (
            <button className="btn btn-dark" type="button" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
