import { useState, useEffect } from 'react'
import { Package, RefreshCw, MapPin, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import OrderCard from '../../components/order/OrderCard'
import { PageLoader } from '../../components/common/Loader'
import toast from 'react-hot-toast'

const FILTERS = [
  { key: 'ALL',       label: 'Toutes',        color: null },
  { key: 'PENDING',   label: 'En attente',    color: '#d97706' },
  { key: 'PREPARING', label: 'En préparation',color: '#2563eb' },
  { key: 'PICKED_UP', label: 'En livraison',  color: '#4a7a00' },
  { key: 'DELIVERED', label: 'Livrées',       color: '#4a7a00' },
  { key: 'CANCELLED', label: 'Annulées',      color: '#dc2626' },
]

export default function OrderHistoryPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')
  const navigate              = useNavigate()

  const load = () => {
    setLoading(true)
    orderService.getMy()
      .then(setOrders)
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return
    try {
      await orderService.cancel(id)
      setOrders(o => o.map(x => x.id === id ? { ...x, status: 'CANCELLED' } : x))
      toast.success('Commande annulée')
    } catch { toast.error("Impossible d'annuler") }
  }

  if (loading) return <PageLoader />

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  const counts = {}
  FILTERS.forEach(f => { counts[f.key] = f.key === 'ALL' ? orders.length : orders.filter(o => o.status === f.key).length })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes oh-fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes oh-shimmer{ from{background-position:0 center} to{background-position:200% center} }
        @keyframes oh-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes oh-pop    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .oh-root {
          background: #fafaf7; color: #171714; font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h));
          padding: 0 !important; max-width: 100% !important;
          animation: oh-fadeIn .35s ease both;
        }

        .oh-hero {
          padding: 44px 24px 36px; border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; background: #fafaf7; margin-bottom: 32px;
        }
        .oh-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .oh-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 60% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .oh-hero-inner {
          max-width: 860px; margin: 0 auto; position: relative; z-index: 1;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .oh-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .oh-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: oh-pulse 2s ease-in-out infinite;
        }
        .oh-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.05; color: #171714; margin: 0 0 6px;
        }
        .oh-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: oh-shimmer 3.2s linear infinite;
        }
        .oh-subtitle { font-size: .88rem; color: rgba(23,23,20,.45); font-weight: 300; margin: 0; }

        .oh-refresh {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(23,23,20,.1); background: rgba(255,255,255,.8);
          color: rgba(23,23,20,.5); font-family: 'Jost', sans-serif;
          font-weight: 600; font-size: .82rem; transition: all .17s; flex-shrink: 0;
        }
        .oh-refresh:hover { border-color: rgba(183,234,78,.5); color: #4a7a00; }

        .oh-body { max-width: 860px; margin: 0 auto; padding: 0 24px 60px; }

        .oh-filters {
          display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 22px;
        }
        .oh-filter {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .8rem; font-weight: 600;
          border: 1px solid rgba(23,23,20,.1); background: #fff;
          color: rgba(23,23,20,.5); transition: all .17s;
        }
        .oh-filter:hover { border-color: rgba(23,23,20,.22); color: #171714; }
        .oh-filter.active { background: #171714; color: #fff; border-color: #171714; }
        .oh-filter-count {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: .95rem; line-height: 1; opacity: .7;
        }
        .oh-filter.active .oh-filter-count { opacity: .6; }

        .oh-list { display: flex; flex-direction: column; gap: 11px; }

        .oh-btn-cancel {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px; border: none; cursor: pointer;
          background: rgba(220,38,38,.08); border: 1px solid rgba(220,38,38,.25);
          color: #dc2626; font-family: 'Jost', sans-serif; font-weight: 600; font-size: .8rem;
          transition: all .16s;
        }
        .oh-btn-cancel:hover { background: rgba(220,38,38,.15); }

        .oh-btn-track {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px; border: none; cursor: pointer;
          background: rgba(183,234,78,.12); border: 1px solid rgba(183,234,78,.4);
          color: #4a7a00; font-family: 'Jost', sans-serif; font-weight: 600; font-size: .8rem;
          transition: all .16s;
        }
        .oh-btn-track:hover { background: rgba(183,234,78,.22); }

        .oh-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 72px 24px; text-align: center;
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; animation: oh-pop .25s ease both;
        }
        .oh-empty-icon {
          width: 68px; height: 68px; border-radius: 20px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(23,23,20,.22); margin-bottom: 18px;
        }
        .oh-empty-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.6rem; color: #171714; margin-bottom: 8px;
        }
        .oh-empty-desc { font-size: .88rem; color: rgba(23,23,20,.38); font-weight: 300; }

        @media (max-width: 640px) {
          .oh-hero { padding: 32px 20px 28px; }
          .oh-body { padding: 0 16px 48px; }
        }
      `}</style>

      <div className="oh-root">

        <div className="oh-hero">
          <div className="oh-hero-grid" />
          <div className="oh-hero-glow" />
          <div className="oh-hero-inner">
            <div>
              <div className="oh-eyebrow">
                <div className="oh-eyebrow-dot" />
                Historique
              </div>
              <h1 className="oh-title">
                Mes <span className="oh-title-accent">commandes</span>
              </h1>
              <p className="oh-subtitle">
                {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <button className="oh-refresh" onClick={load}>
              <RefreshCw size={13} /> Actualiser
            </button>
          </div>
        </div>

        <div className="oh-body">

          <div className="oh-filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`oh-filter ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
                style={filter !== f.key && f.color ? { borderColor: `${f.color}30`, color: f.color, background: `${f.color}08` } : {}}
              >
                {f.label}
                {counts[f.key] > 0 && <span className="oh-filter-count">{counts[f.key]}</span>}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="oh-empty">
              <div className="oh-empty-icon"><Package size={30} strokeWidth={1.4} /></div>
              <div className="oh-empty-title">Aucune commande</div>
              <div className="oh-empty-desc">Vos commandes apparaîtront ici</div>
            </div>
          ) : (
            <div className="oh-list">
              {filtered.map(o => (
                <OrderCard
                  key={o.id}
                  order={o}
                  actions={
                    <>
                      {['PENDING', 'ACCEPTED'].includes(o.status) && (
                        <button className="oh-btn-cancel" onClick={() => cancel(o.id)}>
                          <XCircle size={13} /> Annuler
                        </button>
                      )}
                      {o.status === 'PICKED_UP' && (
                        <button className="oh-btn-track" onClick={() => navigate(`/track/${o.id}`)}>
                          <MapPin size={13} /> Suivre la livraison
                        </button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}