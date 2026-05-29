import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Em produção, plugue aqui um Sentry / serviço de log.
    if (typeof console !== 'undefined') {
      console.error('App error:', error, info)
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-fallback">
          <div className="error-card">
            <h1>Algo deu errado</h1>
            <p>
              Tivemos um problema ao carregar a página. Tente recarregar — se o
              problema persistir, entre em contato com o organizador.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
