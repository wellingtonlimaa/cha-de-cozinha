import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '../lib/constants'
import { MenuIcon, CloseIcon } from './Decorations'
import { useEvent } from './EventProvider'

export default function Navbar({ activeSection, onNavigate, guest, hasReservation }) {
  const e = useEvent()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  function go(id) {
    setMenuOpen(false)
    onNavigate(id)
  }

  return (
    <>
      <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="navbar-inner">
          <button type="button" className="navbar-brand" onClick={() => go('home')} aria-label="Início">
            <span className="navbar-mono" aria-hidden="true">{e.couple_monogram}</span>
            <span className="navbar-name">{e.couple_name}</span>
          </button>

          <nav className="navbar-nav" aria-label="Navegação principal">
            {NAV_ITEMS.map((it) => {
              const locked   = it.id === 'gifts' && !guest
              const isActive = activeSection === it.id
              const showCheck =
                (it.id === 'attendance' && guest) ||
                (it.id === 'gifts' && hasReservation)
              return (
                <button
                  key={it.id}
                  type="button"
                  className={`navbar-link${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                  onClick={() => go(it.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{it.label}</span>
                  {showCheck && <span className="navbar-link-dot" aria-hidden="true" />}
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            className="navbar-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!menuOpen}>
        <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
        <aside className="mobile-menu-panel">
          <div className="mobile-menu-head">
            <span className="mobile-menu-title">{e.couple_name}</span>
            <button type="button" className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              <CloseIcon />
            </button>
          </div>
          <nav className="mobile-menu-list">
            {NAV_ITEMS.map((it) => {
              const locked   = it.id === 'gifts' && !guest
              const isActive = activeSection === it.id
              return (
                <button
                  key={it.id}
                  type="button"
                  className={`mobile-menu-item${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                  onClick={() => go(it.id)}
                >
                  {it.label}
                </button>
              )
            })}
          </nav>
        </aside>
      </div>
    </>
  )
}
