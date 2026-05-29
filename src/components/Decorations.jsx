// SVGs decorativos compartilhados pela aplicação.
// São ilustrações leves, geradas inline (sem assets externos).

export function BotanicalSprig({ className = '' }) {
  const leaves = [
    { y: 22,  side: -1 }, { y: 36,  side: 1 },
    { y: 54,  side: -1 }, { y: 68,  side: 1 },
    { y: 86,  side: -1 }, { y: 100, side: 1 },
    { y: 118, side: -1 },
  ]
  return (
    <svg className={className} viewBox="0 0 80 150" fill="none" aria-hidden="true">
      <path d="M40 6 V 144" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      {leaves.map(({ y, side }) => (
        <path
          key={y}
          d={`M 40 ${y} q ${-10 * side} -7 ${-22 * side} -1 q ${14 * side} 6 ${22 * side} 1 z`}
          fill="currentColor"
          fillOpacity="0.32"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

export function Ornament({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 80 14" fill="none" aria-hidden="true">
      <line x1="2" y1="7" x2="28" y2="7"  stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M40 2 L44 7 L40 12 L36 7 Z"  fill="currentColor" stroke="currentColor" strokeWidth="0.7" strokeLinejoin="round" />
      <circle cx="33" cy="7" r="0.9" fill="currentColor" />
      <circle cx="47" cy="7" r="0.9" fill="currentColor" />
      <line x1="52" y1="7" x2="78" y2="7" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function PinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22C12 22 5 15.5 5 10a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m14 14 3 3" />
    </svg>
  )
}

export function PixIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path d="M24 4 L40 20 L24 36 L8 20 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 22 Q14 14 22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M34 22 Q34 14 26 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M14 26 Q14 34 22 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M34 26 Q34 34 26 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

