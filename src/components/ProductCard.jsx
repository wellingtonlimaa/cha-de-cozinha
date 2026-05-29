function firstName(fullName) {
  return String(fullName ?? '').trim().split(/\s+/)[0] || '?'
}

export default function ProductCard({ product, busy, onClick, guest }) {
  const reserved   = Boolean(product.reservedBy)
  const reservedBy = product.reservedBy
  const isMine     = reserved && guest && reservedBy.phone === guest.phone

  return (
    <button
      type="button"
      className={`product-card${reserved ? ' reserved' : ''}${isMine ? ' is-mine' : ''}`}
      onClick={onClick}
      disabled={busy}
      aria-label={`${product.name} — ${
        isMine ? 'sua reserva' : reserved ? `reservado por ${firstName(reservedBy.personName)}` : 'disponível'
      }`}
    >
      <div className="product-img-wrap">
        <img src={product.image} alt="" className="product-img" loading="lazy" />
        {reserved && (
          <span className={`product-img-overlay${isMine ? ' is-mine' : ''}`} aria-hidden="true">
            {isMine ? '⭐ Você' : 'Reservado'}
          </span>
        )}
      </div>
      <div className="product-info">
        <span className="product-cat">{product.category}</span>
        <strong className="product-name">{product.name}</strong>
        <span className="product-color">{product.color}</span>

        {isMine ? (
          <span className="product-badge mine">⭐ Sua reserva</span>
        ) : reserved ? (
          <span className="product-badge unavailable">
            Reservado por {firstName(reservedBy.personName)}
          </span>
        ) : (
          <span className="product-badge available">Disponível</span>
        )}
      </div>
      {busy && (
        <div className="product-loading" aria-hidden="true">
          <span className="spinner" />
        </div>
      )}
    </button>
  )
}
