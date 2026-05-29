import { useEffect, useMemo, useState } from 'react'

import { buildProductImage } from './lib/imageBuilder'

import { useGuest } from './hooks/useGuest'
import { useReservations } from './hooks/useReservations'
import { useToast } from './hooks/useToast'
import { useHashRoute } from './hooks/useHashRoute'

import { EventProvider, useEvent } from './components/EventProvider'
import { ProductsProvider, useProducts } from './components/ProductsProvider'
import { MessagesProvider } from './components/MessagesProvider'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stepper from './components/Stepper'
import HomeSection from './components/HomeSection'
import LocationSection from './components/LocationSection'
import AttendanceSection from './components/AttendanceSection'
import GiftsSection from './components/GiftsSection'
import MessagesSection from './components/MessagesSection'
import ProductModal from './components/ProductModal'
import PixSection from './components/PixSection'
import Toast from './components/Toast'
import BackToTop from './components/BackToTop'
import WhatsAppButton from './components/WhatsAppButton'
import AdminPanel from './components/AdminPanel'
import ShareToolbar from './components/ShareToolbar'
import Reveal from './components/Reveal'

export default function App() {
  const hash = useHashRoute()
  const isAdmin = hash.startsWith('#/admin')

  return (
    <EventProvider>
      <ProductsProvider>
        <MessagesProvider>
          {isAdmin ? <AdminPanel /> : <MainApp />}
        </MessagesProvider>
      </ProductsProvider>
    </EventProvider>
  )
}

/**
 * Atualiza document.title quando o nome do casal muda.
 */
function DocumentTitle() {
  const e = useEvent()
  useEffect(() => {
    document.title = `Chá de Cozinha · ${e.couple_name}`
  }, [e.couple_name])
  return null
}

function MainApp() {
  const { guest, confirm } = useGuest()
  const { reservations, loading: loadingReservations, reserve, cancel } = useReservations()
  const { products, loading: loadingProducts } = useProducts()
  const { toast, showToast } = useToast()

  const [activeSection, setActiveSection] = useState('home')
  const [submittingAttendance, setSubmittingAttendance] = useState(false)
  const [actionState, setActionState]     = useState({ productId: null, type: null })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [onlyMineFilter, setOnlyMineFilter]   = useState(false)

  const isLoadingGifts = loadingReservations || loadingProducts

  // ── Volta ao topo instantaneamente ao trocar de seção ──────────────
  // Sem scroll suave — o suave ficava parecendo "quebrado" na transição.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeSection])

  // ── Mantém o produto selecionado em sincronia com o estado ─────────
  const enrichedSelectedProduct = useMemo(() => {
    if (!selectedProduct) return null
    const reservedBy = reservations[selectedProduct.id] ?? null
    const image = selectedProduct.image
      || buildProductImage(selectedProduct.name, selectedProduct.color, selectedProduct.category)
    return { ...selectedProduct, image, reservedBy }
  }, [selectedProduct, reservations])

  const userPhone = guest?.phone
  const userReservationsCount = userPhone
    ? Object.values(reservations).filter((r) => r.phone === userPhone).length
    : 0
  const hasReservation = userReservationsCount > 0

  // ── Navegação ──────────────────────────────────────────────────────
  function handleNav(id) {
    if (id === 'gifts' && !guest) {
      setActiveSection('attendance')
      showToast('Confirme sua presença para acessar a lista de presentes', 'default')
      return
    }
    setActiveSection(id)
  }

  // ── Submissão da confirmação de presença ───────────────────────────
  async function handleAttendanceSubmit(form) {
    setSubmittingAttendance(true)
    const res = await confirm(form)
    setSubmittingAttendance(false)
    if (!res.ok) {
      showToast('Não foi possível confirmar. Tente novamente.', 'error')
      return
    }
    const plural = form.guests === '1' ? 'pessoa' : 'pessoas'
    showToast(
      `Presença confirmada para ${form.guests} ${plural}! Bem-vindo(a), ${form.name.split(' ')[0]}.`,
      'success',
    )
    setActiveSection('gifts')
  }

  // ── Reserva / cancelamento ─────────────────────────────────────────
  async function handleReserve(productId) {
    if (!guest) return { ok: false, reason: 'no-guest' }
    setActionState({ productId, type: 'reserve' })
    const res = await reserve(productId, guest)
    setActionState({ productId: null, type: null })

    if (!res.ok) {
      if (res.reason === 'already-reserved') {
        showToast('Esse presente acabou de ser reservado por outra pessoa', 'error')
      } else {
        showToast('Não foi possível reservar. Tente novamente.', 'error')
      }
      return res
    }
    // Modal continua aberto e transiciona pra tela de agradecimento (com check animado)
    return res
  }

  function handleSeeMyReservations() {
    setSelectedProduct(null)
    setOnlyMineFilter(true)
    setActiveSection('gifts')
  }

  async function handleCancel(productId) {
    setActionState({ productId, type: 'cancel' })
    const res = await cancel(productId, guest)
    setActionState({ productId: null, type: null })

    if (!res.ok) {
      showToast('Não foi possível cancelar. Tente novamente.', 'error')
      return
    }
    showToast('Reserva cancelada com sucesso', 'default')
    setSelectedProduct(null)
  }

  return (
    <div className="app">
      <DocumentTitle />
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNav}
        guest={guest}
        hasReservation={hasReservation}
      />

      <main className="page-shell">
        {activeSection === 'home' && (
          <>
            <Hero />
            <ShareToolbar />
          </>
        )}

        <Reveal>
          <div className="stepper-card">
            <Stepper
              guest={guest}
              reservations={reservations}
              onStepClick={(id) => handleNav(id)}
            />
          </div>
        </Reveal>

        <div className="section-area">
          {activeSection === 'home' && (
            <HomeSection
              guest={guest}
              hasReservation={hasReservation}
              onNavigate={handleNav}
            />
          )}

          {activeSection === 'location' && <LocationSection />}

          {activeSection === 'attendance' && (
            <AttendanceSection
              guest={guest}
              onSubmit={handleAttendanceSubmit}
              submitting={submittingAttendance}
              onGoToGifts={() => handleNav('gifts')}
            />
          )}

          {activeSection === 'gifts' && guest && (
            <GiftsSection
              products={products}
              reservations={reservations}
              guest={guest}
              actionState={actionState}
              onSelectProduct={setSelectedProduct}
              loading={isLoadingGifts}
              onlyMine={onlyMineFilter}
              onChangeOnlyMine={setOnlyMineFilter}
            />
          )}

          {activeSection === 'messages' && (
            <MessagesSection guest={guest} />
          )}
        </div>

        {(activeSection === 'home' || activeSection === 'gifts') && (
          <Reveal>
            <PixSection />
          </Reveal>
        )}
      </main>

      {enrichedSelectedProduct && (
        <ProductModal
          product={enrichedSelectedProduct}
          guest={guest}
          busy={actionState.productId === enrichedSelectedProduct.id}
          onClose={() => setSelectedProduct(null)}
          onReserve={() => handleReserve(enrichedSelectedProduct.id)}
          onCancel={() => handleCancel(enrichedSelectedProduct.id)}
          userReservationsCount={userReservationsCount}
          onSeeMyReservations={handleSeeMyReservations}
        />
      )}

      <BackToTop />
      <WhatsAppButton />
      <Toast toast={toast} />
    </div>
  )
}
