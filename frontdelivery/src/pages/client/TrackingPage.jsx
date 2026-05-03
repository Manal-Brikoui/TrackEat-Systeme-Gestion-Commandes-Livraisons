import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Package, Clock, Truck, CheckCircle2, ChefHat, Hourglass } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { trackingService } from '../../services/trackingService'
import { websocketService } from '../../services/websocketService'
import MapView from '../../components/map/MapView'
import StatusBadge from '../../components/common/StatusBadge'
import { PageLoader } from '../../components/common/Loader'
import { formatPrice } from '../../utils/formatPrice'
import { formatDateTime } from '../../utils/formatDate'
import { useAuth } from '../../hooks/useAuth'

function isValidCoord(v) { return v != null && !isNaN(Number(v)) && isFinite(v) && Number(v) !== 0 }

const STATUS_STEPS = [
  { key: 'PENDING',   label: 'En attente',     Icon: Hourglass,    desc: 'Votre commande est en attente de confirmation' },
  { key: 'PREPARING', label: 'En préparation', Icon: ChefHat,      desc: 'Le restaurant prépare votre commande' },
  { key: 'PICKED_UP', label: 'En livraison',   Icon: Truck,        desc: 'Votre livreur est en route' },
  { key: 'DELIVERED', label: 'Livrée',         Icon: CheckCircle2, desc: 'Commande bien reçue, bon appétit !' },
]

function getStepIndex(status) {
  const i = STATUS_STEPS.findIndex(s => s.key === status)
  return i === -1 ? 0 : i
}

