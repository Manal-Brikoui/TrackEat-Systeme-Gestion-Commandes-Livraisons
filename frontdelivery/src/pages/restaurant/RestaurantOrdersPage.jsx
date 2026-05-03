import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { restaurantService } from '../../services/restaurantService'
import { orderService } from '../../services/orderService'
import { driverService } from '../../services/driverService'
import { websocketService } from '../../services/websocketService'
import {
  ShoppingBag, RefreshCw, Filter, Truck,
  CheckCircle, ChevronDown, ChevronUp, Trash2,
  MapPin, CreditCard, Package,
} from 'lucide-react'
import toast from 'react-hot-toast'


const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

@keyframes ro-in    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes ro-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
@keyframes ro-spin  { to { transform: rotate(360deg) } }

.ro-root * { font-family: 'Jost', sans-serif; box-sizing: border-box; }

.ro-root {
  min-height: 100vh;
  background: #fafaf7;
  padding: 32px 16px 60px;
  animation: ro-in .3s ease both;
}

.ro-header {
  max-width: 860px; margin: 0 auto 32px;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.ro-brand-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.ro-brand-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #b7ea4e;
  animation: ro-pulse 2s ease-in-out infinite;
}
.ro-brand-lbl { color: #4a7a00; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.ro-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800; font-size: clamp(1.5rem,3vw,2rem);
  color: #171714; margin: 0 0 4px; line-height: 1.1;
}
.ro-subtitle { color: rgba(23,23,20,.45); margin: 0; font-size: .88rem; }

