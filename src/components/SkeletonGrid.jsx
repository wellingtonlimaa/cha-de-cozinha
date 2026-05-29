/**
 * Mostra cards "fantasma" enquanto a lista de presentes carrega do Supabase.
 */
export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="product-grid skeleton-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" aria-hidden="true">
          <div className="skeleton-img" />
          <div className="skeleton-info">
            <div className="skeleton-line w-30" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-50" />
            <div className="skeleton-pill" />
          </div>
        </div>
      ))}
    </div>
  )
}
