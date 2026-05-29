import { PinIcon } from './Decorations'
import { useEvent } from './EventProvider'

export default function LocationSection() {
  const e = useEvent()
  const mapsUrl = e.maps_link || `https://maps.google.com/?q=${encodeURIComponent(e.address)}`

  return (
    <section className="content-section">
      <div className="section-head">
        <p className="kicker">Como chegar</p>
        <h2>Local do evento</h2>
        <p className="section-desc">
          O evento acontecerá no endereço abaixo. Toque para abrir o local no seu mapa.
        </p>
      </div>

      <div className="location-body">
        <div className="location-address-card">
          <div className="location-address-icon" aria-hidden="true">
            <PinIcon />
          </div>
          <div>
            <p className="location-address-text">{e.address}</p>
            <a
              className="btn-primary btn-block"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no Google Maps
            </a>
          </div>
        </div>

        <ul className="location-tips">
          <li>
            <strong>Horário</strong>
            <span>{e.day_label}, {e.time_label}</span>
          </li>
          <li>
            <strong>Data</strong>
            <span>{e.day_number} de {e.month_label} de {e.year_label}</span>
          </li>
          <li>
            <strong>Dica</strong>
            <span>Confira o trânsito no dia para chegar com tranquilidade.</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