export default function TrackingPage() {
  const { id }   = useParams()
  const { user } = useAuth()

  const [order,     setOrder]     = useState(null)
  const [driverPos, setDriverPos] = useState(null)
 
  const [destPos,   setDestPos]   = useState(null)
  const [loading,   setLoading]   = useState(true)

  const loadOrder = async () => {
    try {
      const orders = await orderService.getMy()
      const found  = orders.find(o => String(o.id) === String(id))
      setOrder(found || null)

      if (found && isValidCoord(found.deliveryLatitude) && isValidCoord(found.deliveryLongitude)) {
        setDestPos({
          latitude:  Number(found.deliveryLatitude),
          longitude: Number(found.deliveryLongitude),
        })
      }
    } catch (err) {
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrder() }, [id, user])

  const applyDriverLocation = useCallback((loc) => {
    if (!loc) return
    if (isValidCoord(loc.latitude) && isValidCoord(loc.longitude)) {
      setDriverPos({ latitude: Number(loc.latitude), longitude: Number(loc.longitude) })
    }
  }, [])

  useEffect(() => {
    if (!order?.id || order.status !== 'PICKED_UP') return
    trackingService.getLastLocation(order.id).then(applyDriverLocation).catch(console.warn)
    websocketService.connect(user?.id)
    websocketService.subscribeToOrder(order.id, `tracking-${order.id}`, applyDriverLocation)
    return () => websocketService.unsubscribeFromOrder(order.id, `tracking-${order.id}`)
  }, [order?.id, order?.status, user?.id, applyDriverLocation])

  if (loading) return <PageLoader />

  if (!order) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <Package size={40} /> Aucune commande trouvée
    </div>
  )

  const isInDelivery = order.status === 'PICKED_UP'
  const stepIndex    = getStepIndex(order.status)
  const isCancelled  = order.status === 'CANCELLED'

  const destLat = destPos?.latitude  ?? null
  const destLng = destPos?.longitude ?? null

  const liveDriverLat = isInDelivery ? (driverPos?.latitude  ?? null) : null
  const liveDriverLng = isInDelivery ? (driverPos?.longitude ?? null) : null

  const showMap = Boolean(destLat && destLng)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes tp-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tp-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes tp-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes tp-pop     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tp-truck   { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
        @keyframes tp-spin    { to{transform:rotate(360deg)} }

        .tp-root {
          background: #fafaf7; color: #171714; font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h, 0px));
          padding: 0 !important; max-width: 100% !important;
          animation: tp-fadeIn .35s ease both;
        }

        .tp-hero {
          padding: 44px 24px 36px; border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; background: #fafaf7; margin-bottom: 32px;
        }
        .tp-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .tp-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 60% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .tp-hero-inner {
          max-width: 860px; margin: 0 auto; position: relative; z-index: 1;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .tp-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .tp-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: tp-pulse 2s ease-in-out infinite;
        }
        .tp-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.05; color: #171714; margin: 0 0 6px;
        }
        .tp-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: tp-shimmer 3.2s linear infinite;
        }
        .tp-subtitle { font-size: .88rem; color: rgba(23,23,20,.45); font-weight: 300; margin: 0; }

        .tp-order-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 50px;
          border: 1px solid rgba(23,23,20,.1); background: rgba(255,255,255,.8);
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.1rem; color: #171714; flex-shrink: 0;
        }
        .tp-order-badge-dot { color: rgba(23,23,20,.25); }

        .tp-body { max-width: 860px; margin: 0 auto; padding: 0 24px 60px; }

        .tp-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 22px 24px;
          animation: tp-pop .25s ease both;
        }
        .tp-card + .tp-card { margin-top: 14px; }

        .tp-info-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: 12px; margin-bottom: 16px;
        }
        .tp-restaurant {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.4rem; color: #171714; margin: 0 0 3px;
        }
        .tp-meta {
          display: flex; align-items: center; gap: 5px;
          color: rgba(23,23,20,.38); font-size: .8rem; font-weight: 300;
        }
        .tp-divider { border: none; border-top: 1px solid rgba(23,23,20,.07); margin: 16px 0; }
        .tp-address-row {
          display: flex; align-items: center; gap: 7px;
          color: rgba(23,23,20,.55); font-size: .88rem;
        }
        .tp-price {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.2rem; color: #171714;
        }

        .tp-stepper { display: flex; flex-direction: column; gap: 0; }
        .tp-step {
          display: flex; align-items: flex-start; gap: 16px; position: relative;
        }
        .tp-step:not(:last-child)::after {
          content: ''; position: absolute; left: 19px; top: 40px;
          width: 2px; height: calc(100% - 4px);
          background: rgba(23,23,20,.08);
        }
        .tp-step.done::after  { background: rgba(183,234,78,.5); }
        .tp-step.active::after{ background: rgba(183,234,78,.25); }

        .tp-step-icon {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(23,23,20,.1); background: #fafaf7;
          color: rgba(23,23,20,.2); position: relative; z-index: 1;
          transition: all .3s;
        }
        .tp-step.done .tp-step-icon {
          background: rgba(183,234,78,.15); border-color: rgba(183,234,78,.5);
          color: #4a7a00;
        }
        .tp-step.active .tp-step-icon {
          background: #4a7a00; border-color: #4a7a00; color: #fff;
          box-shadow: 0 0 0 4px rgba(183,234,78,.25);
        }
        .tp-step.active .tp-step-icon svg { animation: tp-truck 1s ease-in-out infinite; }

        .tp-step-content { padding: 8px 0 24px; }
        .tp-step-label {
          font-weight: 700; font-size: .9rem; color: rgba(23,23,20,.3);
          margin-bottom: 3px; transition: color .3s;
        }
        .tp-step.done .tp-step-label  { color: #4a7a00; }
        .tp-step.active .tp-step-label { color: #171714; }
        .tp-step-desc { font-size: .82rem; color: rgba(23,23,20,.35); font-weight: 300; }
        .tp-step.active .tp-step-desc  { color: rgba(23,23,20,.55); }

        .tp-map-wrap {
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(23,23,20,.08);
          animation: tp-pop .3s ease both;
        }
        .tp-map-placeholder {
          display: flex; flex-direction: column; align-items: center;
          padding: 52px 24px; text-align: center;
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px;
        }
        .tp-map-placeholder-icon {
          width: 68px; height: 68px; border-radius: 20px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(23,23,20,.22); margin-bottom: 18px;
        }
        .tp-map-placeholder-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.4rem; color: #171714; margin-bottom: 7px;
        }
        .tp-map-placeholder-desc { font-size: .88rem; color: rgba(23,23,20,.38); font-weight: 300; }

        .tp-live {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 50px;
          background: rgba(183,234,78,.12); border: 1px solid rgba(183,234,78,.35);
          font-size: .72rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .06em; text-transform: uppercase;
        }
        .tp-live-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: tp-pulse 1.4s ease-in-out infinite;
        }

        .tp-section-label {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.1rem; color: #171714; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }

        @media (max-width: 640px) {
          .tp-hero { padding: 32px 20px 28px; }
          .tp-body { padding: 0 16px 48px; }
          .tp-card { padding: 18px; }
        }
      `}</style>

      <div className="tp-root">

        <div className="tp-hero">
          <div className="tp-hero-grid" />
          <div className="tp-hero-glow" />
          <div className="tp-hero-inner">
            <div>
              <div className="tp-eyebrow">
                <div className="tp-eyebrow-dot" />
                Suivi en temps réel
              </div>
              <h1 className="tp-title">
                Votre <span className="tp-title-accent">livraison</span>
              </h1>
              <p className="tp-subtitle">
                {isInDelivery
                  ? 'Votre livreur est en route vers vous'
                  : 'Suivez l\'état de votre commande'}
              </p>
            </div>
            <div className="tp-order-badge">
              <span className="tp-order-badge-dot">#</span>
              {order.id}
            </div>
          </div>
        </div>

        <div className="tp-body">

          <div className="tp-card" style={{ marginBottom: 14 }}>
            <div className="tp-info-row">
              <div>
                <p className="tp-restaurant">{order.restaurantName}</p>
                {order.createdAt && (
                  <div className="tp-meta">
                    <Clock size={11} />
                    {formatDateTime(order.createdAt)}
                  </div>
                )}
              </div>
              <StatusBadge status={order.status} />
            </div>
            <hr className="tp-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div className="tp-address-row">
                <MapPin size={14} style={{ color: '#4a7a00', flexShrink: 0 }} />
                {order.deliveryAddress}
              </div>
              <span className="tp-price">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>

  
          {!isCancelled && (
            <div className="tp-card" style={{ marginBottom: 14 }}>
              <div className="tp-section-label">Progression</div>
              <div className="tp-stepper">
                {STATUS_STEPS.map((step, i) => {
                  const cls = i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''
                  return (
                    <div key={step.key} className={`tp-step ${cls}`}>
                      <div className="tp-step-icon">
                        <step.Icon size={17} strokeWidth={1.8} />
                      </div>
                      <div className="tp-step-content">
                        <div className="tp-step-label">{step.label}</div>
                        {i === stepIndex && (
                          <div className="tp-step-desc">{step.desc}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="tp-section-label" style={{ marginTop: 8 }}>
            Carte
            {isInDelivery && (
              <div className="tp-live">
                <div className="tp-live-dot" />
                Live
              </div>
            )}
          </div>

          {showMap ? (
            <div className="tp-map-wrap">
        
              <MapView
                driverLat={liveDriverLat}
                driverLng={liveDriverLng}
                destLat={destLat}
                destLng={destLng}
                height={380}
              />
            </div>
          ) : (
            <div className="tp-map-placeholder">
              <div className="tp-map-placeholder-icon">
                <Package size={30} strokeWidth={1.4} />
              </div>
              <div className="tp-map-placeholder-title">Adresse introuvable</div>
              <div className="tp-map-placeholder-desc">
                Aucune coordonnée de livraison disponible pour cette commande
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}