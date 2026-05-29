import { useReveal } from '../hooks/useReveal'

/**
 * Wrapper que aplica fade-in suave quando o conteúdo entra na viewport.
 * Uso: <Reveal><MeuConteudo /></Reveal>
 */
export default function Reveal({ children, delay = 0, threshold = 0.15, as: Tag = 'div', className = '' }) {
  const [ref, revealed] = useReveal({ threshold })
  return (
    <Tag
      ref={ref}
      className={`reveal${revealed ? ' is-revealed' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