.ro-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px;
  font-family: 'Jost', sans-serif; font-weight: 700; font-size: .83rem;
  cursor: pointer; border: none; transition: all .17s; white-space: nowrap;
}
.ro-btn-ghost {
  background: #fff; border: 1px solid rgba(23,23,20,.1);
  color: rgba(23,23,20,.5);
}
.ro-btn-ghost:hover { border-color: rgba(23,23,20,.22); color: #171714; }

.ro-inner { max-width: 860px; margin: 0 auto; }

.ro-filters {
  display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; align-items: center;
}
.ro-filter-btn {
  padding: 6px 14px; border-radius: 20px;
  font-family: 'Jost', sans-serif; font-weight: 600; font-size: .82rem;
  cursor: pointer; transition: all .17s; border: 1px solid rgba(23,23,20,.1);
  background: #fff; color: rgba(23,23,20,.5);
}
.ro-filter-btn:hover { border-color: rgba(183,234,78,.35); color: #171714; }
.ro-filter-btn.active { background: #4a7a00; color: #f2f8e6; border-color: #4a7a00; }

.ro-card {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-left-width: 3px; border-radius: 14px; overflow: hidden;
  transition: box-shadow .2s;
  animation: ro-in .25s ease both;
}
.ro-card:hover { box-shadow: 0 4px 20px rgba(23,23,20,.07); }

.ro-card-header {
  padding: 16px 20px; display: flex; align-items: center;
  gap: 12px; cursor: pointer; flex-wrap: wrap;
}
.ro-order-id { color: #171714; font-weight: 700; font-size: .95rem; margin-bottom: 3px; }
.ro-order-sub { color: rgba(23,23,20,.45); font-size: .82rem; }

.ro-status {
  padding: 4px 13px; border-radius: 20px;
  font-size: .76rem; font-weight: 700; white-space: nowrap;
}

.ro-btn-delete {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; border: 1px solid rgba(239,68,68,.22);
  background: rgba(239,68,68,.07);
}
.ro-btn-delete:hover { background: rgba(239,68,68,.14); border-color: rgba(239,68,68,.4); }
.ro-btn-delete:disabled { opacity: .45; cursor: not-allowed; }

.ro-card-body {
  border-top: 1px solid rgba(23,23,20,.07);
  padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;
}

.ro-items-lbl {
  color: rgba(23,23,20,.4); font-size: .7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px;
}
.ro-item-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; border-bottom: 1px solid rgba(23,23,20,.06);
  font-size: .88rem;
}
.ro-item-name { color: #171714; font-weight: 500; }
.ro-item-price { color: #4a7a00; font-weight: 700; }

.ro-info-row {
  display: flex; align-items: center; gap: 6px;
  color: rgba(23,23,20,.45); font-size: .85rem;
}
.ro-info-row span { color: #171714; font-weight: 500; }

.ro-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ro-btn-next {
  padding: 9px 18px; background: #b7ea4e; color: #0f2a00;
  border: none; border-radius: 8px; font-weight: 700;
  font-family: 'Jost', sans-serif; cursor: pointer; font-size: .86rem;
  transition: all .17s;
}
.ro-btn-next:hover { background: #a8d843; }
.ro-btn-next:disabled { opacity: .5; cursor: not-allowed; }
.ro-btn-delete-full {
  padding: 9px 18px; background: rgba(239,68,68,.07);
  color: #ef4444; border: 1px solid rgba(239,68,68,.22);
  border-radius: 8px; font-weight: 700; font-family: 'Jost', sans-serif;
  cursor: pointer; font-size: .86rem; display: flex; align-items: center; gap: 6px;
  transition: all .17s;
}
.ro-btn-delete-full:hover { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.4); }
.ro-btn-delete-full:disabled { opacity: .5; cursor: not-allowed; }

.ro-assign-row {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  padding: 12px 14px; background: rgba(96,165,250,.06);
  border: 1px solid rgba(96,165,250,.2); border-radius: 10px;
}
.ro-driver-select {
  flex: 1; min-width: 160px; padding: 9px 12px;
  background: #fff; border: 1px solid rgba(23,23,20,.1);
  border-radius: 8px; color: #171714; font-size: .86rem;
  font-family: 'Jost', sans-serif; cursor: pointer;
}
.ro-btn-assign {
  padding: 9px 16px; background: rgba(96,165,250,.12);
  color: #2563eb; border: 1px solid rgba(96,165,250,.3);
  border-radius: 8px; font-weight: 700; font-family: 'Jost', sans-serif;
  cursor: pointer; font-size: .86rem; white-space: nowrap;
  display: flex; align-items: center; gap: 6px; transition: all .17s;
}
.ro-btn-assign:hover { background: rgba(96,165,250,.2); }
.ro-driver-assigned {
  padding: 7px 11px; background: rgba(74,222,128,.08);
  color: #16a34a; border-radius: 7px; font-size: .82rem; font-weight: 700;
  display: flex; align-items: center; gap: 5px;
}

.ro-empty {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px; padding: 48px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
}
.ro-empty-icon {
  width: 56px; height: 56px; border-radius: 16px;
  background: #f2f4ed; border: 1px solid rgba(23,23,20,.07);
  display: flex; align-items: center; justify-content: center;
  color: rgba(23,23,20,.2); margin-bottom: 4px;
}

.ro-loading {
  min-height: 100vh; background: #fafaf7;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  color: rgba(23,23,20,.4); font-size: .9rem; font-family: 'Jost', sans-serif;
}
.ro-spin { animation: ro-spin .9s linear infinite; }

.ro-list { display: flex; flex-direction: column; gap: 10px; }
`

const STATUS_CONFIG = {
  PENDING:   { color: '#fbbf24', label: 'En attente' },
  CONFIRMED: { color: '#b7ea4e', label: 'Confirmé' },
  PREPARING: { color: '#60a5fa', label: 'En préparation' },
  READY:     { color: '#a78bfa', label: 'Prêt' },
  PICKED_UP: { color: '#fb923c', label: 'En livraison' },
  DELIVERED: { color: 'rgba(23,23,20,.35)', label: 'Livré' },
  CANCELLED: { color: '#ef4444', label: 'Annulé' },
}

const NEXT_STATUS = { PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY' }
const NEXT_LABEL  = { PENDING: 'Confirmer', CONFIRMED: 'Mettre en préparation', PREPARING: 'Marquer prêt' }
const DELETABLE   = ['DELIVERED', 'CANCELLED']
const FILTERS     = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED']

function resolveDriverName(driver) {
  if (!driver) return null
  if (typeof driver === 'string') return driver
  if (driver.user) {
    const u = driver.user
    const name = (u.firstName && u.lastName)
      ? `${u.firstName} ${u.lastName}`.trim()
      : u.fullName || u.full_name || u.name || u.username || u.email
    if (name) return name
  }
  return (
    driver.fullName ||
    driver.full_name ||
    (driver.firstName && driver.lastName
      ? `${driver.firstName} ${driver.lastName}`.trim()
      : null) ||
    driver.name ||
    driver.username ||
    driver.email ||
    `Driver #${driver.id}`
  )
}

function getOrderDriverName(order, driversMap) {
  if (order.driverName) return order.driverName
  if (order.driver) return resolveDriverName(order.driver)
  if (order.driverId && driversMap[order.driverId]) {
    return resolveDriverName(driversMap[order.driverId])
  }
  return null
}

function OrderCard({ order, drivers, driversMap, onUpdateStatus, onAssignDriver, onDelete }) {
  const [expanded, setExpanded]     = useState(false)
  const [loadingStatus, setLS]      = useState(false)
  const [loadingDelete, setLD]      = useState(false)
  const [selectedDriver, setSelDrv] = useState('')

  const cfg       = STATUS_CONFIG[order.status] || { color: 'rgba(23,23,20,.35)', label: order.status }
  const canDelete = DELETABLE.includes(order.status)
  const driverName = getOrderDriverName(order, driversMap)

  const handleNextStatus = async () => {
    setLS(true)
    try { await onUpdateStatus(order.id, NEXT_STATUS[order.status]) }
    finally { setLS(false) }
  }

  const handleAssign = async () => {
    if (!selectedDriver) return toast.error('Choisissez un driver')
    await onAssignDriver(order.id, Number(selectedDriver))
    setSelDrv('')
  }

  const handleDelete = async (e) => {
    e?.stopPropagation?.()
    if (!window.confirm(`Supprimer définitivement la commande #${order.id} ?`)) return
    setLD(true)
    try { await onDelete(order.id) }
    finally { setLD(false) }
  }

  return (
    <div className="ro-card" style={{ borderLeftColor: cfg.color }}>

      <div className="ro-card-header" onClick={() => setExpanded(e => !e)}>
        <ShoppingBag size={17} color={cfg.color} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="ro-order-id">Commande #{order.id}</div>
          <div className="ro-order-sub">
            {order.clientName && <>{order.clientName} · </>}
            {order.items?.length ?? 0} article(s) —{' '}
            <span style={{ color: '#4a7a00', fontWeight: 700 }}>
              {order.totalPrice?.toFixed(2) ?? '0.00'} MAD
            </span>
          </div>
        </div>

        <span className="ro-status" style={{ background: cfg.color + '18', color: cfg.color }}>
          {cfg.label}
        </span>

        {canDelete && (
          <button
            className="ro-btn-delete"
            onClick={handleDelete}
            disabled={loadingDelete}
            title="Supprimer cette commande"
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        )}

        {expanded
          ? <ChevronUp size={16} color="rgba(23,23,20,.35)" />
          : <ChevronDown size={16} color="rgba(23,23,20,.35)" />
        }
      </div>

      {expanded && (
        <div className="ro-card-body">

          {order.items?.length > 0 && (
            <div>
              <div className="ro-items-lbl">Articles</div>
              {order.items.map((item, i) => (
                <div key={i} className="ro-item-row">
                  <span className="ro-item-name">
                    {item.productName || `Produit #${item.productId}`} × {item.quantity}
                  </span>
                  <span className="ro-item-price">
                    {((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)} MAD
                  </span>
                </div>
              ))}
            </div>
          )}

          {order.deliveryAddress && (
            <div className="ro-info-row">
              <MapPin size={13} color="#4a7a00" />
              Livraison : <span>{order.deliveryAddress}</span>
            </div>
          )}

          {order.paymentMethod && (
            <div className="ro-info-row">
              <CreditCard size={13} color="#4a7a00" />
              Paiement : <span>{order.paymentMethod}</span>
            </div>
          )}

          <div className="ro-actions">
            {NEXT_STATUS[order.status] && (
              <button className="ro-btn-next" onClick={handleNextStatus} disabled={loadingStatus}>
                {loadingStatus ? '...' : NEXT_LABEL[order.status]}
              </button>
            )}
            {canDelete && (
              <button className="ro-btn-delete-full" onClick={handleDelete} disabled={loadingDelete}>
                <Trash2 size={14} />
                {loadingDelete ? 'Suppression...' : 'Supprimer'}
              </button>
            )}
          </div>

          {order.status === 'READY' && !driverName && drivers.length > 0 && (
            <div className="ro-assign-row">
              <Truck size={15} color="#2563eb" style={{ flexShrink: 0 }} />
              <select
                className="ro-driver-select"
                value={selectedDriver}
                onChange={e => setSelDrv(e.target.value)}
              >
                <option value="">Choisir un driver...</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {resolveDriverName(d)}
                  </option>
                ))}
              </select>
              <button className="ro-btn-assign" onClick={handleAssign}>
                <Truck size={13} />
                Assigner
              </button>
            </div>
          )}

          {driverName && (
            <div className="ro-driver-assigned">
              <CheckCircle size={13} />
              {driverName} assigné
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default function RestaurantOrdersPage() {
  const { user }  = useAuthStore()
  const [orders, setOrders]   = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  const driversMap = Object.fromEntries(drivers.map(d => [d.id, d]))

  const load = useCallback(async () => {
    try {
      const [resto, availDrivers] = await Promise.all([
        restaurantService.getMy(),
        driverService.getAvailable(),
      ])
      setDrivers(availDrivers)
      const data = await orderService.getByRestaurant(resto.id)
      setOrders(data.sort((a, b) => b.id - a.id))
    } catch {
      toast.error('Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (user?.id) {
      websocketService.connect(user.id)
      websocketService.subscribe('orders-page', (data) => {
        if (['NEW_ORDER', 'ORDER_UPDATE'].includes(data.type)) load()
      })
    }
    return () => websocketService.unsubscribe('orders-page')
  }, [load, user])

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await orderService.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      toast.success(`Commande #${id} — ${STATUS_CONFIG[status]?.label || status}`)
    } catch {
      toast.error('Erreur de mise à jour du statut')
    }
  }

  const handleAssignDriver = async (orderId, driverId) => {
    try {
      const updated = await orderService.assignDriver(orderId, driverId)

      const enriched = {
        ...updated,
        driverName: driversMap[driverId]?.fullName || updated.driverName || `Driver #${driverId}`,
      }

      setOrders(prev => prev.map(o => o.id === orderId ? enriched : o))
      toast.success(`Driver ${enriched.driverName} assigné`)
    } catch {
      toast.error("Erreur lors de l'assignation")
    }
  }

  const handleDelete = async (id) => {
    try {
      await orderService.deleteOrder(id)
      setOrders(prev => prev.filter(o => o.id !== id))
      toast.success(`Commande #${id} supprimée`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="ro-loading">
        <RefreshCw size={22} color="#4a7a00" className="ro-spin" />
        <span>Chargement des commandes...</span>
      </div>
    </>
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="ro-root">

        <div className="ro-header">
          <div>
            <div className="ro-brand-row">
              <div className="ro-brand-dot" />
              <span className="ro-brand-lbl">Gestion des commandes</span>
            </div>
            <h1 className="ro-title">Commandes</h1>
            <p className="ro-subtitle">{orders.length} commande(s) au total</p>
          </div>
          <button className="ro-btn ro-btn-ghost" onClick={load}>
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>

        <div className="ro-inner">

          <div className="ro-filters">
            <Filter size={14} color="rgba(23,23,20,.35)" />
            {FILTERS.map(f => {
              const cfg   = STATUS_CONFIG[f]
              const count = orders.filter(o => o.status === f).length
              const isAll = f === 'ALL'
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`ro-filter-btn${filter === f ? ' active' : ''}`}
                  style={filter === f && !isAll ? {
                    background: cfg?.color,
                    borderColor: cfg?.color,
                    color: ['#b7ea4e', '#fbbf24'].includes(cfg?.color) ? '#0f2a00' : '#fff',
                  } : {}}
                >
                  {isAll ? 'Toutes' : (cfg?.label || f)}
                  {!isAll && count > 0 && (
                    <span style={{ marginLeft: 5, opacity: .7 }}>({count})</span>
                  )}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="ro-empty">
              <div className="ro-empty-icon"><Package size={24} /></div>
              <p style={{ fontWeight: 700, color: '#171714', margin: 0 }}>Aucune commande dans cette catégorie</p>
              <p style={{ color: 'rgba(23,23,20,.4)', fontSize: '.85rem', margin: 0 }}>Les commandes apparaîtront ici</p>
            </div>
          ) : (
            <div className="ro-list">
              {filtered.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  drivers={drivers}
                  driversMap={driversMap}
                  onUpdateStatus={handleUpdateStatus}
                  onAssignDriver={handleAssignDriver}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}