export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      key={toast.key}
      className={`toast toast-${toast.kind}`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  )
}
