import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../../services/restaurantService'
import { orderService } from '../../services/orderService'
import { driverService } from '../../services/driverService'
import { websocketService } from '../../services/websocketService'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, ShoppingBag, Users, Clock,
  TrendingUp, Power, ChevronRight, RefreshCw,
  Truck, CheckCircle, XCircle, AlertCircle, Package,
  MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'


const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

@keyframes rd-in    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes rd-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
@keyframes rd-spin  { to { transform: rotate(360deg) } }

.rd-root * { font-family: 'Jost', sans-serif; box-sizing: border-box; }

.rd-root {
  min-height: 100vh;
  background: #fafaf7;
  padding: 32px 16px 60px;
  animation: rd-in .3s ease both;
}

.rd-header {
  max-width: 1100px; margin: 0 auto 32px;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.rd-brand-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.rd-brand-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #b7ea4e;
  animation: rd-pulse 2s ease-in-out infinite;
}
.rd-brand-lbl { color: #4a7a00; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.rd-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800; font-size: clamp(1.5rem,3vw,2rem);
  color: #171714; margin: 0 0 4px; line-height: 1.1;
}
.rd-addr { color: rgba(23,23,20,.45); margin: 0; font-size: .88rem; }

.rd-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rd-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px;
  font-family: 'Jost', sans-serif; font-weight: 700; font-size: .83rem;
  cursor: pointer; border: none; transition: all .17s; white-space: nowrap;
}
.rd-btn-accent  { background: #b7ea4e; color: #0f2a00; }
.rd-btn-accent:hover { background: #a8d843; }
.rd-btn-open    { background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.3); color: #4a7a00; }
.rd-btn-open:hover { background: rgba(183,234,78,.18); }
.rd-btn-closed  { background: rgba(23,23,20,.05); border: 1px solid rgba(23,23,20,.1); color: rgba(23,23,20,.45); }
.rd-btn-closed:hover { border-color: rgba(23,23,20,.2); color: #171714; }

.rd-inner { max-width: 1100px; margin: 0 auto; }

.rd-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px; margin-bottom: 32px;
}
.rd-stat {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px; padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
}
.rd-stat-icon {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rd-stat-label {
  color: rgba(23,23,20,.4); font-size: .72rem;
  font-weight: 700; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 3px;
}
.rd-stat-value { color: #171714; font-size: 1.55rem; font-weight: 700; line-height: 1.1; }

.rd-grid {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 24px; align-items: start;
}
@media (max-width: 820px) {
  .rd-grid { grid-template-columns: 1fr; }
}

.rd-section-title {
  color: #171714; font-size: 1rem; font-weight: 700;
  margin: 0 0 16px; display: flex; align-items: center; gap: 8px;
}

.rd-card {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px; overflow: hidden;
}
.rd-card-header {
  padding: 13px 18px; border-bottom: 1px solid rgba(23,23,20,.06);
  display: flex; align-items: center; justify-content: space-between;
}
.rd-card-title { display: flex; align-items: center; gap: 8px; color: #171714; font-weight: 700; font-size: .9rem; }
.rd-card-badge {
  padding: 2px 8px; border-radius: 20px;
  font-size: .72rem; font-weight: 700;
}
.rd-card-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }

.rd-order {
  background: #fafaf7; border-radius: 12px;
  border: 1px solid rgba(23,23,20,.07);
  border-left-width: 3px;
  padding: 14px 18px;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  transition: border-color .15s;
}
.rd-order:hover { border-color: rgba(183,234,78,.35); }
.rd-order-id { color: #171714; font-weight: 700; font-size: .9rem; margin-bottom: 3px; }
.rd-order-sub { color: rgba(23,23,20,.5); font-size: .82rem; }
.rd-order-addr { color: rgba(23,23,20,.45); font-size: .78rem; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
.rd-status-badge {
  padding: 4px 12px; border-radius: 20px;
  font-size: .76rem; font-weight: 700; white-space: nowrap;
}
.rd-order-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.rd-btn-next {
  padding: 7px 13px; background: #b7ea4e; color: #0f2a00;
  border: none; border-radius: 7px; font-weight: 700;
  font-family: 'Jost', sans-serif; cursor: pointer; font-size: .81rem; transition: all .17s;
}
.rd-btn-next:hover { background: #a8d843; }
.rd-btn-next:disabled { opacity: .5; cursor: not-allowed; }

.rd-empty {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 12px; padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
}
.rd-empty-icon {
  width: 56px; height: 56px; border-radius: 16px;
  background: #f2f4ed; border: 1px solid rgba(23,23,20,.07);
  display: flex; align-items: center; justify-content: center;
  color: rgba(23,23,20,.2); margin-bottom: 4px;
}

.rd-driver-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: #fafaf7;
  border-radius: 9px; border: 1px solid rgba(23,23,20,.06);
}
.rd-driver-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .8rem;
}
.rd-driver-name { color: #171714; font-weight: 600; font-size: .88rem; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rd-online { display: flex; align-items: center; gap: 4px; }
.rd-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: rd-pulse 2s ease-in-out infinite; }
.rd-online-lbl { color: #4ade80; font-size: .72rem; font-weight: 600; }

.rd-product-row { display: flex; align-items: center; gap: 10px; }
.rd-product-img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; flex-shrink: 0; }
.rd-product-ph {
  width: 36px; height: 36px; border-radius: 7px;
  background: #f2f4ed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rd-product-name { color: #171714; font-size: .84rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rd-product-cat  { color: rgba(23,23,20,.4); font-size: .72rem; }
.rd-product-price { color: #4a7a00; font-weight: 700; font-size: .84rem; flex-shrink: 0; margin-left: auto; white-space: nowrap; }

.rd-nav-btn {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
  border: 1px solid rgba(23,23,20,.08); border-radius: 10px;
  color: rgba(23,23,20,.5); cursor: pointer; font-size: .88rem;
  font-family: 'Jost', sans-serif; transition: all .17s;
}
.rd-nav-btn:hover { border-color: rgba(183,234,78,.35); color: #171714; background: rgba(183,234,78,.04); }

.rd-loading {
  min-height: 100vh; background: #fafaf7;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  color: rgba(23,23,20,.4); font-size: .9rem;
}
.rd-no-resto {
  min-height: 100vh; background: #fafaf7;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}

.rd-spin { animation: rd-spin .9s linear infinite; }
`

const STATUS_COLORS = {
  PENDING:   '#fbbf24',
  CONFIRMED: '#b7ea4e',
  PREPARING: '#60a5fa',
  READY:     '#a78bfa',
  PICKED_UP: '#fb923c',
  DELIVERED: 'rgba(23,23,20,.35)',
  CANCELLED: '#ef4444',
}
const STATUS_LABELS = {
  PENDING:   'En attente',
  CONFIRMED: 'Confirmé',
  PREPARING: 'En préparation',
  READY:     'Prêt',
  PICKED_UP: 'En livraison',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé',
}

function StatCard({ icon: Icon, label, value, color = '#4a7a00', bg = 'rgba(183,234,78,.1)', border = 'rgba(183,234,78,.25)' }) {
  return (
    <div className="rd-stat">
      <div className="rd-stat-icon" style={{ background: bg, border: `1px solid ${border}` }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div className="rd-stat-label">{label}</div>
        <div className="rd-stat-value">{value != null ? value : '—'}</div>
      </div>
    </div>
  )
}

function OrderRow({ order, onUpdateStatus }) {
  const [loading, setLoading] = useState(false)

  const next = { PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY' }
  const nextLabel = { PENDING: 'Confirmer', CONFIRMED: 'En préparation', PREPARING: 'Prêt à livrer' }
  const statusColor = STATUS_COLORS[order.status] || 'rgba(23,23,20,.3)'

  const handleNext = async () => {
    setLoading(true)
    try { await onUpdateStatus(order.id, next[order.status]) }
    finally { setLoading(false) }
  }

  return (
    <div className="rd-order" style={{ borderLeftColor: statusColor }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div className="rd-order-id">Commande #{order.id}</div>
        <div className="rd-order-sub">
          {order.items != null ? order.items.length : 0} article(s) —{' '}
          <span style={{ color: '#4a7a00', fontWeight: 600 }}>
            {order.totalPrice != null ? order.totalPrice.toFixed(2) : '0.00'} MAD
          </span>
        </div>
        {order.deliveryAddress && (
          <div className="rd-order-addr">
            <MapPin size={10} color="#4a7a00" />{order.deliveryAddress}
          </div>
        )}
      </div>

      <span className="rd-status-badge" style={{
        background: statusColor + '18',
        color: statusColor,
      }}>
        {STATUS_LABELS[order.status] || order.status}
      </span>

      <div className="rd-order-actions">
        {next[order.status] && (
          <button onClick={handleNext} disabled={loading} className="rd-btn-next">
            {loading ? '...' : nextLabel[order.status]}
          </button>
        )}
      </div>
    </div>
  )
}


function MenuPreview({ restaurantId, onManage }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    restaurantService.getProducts(restaurantId)
      .then(setProducts).catch(() => {}).finally(() => setLoading(false))
  }, [restaurantId])

  return (
    <div className="rd-card">
      <div className="rd-card-header">
        <div className="rd-card-title">
          <ShoppingBag size={15} color="#4a7a00" />
          Menu
          <span className="rd-card-badge" style={{ background: 'rgba(183,234,78,.15)', color: '#4a7a00', border: '1px solid rgba(183,234,78,.25)' }}>
            {products.length}
          </span>
        </div>
        <button onClick={onManage} className="rd-btn rd-btn-accent" style={{ padding: '6px 13px', fontSize: '.8rem' }}>
          <ChevronRight size={13} />Gérer
        </button>
      </div>

      <div className="rd-card-body">
        {loading ? (
          <div style={{ color: 'rgba(23,23,20,.4)', fontSize: '.85rem', textAlign: 'center', padding: '10px 0' }}>
            Chargement...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Package size={26} color="rgba(23,23,20,.2)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ color: 'rgba(23,23,20,.4)', margin: '0 0 10px', fontSize: '.85rem' }}>Aucun produit</p>
            <button onClick={onManage} className="rd-btn rd-btn-accent" style={{ padding: '6px 14px', fontSize: '.8rem' }}>
              Ajouter des produits
            </button>
          </div>
        ) : (
          <>
            {products.slice(0, 5).map(p => (
              <div key={p.id} className="rd-product-row">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="rd-product-img" />
                  : <div className="rd-product-ph"><Package size={14} color="rgba(23,23,20,.25)" /></div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rd-product-name">{p.name}</div>
                  {p.categoryName && <div className="rd-product-cat">{p.categoryName}</div>}
                </div>
                <div className="rd-product-price">
                  {p.price != null ? p.price.toFixed(2) : '0.00'} <span style={{ fontSize: '.7rem', color: 'rgba(74,122,0,.7)' }}>MAD</span>
                </div>
              </div>
            ))}
            {products.length > 5 && (
              <button onClick={onManage} style={{ color: '#4a7a00', fontSize: '.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 0', fontFamily: "'Jost', sans-serif" }}>
                +{products.length - 5} autres produits...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}


export default function RestaurantDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    try {
      const [resto, driversData] = await Promise.all([
        restaurantService.getMy(),
        driverService.getAvailable(),
      ])
      setRestaurant(resto)
      setDrivers(Array.isArray(driversData) ? driversData : [])
      if (resto?.id) {
        const ordersData = await orderService.getByRestaurant(resto.id)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      }
    } catch {
      toast.error('Impossible de charger le tableau de bord')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (user?.id) {
      websocketService.connect(user.id)
      websocketService.subscribe('dashboard', data => {
        if (data.type === 'NEW_ORDER')        { toast.success('Nouvelle commande reçue !'); load() }
        if (data.type === 'DRIVER_ACCEPTED')  { toast.success('Driver a accepté la livraison !'); load() }
        if (data.type === 'DRIVER_REJECTED')  { toast.error('Driver a refusé — réassignez un autre driver'); load() }
      })
    }
    return () => websocketService.unsubscribe('dashboard')
  }, [load, user])

  const handleToggle = async () => {
    setToggling(true)
    try {
      const updated = await restaurantService.toggleOpen(restaurant.id)
      setRestaurant(updated)
      toast.success(updated.open ? 'Restaurant ouvert' : 'Restaurant fermé')
    } catch {
      toast.error('Erreur lors du changement de statut')
    } finally {
      setToggling(false)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const updated = await orderService.updateStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      toast.success('Commande #' + orderId + ' — ' + (STATUS_LABELS[status] || status))
    } catch {
      toast.error('Erreur de mise à jour')
    }
  }

  const activeOrders  = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const todayRevenue  = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + (o.totalPrice || 0), 0)

  if (loading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="rd-loading">
        <RefreshCw size={22} color="#4a7a00" className="rd-spin" />
        <span>Chargement du tableau de bord...</span>
      </div>
    </>
  )

  if (!restaurant) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="rd-no-resto">
        <div style={{ width: 60, height: 60, borderRadius: 18, background: '#f2f4ed', border: '1px solid rgba(23,23,20,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={28} color="rgba(23,23,20,.2)" />
        </div>
        <p style={{ color: 'rgba(23,23,20,.45)', margin: 0, fontFamily: "'Jost', sans-serif" }}>
          Aucun restaurant trouvé. Faites une demande d'abord.
        </p>
        <button onClick={() => navigate('/apply/restaurant')} className="rd-btn rd-btn-accent">
          Faire une demande
        </button>
      </div>
    </>
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="rd-root">

        <div className="rd-header">
          <div>
            <div className="rd-brand-row">
              <div className="rd-brand-dot" />
              <span className="rd-brand-lbl">Tableau de bord</span>
            </div>
            <h1 className="rd-title">{restaurant.name}</h1>
            <p className="rd-addr">{restaurant.address}</p>
          </div>

          <div className="rd-actions">
            <button
              onClick={handleToggle} disabled={toggling}
              className={`rd-btn ${restaurant.open ? 'rd-btn-open' : 'rd-btn-closed'}`}
            >
              <Power size={14} />
              {restaurant.open ? 'Ouvert' : 'Fermé'}
            </button>
            <button onClick={() => navigate('/restaurant-admin/orders')} className="rd-btn rd-btn-accent">
              Toutes les commandes <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="rd-inner">

          <div className="rd-stats">
            <StatCard icon={ShoppingBag} label="Commandes actives" value={activeOrders.length}
              color="#4a7a00" bg="rgba(183,234,78,.1)" border="rgba(183,234,78,.25)" />
            <StatCard icon={AlertCircle} label="En attente" value={pendingOrders.length}
              color="#b45309" bg="rgba(251,191,36,.1)" border="rgba(251,191,36,.25)" />
            <StatCard icon={Users} label="Drivers en ligne" value={drivers.length}
              color="#2563eb" bg="rgba(96,165,250,.1)" border="rgba(96,165,250,.25)" />
            <StatCard icon={TrendingUp} label="Revenu livré (MAD)" value={todayRevenue.toFixed(2)}
              color="#7c3aed" bg="rgba(167,139,250,.1)" border="rgba(167,139,250,.25)" />
          </div>

          <div className="rd-grid">

            <div>
              <h2 className="rd-section-title">
                <Clock size={16} color="#4a7a00" />
                Commandes en cours
              </h2>
              {activeOrders.length === 0 ? (
                <div className="rd-empty">
                  <div className="rd-empty-icon"><CheckCircle size={24} /></div>
                  <p style={{ fontWeight: 700, color: '#171714', margin: 0 }}>Aucune commande active</p>
                  <p style={{ color: 'rgba(23,23,20,.4)', fontSize: '.85rem', margin: 0 }}>
                    Les nouvelles commandes apparaîtront ici
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeOrders.map(order => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <MenuPreview restaurantId={restaurant.id} onManage={() => navigate('/restaurant-admin/menu')} />

              <div className="rd-card">
                <div className="rd-card-header">
                  <div className="rd-card-title">
                    <Truck size={15} color="#2563eb" />
                    Drivers disponibles
                    <span className="rd-card-badge" style={{ background: 'rgba(96,165,250,.1)', color: '#2563eb', border: '1px solid rgba(96,165,250,.22)' }}>
                      {drivers.length}
                    </span>
                  </div>
                </div>
                <div className="rd-card-body">
                  {drivers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '14px 0', color: 'rgba(23,23,20,.35)' }}>
                      <XCircle size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: .3 }} />
                      <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 600 }}>Aucun driver en ligne</p>
                    </div>
                  ) : (
                    drivers.map(d => {
                      const name = d.fullName || d.name || ('Driver #' + d.id)
                      const initials = name.split(' ').filter(n => n).map(n => n[0].toUpperCase()).slice(0, 2).join('')
                      return (
                        <div key={d.id} className="rd-driver-row">
                          <div className="rd-driver-avatar" style={{ background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.22)', color: '#2563eb' }}>
                            {initials || '??'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="rd-driver-name">{name}</div>
                            <div className="rd-online">
                              <div className="rd-online-dot" />
                              <span className="rd-online-lbl">En ligne</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Gérer le menu',     icon: ShoppingBag,     path: '/restaurant-admin/menu' },
                  { label: 'Mon profil resto',  icon: LayoutDashboard, path: '/restaurant-admin/profile' },
                ].map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)} className="rd-nav-btn">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {React.createElement(item.icon, { size: 15, color: '#4a7a00' })}
                      {item.label}
                    </div>
                    <ChevronRight size={14} color="rgba(23,23,20,.35)" />
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}