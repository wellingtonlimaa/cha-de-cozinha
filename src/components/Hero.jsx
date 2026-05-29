import { useEvent } from './EventProvider'
import { BotanicalSprig, PinIcon } from './Decorations'
import Countdown from './Countdown'

/**
 * Hero "puro" — recebe os dados do evento como prop. Usado para o preview
 * ao vivo no painel admin (com dados ainda não salvos no banco).
 */
export function HeroView({ event, preview = false }) {
  const e = event
  const mapsUrl = e.maps_link || `https://maps.google.com/?q=${encodeURIComponent(e.address ?? '')}`

  return (
    <header className={`hero${preview ? ' hero-preview' : ''}`}>
      <div className="hero-card">
        <BotanicalSprig className="hero-sprig hero-sprig-tl" />
        <BotanicalSprig className="hero-sprig hero-sprig-br" />

        <span className="hero-tag">Chá de Cozinha</span>

        <div className="hero-grid">
          <div className="hero-date">
            {e.couple_photo_url ? (
              <div className="hero-photo">
                <img src={e.couple_photo_url} alt={e.couple_name} loading="lazy" />
              </div>
            ) : (
              <div className="hero-photo hero-photo-placeholder" aria-hidden="true">
                <span>{e.couple_monogram}</span>
              </div>
            )}

            <span className="hero-date-month">{e.month_label}</span>
            <strong className="hero-date-num">{e.day_number}</strong>
            <span className="hero-date-year">{e.year_label}</span>
            <div className="hero-date-time">
              <span>{e.day_label}</span>
              <span className="hero-date-time-dot" aria-hidden="true" />
              <span>{e.time_label}</span>
            </div>
          </div>

          <div className="hero-content">
            <p className="hero-pre">com carinho, convidamos você</p>
            <h1 className="hero-title">{e.couple_name}</h1>
            <p className="hero-message">{e.message}</p>
            <Countdown event={e} />
            {preview ? (
              <span className="hero-address">
                <PinIcon className="hero-address-icon" />
                <span>{e.address}</span>
              </span>
            ) : (
              <a className="hero-address" href={mapsUrl} target="_blank" rel="noreferrer">
                <PinIcon className="hero-address-icon" />
                <span>{e.address}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Hero "container" — pega os dados do contexto e renderiza o HeroView.
 */
export default function Hero() {
  const e = useEvent()
  return <HeroView event={e} />
}
